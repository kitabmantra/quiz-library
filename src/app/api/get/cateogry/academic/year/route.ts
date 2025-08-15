'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user";
import { getBackendUrl } from "@/lib/utils/get-backendurl";
import { get_cookies } from "@/lib/utils/get-cookie";
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios";
import { NextResponse } from "next/server"

export async function GET(request: Request){
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("Unauthorized")
        }
        const user = await getCurrentUser();
        if(!user || !user.success){
            throw new Error("Unauthorized")
        }
        if(!user.user.admin){
            throw new Error("Unauthorized")
        }
       
        const {searchParams} = new URL(request.url);
        const typeName = searchParams.get("typeName");
        const levelName = searchParams.get("levelName");
        const faculty = searchParams.get("faculty");
        if(!typeName || !levelName || !faculty){
            throw new Error("All fields are required")
        }
        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/year-service/get-year/${typeName}/${levelName}/${faculty}`,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        if(!data.success){
            throw new Error(data.error)
        }
        if(data.success && data.years === null){
            data.years = []
        }
        console.log("data in getting the data : ",data)
        return NextResponse.json(data,{status:200})
    } catch (error) {
        error = getErrorMessage(error)
        console.log("error in getting hte data : ",error)
        return NextResponse.json({
            success:false,
            error
        },{status:500})
        
    }
    
}