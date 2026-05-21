import axios from "axios";
import { BASE_API_URL } from "../utils";

const getAllUsersApi = async () => {

    let config = {
        method: "GET",
        url: `${BASE_API_URL}users`,
        headers: {
            Accept: "application/json",
        },
    };
    try {
        let result: any = await axios(config);
        return result?.data;
    } catch (error: any) {
        return error?.response?.data;
    }
};

const getUserMessagesApi = async (identifier: string, page = 1, limit = 50) => {
    let config = {
        method: "GET",
        url: `${BASE_API_URL}users/${identifier}/messages?page=${page}&limit=${limit}`,
        headers: {
            Accept: "application/json",
        },
    };
    try {
        let result: any = await axios(config);
        return result?.data;
    } catch (error: any) {
        return error?.response?.data;
    }
};

const markMessagesReadApi = async (identifier: string) => {
    let config = {
        method: "PATCH",
        url: `${BASE_API_URL}users/${identifier}/read`,
        headers: {
            Accept: "application/json",
        },
    };
    try {
        let result: any = await axios(config);
        return result?.data;
    } catch (error: any) {
        return error?.response?.data;
    }
};

const sendMessageApi = async (phone: string, message: string) => {
    let config = {
        method: "POST",
        url: `${BASE_API_URL}messages/send`,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        data: {
            phone,
            message,
        },
    };
    try {
        let result: any = await axios(config);
        return result?.data;
    } catch (error: any) {
        return error?.response?.data;
    }
};

export default {
    getAllUsersApi,
    getUserMessagesApi,
    markMessagesReadApi,
    sendMessageApi
};
