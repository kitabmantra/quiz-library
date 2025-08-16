'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { NextResponse } from "next/server"
import axios from "axios"
import { get_cookies } from "@/lib/utils/get-cookie"

export async function GET(req: Request){
    try {
        
        const email = await get_cookies("user_email")
        if(!email || email === ""){
            return NextResponse.json({error: "not authorized"}, {status: 400})
        }
        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/user-service/check-user-exists-in-redis?email=${email}`)
        const data = res.data;
        if(!data.success){
            return NextResponse.json({error: data.error}, {status: 400})
        }
        return NextResponse.json({message : data.message, success : data.success},{status : 200})
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is the error : ",error)
        return NextResponse.json({error}, {status: 500})
    }
}