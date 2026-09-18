import cron from "node-cron";
import MarketService from "./market.service";
import { logger } from "../../config/index";

class MarketSyncCron {
  marketService: MarketService;

  constructor(marketService: MarketService) {
    this.marketService = marketService;
  }

  loadMasterCommodities = () => {
    
    cron.schedule("*/40 * * * *", async () => {
      try {
        logger.info("Starting master commodity sync...");
        await this.marketService.loadAllMasterCommodities();
        logger.info("Master commodity sync completed successfully.");
      } catch (error:any) {
        logger.error("Error during commodity sync:" +  JSON.stringify(error.message));
      }
    });
  };

  loadAllAgmarkCommodityPrices = () => {
    cron.schedule("0 */6 * * *", async () => {
      try {
        logger.info("Starting Agmark commodity price sync...");
        await this.marketService.getAllAgmarkCommodityPrices();
        logger.info("Agmark commodity price sync completed successfully.");
      } catch (error:any) {
        logger.error("Error during Agmark commodity price sync:" +  JSON.stringify(error.message));
      }
    });
  }
}  

export default MarketSyncCron;