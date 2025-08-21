'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"

export type    UserQuestionType = {
    questionId: string
    userAnswer: string
    isCorrect: boolean
    isTimeOut: boolean
    timeSpent: number
}
export type UserHistoryType = {
    correctQuestions: UserQuestionType[]
    wrongQuestions: UserQuestionType[]
}

export const createUserHistory = async (userQuestions: UserHistoryType) => {
    try {
        if(!userQuestions || (userQuestions.correctQuestions.length === 0 && userQuestions.wrongQuestions.length === 0)) {
            return {
                error: 'No questions provided',
                success: false
            }
        }
        const currentUser = await getCurrentUser()
        if(!currentUser) {
            return {
                error: 'User not found',
                success: false
            }
        }
        const user_token = await get_cookies('user_token')
        if(!user_token) {
            return {
                error: 'User token not found',
                success: false
            }
        }
        const url = await getBackendUrl();
        console.log("this queiost data : ",userQuestions)
        const res = await axios.post(`${url}/api/v1/quiz-service/create-user-quiz-history`, userQuestions,{
            withCredentials: true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        console.log(res.data)
        const data = res.data;
        if(!data.success){
            return {
                error: data.error,
                success: false
            }
        }
        return {
            success: true,
            message: data.message
        }
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error , success :false
        }
        
    }
}