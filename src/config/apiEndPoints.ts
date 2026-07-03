import envConfig from "./env.config";

const apiEndPoints = {

    auth: {
        sendOTP: {
            url: "/sendOtp",
            method: "POST",
        },
        verifyOTP: {
            url: "/verifyOtp",
            method: "POST",
        },
    },
    AI: {
        createPost: {
            url: "/quick-upload",
            method: "POST",
        },
    },

    translation: {
        translate: {
            url: "/translate",
            method: "POST",
        },
    },

    agmark: {
        getAllData: {
            url: "/daily-price-arrival/filters",
            method: "GET",
        },
        getAllCommodityPrices: {
            url: "/daily-price-arrival/report",
            method: "POST",
        }
    }
};

export default apiEndPoints;