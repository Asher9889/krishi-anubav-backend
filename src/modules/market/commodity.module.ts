import CommodityService from './commodity.service';
import CommodityController from './commodity.controller';

const commodityService = new CommodityService();
const commodityController = new CommodityController(commodityService);

export { commodityService, commodityController };