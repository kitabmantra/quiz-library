'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { cookies } from "next/headers"


export const loginUser = async(values : LoginUserType) =>{
    try {
        if(!values.email || !values.password) throw new Error("All fields are required")
        const url = await getBackendUrl()
        const res = await axios.post(`${url}/api/v1/user-service/login`,values)
        const data = res.data;
        const token = data.token;
        if(!token || !data.success) throw new Error("Invalid credentials")
        const cookieStore = await cookies();
        cookieStore.set("user_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            path: '/',
        });
        return {
            message : data.message,
            success : true,
        }
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this ish the error in login user : ",error)
        return {
            error,
            success  : false
        }
    }
}