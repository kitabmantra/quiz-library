'use server'

import { CreateEntranceQuestionRequest } from "@/lib/types/quiz/quiz"

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie";
import axios from "axios";
import { getBackendUrl } from "@/lib/utils/get-backendurl";

export interface CreateEntranceType{
    entranceName  : string,
    type : "entrance" | "academic"
}

export async function createEntrance(data: CreateEntranceType) {
    try {
        const { entranceName, type } = data;
        if (!entranceName || !type) throw new Error("Invalid request")
        const user_token = await get_cookies("user_token");
        if (!user_token) throw new Error("unauthorized")
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.success || !currentUser.user.admin) throw new Error("User not found")
        const url = await getBackendUrl();
        const res = await axios.post(`${url}/api/v1/entrance-service/create-entrance`, data, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const value = res.data;
        if (!value.success) throw new Error(value.error)
        return value;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            success: false,
            error: error
        }

    }
}