import CommodityService from "./commodity.service";

class CommodityController {
    commodityService: CommodityService;

    constructor(commodityService: CommodityService) {
        this.commodityService = commodityService;
    }

    // Controller methods will be defined here

    
}

export default CommodityController;