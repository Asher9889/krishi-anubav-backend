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
};

export default apiEndPoints;