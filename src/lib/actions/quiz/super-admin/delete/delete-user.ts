'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"


export const deleteUser = async(email : string) =>{
    try {
        if(!email) throw new Error("user not authorized")
            const user_token = await get_cookies("user_token")
        if(!user_token) throw new Error("user not authorized")
        const currentUser = await getCurrentUser();
        
    if(!currentUser || !currentUser.user || !currentUser.user.superAdmin) throw new Error("user not authorized")
        const url = await getBackendUrl();
    const res = await axios.delete(`${url}/api/v1/super-admin-service/delete-user/${email}`,{
        withCredentials : true,
        headers : {
            Cookie : `user_token=${user_token}`
        }
    })
    const data = res.data;
    console.log("this sihte delete session : ",data)
    if(!data.success){
        throw new Error("failed to delete the user")
    }
    return {
        success : true,
        message : "user deleted successfully",
    };
    } catch (error) {
        error =getErrorMessage(error)
        console.log("error in deleting user : ",error)
        return {
            error, success : false,
        }
        
    }
}