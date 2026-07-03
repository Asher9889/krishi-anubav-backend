import { z } from "zod";
import { helpers } from "../../shared";

const todayISODate = helpers.todayISODate!;

const featuredCommoditiesSchema = z.object({
    fromDate: z.iso.date().optional().default(todayISODate),
    toDate: z.iso.date().optional().default(todayISODate),
    cityName: z.string().nonempty("City name is required").min(2, "City name must be at least 2 characters long").max(100, "City name must be at most 100 characters long"),
    districtName: z.string().nonempty("District name is required").min(2, "District name must be at least 2 characters long").max(100, "District name must be at most 100 characters long")
});

export { featuredCommoditiesSchema }