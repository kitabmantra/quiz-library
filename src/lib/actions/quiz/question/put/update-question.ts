'use server'

import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions";
import { getErrorMessage } from "@/lib/utils/get-error";
import axios from "axios";
import { getCurrentUser } from "@/lib/actions/user/get-current-user";
import { getBackendUrl } from "@/lib/utils/get-backendurl";
import { get_cookies } from "@/lib/utils/get-cookie";

export async function updateQuestion(question: Question) {
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token){
            return {
                error : "Unauthorized",
                success : false,
            }
        }
       const user = await getCurrentUser()
       if(!user || !user.success){
        return {
            error : "Unauthorized",
            success : false,
        }
       }
       if(!user.user.admin){
        return {
            error : "Unauthorized",
            success : false,
        }
       }
       const backendUrl = await getBackendUrl()
       const res = await axios.put(`${backendUrl}/api/v1/question-service/update-question`, question,{
        withCredentials : true,
        headers : {
            Cookie : `user_token=${user_token}`
        }
       })
       const data =res.data
       if(!data.success){
        return {
            error : data.error,
            success : false,
        }
       }
       return data
       
    } catch (error) {
       error = getErrorMessage(error)
       console.log("this is error in question update: ",error)
       return {
        error, success : false,
       }
    }
}