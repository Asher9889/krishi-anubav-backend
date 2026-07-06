import express from "express";
import { marketController } from "./market.module";
import { queryValidate, schemaValidate } from "../../middlewares";
import { featuredCommoditiesSchema } from "./market.schema";
const router = express.Router();


router.get("/feature", queryValidate(featuredCommoditiesSchema), marketController.getHomeScreenFeaturedCommodities)
router.get("/commodities", marketController.getCommodities)


export default router;


