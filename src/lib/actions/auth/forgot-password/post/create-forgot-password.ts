'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { cookies } from "next/headers"

export const createForgotPasswordSession = async (email : string) =>{
    try {
        if (!email || email === ""){
            return {
                success : false,
                error : "Email is required"
            }
        }
        console.log("this is the email in creating forgot password session : ", email)
        const url = await getBackendUrl();
        const  res = await axios.post(`${url}/api/v1/user-service/forget-password`,{
            email
        })
        const data = res.data;
        const sessionToken = data.sessionToken;
        if(!sessionToken || !data.success){
            return {
                success : false,
                error : data.error || "Failed to create forgot password session"
            }
        }
        const cookieStore = await cookies();
        cookieStore.set("forgot_email", email, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        })
        return {
            success : true,
            message : "Forgot password session created successfully",
            sessionToken
        }

    } catch (error) {
        error =getErrorMessage(error)
        console.log("this is the error in creating forgot password session : ", error)
        return {
            success : false,
            error
        }
        
    }
}