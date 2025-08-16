'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl";
import { get_cookies } from "@/lib/utils/get-cookie";
import { getErrorMessage } from "@/lib/utils/get-error";
import axios from "axios";
import { NextResponse } from "next/server";


export const GET = async (req : Request) =>{``
    try {
        const forgot_email = await get_cookies("forgot_email");
        if(!forgot_email || forgot_email === ""){
            return NextResponse.json({error : "not authorized", success : false}, {status : 400})
        }
        const sessionToken = new URL(req.url).searchParams.get("sessionToken");
        if(!sessionToken || sessionToken === ""){
            return NextResponse.json({error : "session token is required", success : false}, {status : 400})
        }
        const url = await getBackendUrl()
        const res = await axios.get(`${url}/api/v1/user-service/check-forgot-password-session?sessionToken=${sessionToken}&email=${forgot_email}`)
        const data = res.data;
        if(!data.success || !data.check){
            return NextResponse.json({error : data.error, success : false}, {status : 400})
        }
        return NextResponse.json({check : data.check, email : forgot_email, success : true}, {status : 200})
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({error : error, success : false}, {status : 400})
        
    }
}