'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { cookies } from "next/headers"


export const verifyToken = async (token: string) => {
    try {
        if (!token || token.trim() === "" || token.length > 6) throw new Error("Invalid token")
        const url = await getBackendUrl();
        const res = await axios.post(`${url}/api/v1/user-service/verify-token`, {
            token,
        })
        const data = res.data;
        const user_token = data.token;
        if (!data.success || !user_token) throw new Error("Invalid token")
        const cookieStore = await cookies()
        cookieStore.set("user_token", user_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 15,
            path: "/",
        })
        return {
            success: true,
            message: "Token verified successfully",
        }
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is the error in the verify token action: ", error)
        return {
            error,
            success: false,
        }

    }
}