'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"
import { NextResponse } from "next/server"


const  defaultLimit = 100
const  defaultPerPage = 1


export async function GET(req : Request){
    try {
        const {searchParams} = new URL(req.url)
        const search = searchParams.get("search")
        const yearName = searchParams.get("yearName")
        const faculty = searchParams.get("faculty")
        const levelName = searchParams.get("levelName")
        const limit = searchParams.has("page") ? parseInt(searchParams.get("page")!,10) : defaultLimit;
        const offset = searchParams.has("offset") ? parseInt(searchParams.get("offset")!,10) : defaultPerPage;
        const typeName = "academic"
        if(yearName == "" || faculty == "" || levelName == "" ){
            throw new Error("invalid search params")
        }
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("unauthorized")
        }
        const user = await getCurrentUser();
        if(!user || !user.success || !user.user.admin){
            throw new Error("unauthorized")
        }
        const url = await getBackendUrl()
        const res = await axios.get(`${url}/api/v1/question-service/get-all-questions-by-year?search=${search}&yearName=${yearName}&faculty=${faculty}&levelName=${levelName}&typeName=${typeName}&offset=${offset}&limit=${limit}`,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        if(!data.success)throw new Error(data.message)
        console.log("this is the data of the questions  : ",data)
        return NextResponse.json({data},{status : 200})
    } catch (error) {
        error =getErrorMessage(error)
        return NextResponse.json({error, success : false,},{status : 500})
        
    }
}