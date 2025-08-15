'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"

export type UpdateAcademicLevelType = {
    id: string,
    levelName: string,
    type: "academic" | "entrance",
    oldName: string
}

export const updateAcademicLevel = async (values: UpdateAcademicLevelType) => {
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("Unauthorized")
        }
        const user = await getCurrentUser();
        if (!user || !user.success) {
            throw new Error("Unauthorized")
        }
        if (!user.user.admin) {
            throw new Error("Unauthorized")
        }
        const formData = {
            levelName: values.levelName,
            type: values.type,
            oldName: values.oldName
        }
        const url = await getBackendUrl();
        const res = await axios.put(`${url}/api/v1/category-service/update-academic-level-category/${values.id}`, formData,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        if (!data.success) throw new Error(data.error)
        console.log("data after updating academic level", data)
        return data;
    } catch (error) {
        error = getErrorMessage(error)
        console.log("error while updating academic level", error)
        return { error, success: false }
    }
}