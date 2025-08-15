'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
    import axios from "axios"

export const deleteQuestionById = async(id : string) =>{
    try {
        if(!id){
            return {
                error : "Id is required",
                success : false,
            }
        }
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
        const res = await axios.delete(`${backendUrl}/api/v1/question-service/delete-question/${id}`,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data
        if(!data.success){
            return {
                error : data.error,
                success : false,
            }   
        }
        return data
    } catch (error) {
        const errorMessage = getErrorMessage(error)
        return {
            error : errorMessage,
            success : false,
        }
    }
}