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
    }
};

export default apiEndPoints;