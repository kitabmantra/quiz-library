'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { NextResponse } from "next/server"


export async function GET(request : Request) {
   try {
    const url = await getBackendUrl()
        const res = await axios.get(`${url}/api/v1/entrance-quiz-service/get-entrance-categories`)
        const data  = res.data
        if(!data.success){
            return NextResponse.json({error : data.error, success : false}, {status : 500})
        } 
        console.log("this is data in entrance cat: ",data.data)
        return NextResponse.json({data : data.data, success : true}, {status : 200})
   } catch (error) {
    error = getErrorMessage(error)
    console.log("this is error in entrance cat: ",error)
    return NextResponse.json({error : error, success : false}, {status : 500})
    
   }
}