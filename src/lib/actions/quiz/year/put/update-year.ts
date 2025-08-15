'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user";
import { getBackendUrl } from "@/lib/utils/get-backendurl";
import { get_cookies } from "@/lib/utils/get-cookie";
import { getErrorMessage } from "@/lib/utils/get-error";
import axios from "axios";

export interface UpdateYearRequestType {
    id: string;
    yearName: string;
    type : "academic" | "entrance"
    levelName : string
    faculty : string
}

export const updateYear = async (request: UpdateYearRequestType) => {
    const { id, yearName, type, levelName, faculty } = request;
    try {
        if (!id || !yearName || !type || !levelName || !faculty) throw new Error("Invalid request");
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
        const res = await axios.put(`${url}/api/v1/year-service/update-year/${id}`, {yearName, type, levelName, faculty },{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        if (!data.success) throw new Error(data.error || "Failed to update year");
        return { success: true, message: "Year updated successfully" };
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return { success: false, error: errorMessage };
    }
}