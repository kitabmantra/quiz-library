'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { delete_cookies, get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { cookies } from "next/headers"


export const getCurrentUser = async() =>{
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token) throw new Error("user token not found")
        const url = await getBackendUrl()
    const res = await axios.get(`${url}/api/v1/user-service/get-user-by-token`,{
        withCredentials : true,
        headers : {
            Cookie : `user_token=${user_token}`
        }
    })
    const data = res.data;
    if(!data.success || !data.user) throw new Error("user not found")
    return data;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error,
            success : false,
        }
        
    }
}