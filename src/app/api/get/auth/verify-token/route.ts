'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { NextResponse } from "next/server"
import axios from "axios"

export async function GET(req: Request){
    try {
        const {searchParams} = new URL(req.url)
        const token = searchParams.get("token")
        if(!token){
            return NextResponse.json({error: "Token is required"}, {status: 400})
        }
        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/user-service/verify-token?token=${token}`)
        const data = res.data;
        const usertoken =  data.token;
        if(!data.success || !usertoken){
            return NextResponse.json({error: data.error}, {status: 400})
        }
        const response = NextResponse.json({data},{status : 200})
        const expires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        response.cookies.set("user_token", data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires,
            path: '/',
        });

        return response;
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({error}, {status: 500})
    }
}