import CommodityGroupModel from "./commodity-group.model";
import CommodityModel from "./commodity.model";
import MarketPriceModel from "./market-price.model";
import AgmarkService from "./market.agmarkService";
import pLimit from "p-limit";
import { COMMODITY_GROUP_TRANSLATION_DATA } from "./commodity.translation-data";
import { logger } from "../../config/index";
import TranslationService from "../translations/translation.service";
import { TCommodityCacheData, THomeScreenFeaturedCommoditiesBody } from "./maket.types";
import Bottleneck from "bottleneck";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";

const limiter = new Bottleneck({
  minTime: 4000,
  maxConcurrent: 1,
});

const BATCH_SIZE = 20;

class MarketService {
  private commodityMap = new Map<string, TCommodityCacheData>();

  agmarkService: AgmarkService;
  translationService: TranslationService; // Assuming you have a translation service

  constructor(agmarkService: AgmarkService, translationService: TranslationService) {
    this.agmarkService = agmarkService;
    this.translationService = translationService;
  }

  getAllCommodities = async (options: { language: string }) => {
    try {
      logger.info("Fetching all commodities from the database...");
      const { language } = options;

      if (language !== "en" && language !== "hi") {
        throw new ApiError(StatusCodes.BAD_REQUEST,
          "Invalid language parameter. Supported values are 'en' and 'hi'.");
      }

      const commodities = await CommodityModel.find({},
        { _id: 1, agmarkCommodityName: 1, translations: 1, agmarkCommodityId: 1, agmarkGroupId: 1 }).lean();
      logger.info(`Fetched ${commodities.length} commodities from the database.`);
      return commodities.map(({ _id, translations, ...rest }) => ({
        id: _id.toString(),
        name: translations?.[language as "en" | "hi"] || rest.agmarkCommodityName,
        ...rest,
      }));
    } catch (error: any) {
      logger.error(`Failed to fetch all commodities. Error: ${error.message}`);
      throw error;
    }
  }

