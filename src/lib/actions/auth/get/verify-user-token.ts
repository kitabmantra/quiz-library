'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function verifyUserToken(token: string){
    try {
        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/user-service/verify-token?token=${token}`)
        const data = res.data;
        console.log("this is the data : ",data)
        const usertoken =  data.token;
        if(!data.success || !usertoken){
            throw new Error(data.error)
        }

        const cookieStore = await cookies()
        const expires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        cookieStore.set("user_token", data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires,
            path: '/',
        });

        return {message : data.message, success : data.success}
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is the error : ",error)
        return NextResponse.json({error}, {status: 500})
    }
}