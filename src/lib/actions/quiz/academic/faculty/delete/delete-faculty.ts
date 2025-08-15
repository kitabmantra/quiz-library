'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"


export const deleteFaculty = async(facultyId : string) =>{
    try {
        if(!facultyId) throw new Error("Faculty ID is required")
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("Unauthorized")
        }
        const user = await getCurrentUser()
        if(!user || !user.success){
            throw new Error("Unauthorized")
        }
        if(!user.user.admin){
            throw new Error("Unauthorized")
        }
        const url = await getBackendUrl()
        const res = await axios.delete(`${url}/api/v1/faculty-service/delete-academic-faculty/${facultyId}`,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        if(!data.success){
            throw new Error(data.error)
        }
        return data;
    } catch (error) {
        error = getErrorMessage(error)
        console.log("error in deleteFaculty",error)
        return {error, success : false}
    }
}