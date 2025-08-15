'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"

export interface UpdateEntranceQuestionRequest {
    id: string
    question: string
    options: string[]
    correctAnswer: string
    difficulty: "easy" | "medium" | "hard"
    tags: string[]
    priority: number
    hint?: string
    subjectName: string
    referenceUrl?: string
}

export async function updateEntranceQuestion(data: UpdateEntranceQuestionRequest) {
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
        const res = await axios.put(`${url}/api/v1/entrance-question-service/update-entrance-question`, data, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const value = res.data;
        if (!value.success) throw new Error(value.error || "failed to update entrance question")
        return value;
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is the error in update entrance question: ", error)
        return {
            error,
            success: false,
        }

    }
}
