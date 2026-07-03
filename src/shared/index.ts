import { containsHindi, todayISODate, toISODate } from "./utils";


const languageRegex = {
    containsHindi: containsHindi   
}

const helpers = {
    toISODate: toISODate,
    todayISODate: todayISODate
}


export { languageRegex, helpers };