  getHomeScreenFeaturedCommodities = async (locationData: THomeScreenFeaturedCommoditiesBody) => {
    const { districtName, cityName, fromDate, toDate } = locationData;

    logger.info(`Location Data is: ${JSON.stringify(locationData)}`);
    try {

      if (!districtName || districtName.trim() === "") {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "District name is required");
      }
      const filter: any = {
        arrivalDate: { $gte: fromDate, $lte: toDate },
        districtName: { $regex: cityName, $options: "i" },
        //  districtName: /kanpur/i
        // { districtName: { $regex: new RegExp(`^${cityName}$`, "i") } },
      }
      // if(cityName){ 
      //   filter["cityName"] = { $regex: cityName, $options: "i" };
      // }

      console.log(`Fetching featured commodities with filter: ${JSON.stringify(filter)}`);

      const [featuredCommodities, count] = await Promise.all([
        MarketPriceModel.find(filter).lean(),
        MarketPriceModel.find(filter).countDocuments()

      ])

      const returnedCommodities = featuredCommodities.map(({ _id, createdAt, updatedAt, ...rest }, index) => {
        return {
          id: _id.toString(),
          ...rest,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        }
      });
      return { commodities: returnedCommodities, count };
    } catch (error: any) {

    }

  }


  loadAllMasterCommodities = async () => {
    // Implementation to load all commodities
    const { cmdt_data, cmdt_group_data } = await this.agmarkService.getAllAgmarkMasterData();

    const dbGroupNameMap = new Map<number, { translations: { hi: string, en: string } }>();

    cmdt_group_data.forEach(group => {
      const en = COMMODITY_GROUP_TRANSLATION_DATA[group.id]?.en || group.cmdt_grp_name;
      const hi = COMMODITY_GROUP_TRANSLATION_DATA[group.id]?.hi || "";
      dbGroupNameMap.set(group.id, { translations: { hi, en } });
    });

    logger.info(`Fetched ${cmdt_data.length} commodities and ${cmdt_group_data.length} commodity groups from Agmark API.`);


    const dbLikeGroupData = cmdt_group_data.map(group => {
      if (!dbGroupNameMap.has(group.id)) {
        logger.warn(`No translation data found for commodity group ID: ${group.id}. So returning the flow`);
      }
      const translations = dbGroupNameMap.get(group.id)?.translations ?? null;

      return {
        agmarkGroupId: group.id,
        agmarkGroupName: group.cmdt_grp_name,
        translations: {
          en: translations?.en || group.cmdt_grp_name,
          hi: translations?.hi || "",
        }
      }
    })


    const limit = pLimit(5);

    const dbLikeCommodityData = await Promise.all(
      cmdt_data.map(commodity => {
        return limit(async () => {
          let res;
          try {
            res = await this.translationService.translate(commodity.cmdt_name, "hi");
          } catch (error: any) {
            logger.info(`Translation failed for commodity: ${commodity.cmdt_name}. Error: ${error.message}`);
          }
          res = res ?? { translatedText: "" }; // Default to empty string if translation fails

          return {
            agmarkCommodityId: commodity.cmdt_id,
            agmarkGroupId: commodity.cmdt_group_id,
            agmarkCommodityName: commodity.cmdt_name,
            translations: {
              en: commodity.cmdt_name, // Assuming English translation is not available in the API response
              hi: res.translatedText, // Assuming Hindi translation is not available in the API response
            },
            imageUrl: "", // Assuming imageUrl is not available in the API response
            category: dbGroupNameMap.get(commodity.cmdt_group_id)?.translations.en || "", // Assuming category is not available in the API response
            searchable: true, // Default value
            syncEnabled: true, // Default value
          }

        })
      }
      ));

    const operations = dbLikeCommodityData.map(commodity => ({
      updateOne: {
        filter: {
          agmarkCommodityId: commodity?.agmarkCommodityId,
        },

        update: {
          $set: commodity,
        },

        upsert: true,
      },
    }));

    const groupOperations = dbLikeGroupData.map(group => ({
      updateOne: {
        filter: {
          agmarkGroupId: group?.agmarkGroupId,
        },

        update: {
          $set: group,
        },

        upsert: true,
      },
    }));

    const [cmdtGroupData, cmdtData] = await Promise.allSettled([
      CommodityGroupModel.bulkWrite(groupOperations),
      CommodityModel.bulkWrite(operations)
    ]);
    cmdtGroupData.status === "fulfilled" ? logger.info(`Commodity groups synced successfully. Matched: ${cmdtGroupData.value.matchedCount}, Upserted: ${cmdtGroupData.value.upsertedCount}`) : logger.error(`Failed to sync commodity groups. Error: ${cmdtGroupData.reason}`);
    cmdtData.status === "fulfilled" ? logger.info(`Commodities synced successfully. Matched: ${cmdtData.value.matchedCount}, Upserted: ${cmdtData.value.upsertedCount}`) : logger.error(`Failed to sync commodities. Error: ${cmdtData.reason}`);
  }

  // getAllAgmarkCommodityPrices = async () => {
  //   try {
  //     const tasks = [...this.commodityMap.values()].map((commodity) => {
  //       logger.info(`Starting ${commodity.commodityId}`);
  //       const prices = limiter.schedule(() =>
  //         this.agmarkService.getAllAgmarkCommodityPrices({
  //           groupId: commodity.groupId,
  //           commodityId: commodity.commodityId,
  //         })
  //       )
  //       logger.info(`Completed ${commodity.commodityId}`);
  //       return prices;
  //     });


  //     const results = await Promise.allSettled(tasks);

  //     logger.info(`Fetched ${results.length} commodity price results from Agmark API.`);

  //     const commodityPrices = results.filter((result) => result.status === "fulfilled").flatMap(result => result.value);
  //     const failed = results.filter(r => r.status === "rejected");

  //     logger.info(`Fetched ${commodityPrices.length} prices. Failed requests: ${failed.length}`);


  //     // const commodityPrices = await this.agmarkService.getAllAgmarkCommodityPrices({ groupId: 1, commodityId: 3 }); // Example groupId and commodityId, you can modify as needed
  //     logger.info(`Fetched ${commodityPrices.length} commodity prices from Agmark API.`);

  //     const operations = commodityPrices.map((item) => {
  //       item.commodityId = this.commodityMap.get(item.commodityName.toLowerCase())?.id ?? null; // Assign the commodityId from the commodityMap
  //       return {

  //         updateOne: {
  //           filter: {
  //             stateName: item.stateName,
  //             districtName: item.districtName,
  //             marketName: item.marketName,
  //             gradeName: item.gradeName,
  //             varietyName: item.varietyName,
  //             arrivalDate: item.arrivalDate, // Convert to ISO format
  //           },
  //           update: item,
  //           upsert: true,
  //         },
  //       }
  //     });

  //     const comm = await MarketPriceModel.bulkWrite(operations);
  //     comm.ok === 1 ? logger.info(`Commodity prices synced successfully. Matched: ${comm.matchedCount}, Upserted: ${comm.upsertedCount}`) : logger.error(`Failed to sync commodity prices. Error: ${comm.getWriteConcernError()}`);

  //     return { success: true, message: "Commodity prices synced successfully." };
  //   } catch (error: any) {
  //     logger.error(`Failed to fetch Agmark commodity prices. Error: ${error.message}`);
  //     throw error;
  //   }
  // }



  getAllAgmarkCommodityPrices = async () => {
    try {
      const commodities = [...this.commodityMap.values()];

      logger.info(`Starting sync for ${commodities.length} commodities.`);

      for (let i = 0; i < commodities.length; i += BATCH_SIZE) {
        const batch = commodities.slice(i, i + BATCH_SIZE);

        logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}. Batch size: ${batch.length}`);

        const tasks = batch.map((commodity) =>
          limiter.schedule(async () => {
            logger.info(`Fetching commodity ${commodity.commodityId} (Group ${commodity.groupId})`);

            const prices = await this.agmarkService.getAllAgmarkCommodityPrices({
              groupId: commodity.groupId,
              commodityId: commodity.commodityId,
            });

            logger.info(
              `Fetched ${prices.length} prices for commodity ${commodity.commodityId}`
            );

            return prices;
          })
        );

        const results = await Promise.allSettled(tasks);

        const fulfilled = results.filter(
          (
            result
          ): result is PromiseFulfilledResult<
            Awaited<ReturnType<typeof this.agmarkService.getAllAgmarkCommodityPrices>>
          > => result.status === "fulfilled"
        );

        const failed = results.filter(
          (result) => result.status === "rejected"
        );


        const commodityPrices = fulfilled.flatMap((result) => result.value);

        logger.info(
          `Batch completed. Success: ${fulfilled.length}, Failed: ${failed.length}`
        );

        if (commodityPrices.length === 0) {
          logger.warn("No commodity prices found in this batch.");
          continue;
        }

        // Translate commodity prices
        await Promise.all(
          commodityPrices.map(async (item) => {
            const [
              districtNameHi,
              marketNameHi,
              stateNameHi,
              gradeNameHi,
              varietyNameHi,
              commodityGroupNameHi,
              commodityNameHi,
            ] = await Promise.all([
              this.translationService.translate(item.districtName, "hi"),
              this.translationService.translate(item.marketName, "hi"),
              this.translationService.translate(item.stateName, "hi"),
              this.translationService.translate(item.gradeName, "hi"),
              this.translationService.translate(item.varietyName, "hi"),
              this.translationService.translate(item.commodityGroupName, "hi"),
              this.translationService.translate(item.commodityName, "hi"),
            ]);

            item.districtNameHi = districtNameHi.translatedText;
            item.marketNameHi = marketNameHi.translatedText;
            item.stateNameHi = stateNameHi.translatedText;
            item.gradeNameHi = gradeNameHi.translatedText;
            item.varietyNameHi = varietyNameHi.translatedText;
            item.commodityGroupNameHi = commodityGroupNameHi.translatedText;
            item.commodityNameHi = commodityNameHi.translatedText;
          })
        );

        const operations = commodityPrices.flatMap((item) => {
          const commodityId = this.commodityMap.get(item.commodityName.toLowerCase())?.id;

          if (!commodityId) {
            logger.warn(`Commodity not found in cache: ${item.commodityName}`);
            return [];
          }

          return [{
            updateOne: {
              filter: {
                commodityId: commodityId,
                stateName: item.stateName,
                districtName: item.districtName,
                marketName: item.marketName,
                gradeName: item.gradeName,
                varietyName: item.varietyName,
                arrivalDate: item.arrivalDate,
              },
              update: {
                $set: { ...item, commodityId },
              },
              upsert: true,
            },
          }];
        });

        const result = await MarketPriceModel.bulkWrite(operations);

        logger.info(
          `Batch synced. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`
        );
      }

      logger.info("Commodity sync completed successfully.");

      return {
        success: true,
        message: "Commodity prices synced successfully.",
      };
    } catch (error: any) {
      logger.error(
        `Failed to sync commodity prices. Error: ${error.message}`
      );
      throw error;
    }
  };

  fetchAllCommoditiesForCache = async () => {
    try {
      logger.info("Fetching all commodities for cache...");
      const commodities = await CommodityModel.find({}, { _id: 1, agmarkCommodityName: 1, translation: 1, agmarkCommodityId: 1, agmarkGroupId: 1, }).lean();
      const comm = commodities.map(({ _id, ...rest }, _) => {

        this.commodityMap.set((rest.agmarkCommodityName).toLowerCase(), { id: _id, groupId: rest.agmarkGroupId, commodityId: rest.agmarkCommodityId });
        return this.commodityMap;
      });
      logger.info(`Total cache size of commodities: ${this.commodityMap.size})`);

      return comm;
    } catch (error: any) {
      logger.error(`Failed to fetch all commodities. Error: ${error.message}`);
      throw error;
    }
  }

}

export default MarketService;