import MarketService from './market.service';
import MarketController from './market.controller';
import MarketSyncCron from "./market-sync.cron"
import AgmarkService from "./market.agmarkService";
import { translationService } from '../translations';


const agmarkService = new AgmarkService();
const marketService = new MarketService(agmarkService, translationService);
const marketController = new MarketController(marketService);

const marketSyncCron = new MarketSyncCron(marketService);


marketService.fetchAllCommoditiesForCache(); // for map cache
marketSyncCron.loadAllAgmarkCommodityPrices()
marketSyncCron.loadMasterCommodities();

export { marketService, marketController, marketSyncCron };