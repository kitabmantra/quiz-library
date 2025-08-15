'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user";
import { getBackendUrl } from "@/lib/utils/get-backendurl";
import { get_cookies } from "@/lib/utils/get-cookie";
import { getErrorMessage } from "@/lib/utils/get-error";
import axios from "axios";



export interface CreateYearRequestType {
    levelName : string;
    typeName : "academic" | "entrance";
    faculty : string;
    yearName : string;
}

export const createYear = async (request : CreateYearRequestType) => {
    const {levelName, typeName, faculty, yearName} = request;
    try {
        if(!levelName || !typeName || !faculty || !yearName) throw new Error("Invalid request");
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
        const url = await getBackendUrl();
        const res  = await axios.post(`${url}/api/v1/year-service/create-year`, request,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data =res.data;
        if(!data.success) throw new Error(data.error || "Failed to create year");
        return {success : true, message : "Year created successfully"};
    } catch (error) {
     error= getErrorMessage(error)        
     return {success : false, error }
    }
}