'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { CreateEntranceQuestionRequest } from "@/lib/types/quiz/quiz"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"

export async function CreateEntranceQuestionForBackend(data: CreateEntranceQuestionRequest) {
    try {
        const user_token = await get_cookies("user_token")
        if (!user_token) {
            throw new Error("unauthorized")
        }
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.success) {
            throw new Error("unauthorized")
        }

        if (!currentUser.user.admin) {
            throw new Error("unauthorized")
        }
        const url = await getBackendUrl()
        const res = await axios.post(`${url}/api/v1/entrance-question-service/create-entrance-questions`, data, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const value = res.data;
        if (!value.success) throw new Error(value.error || "failed to create entrance questions")
        return value;
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is the error in create entrance question: ", error)
        return {
            error,
            success: false,
        }

    }
}
