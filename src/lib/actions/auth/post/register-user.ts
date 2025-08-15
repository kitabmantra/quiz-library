'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"



export const registerUser = async(values : RegisterUserType) =>{
    try {
        if(!values.firstName || !values.lastName || !values.email || !values.password || !values.confirmPassword || !values.phoneNumber){
           throw new Error("All fields are required")
        }
        if(values.password !== values.confirmPassword){
            throw new Error("Password and confirm password do not match")
        }
        if(values.password.length < 6){
            throw new Error("Password must be at least 6 characters")
        }
        const url = await getBackendUrl();
        const res = await axios.post(`${url}/api/v1/user-service/register`,values)
        const data =res.data;
        console.log("this is hte data erro : ",data)
        if(!data.success){
            throw new Error(data.error)
        }
        console.log("data in registerign : ",data)
        return data;
    } catch (error) {
        error = getErrorMessage(error)
        console.log("error in registerign : ",error)
        return {
            error,
            success :false
        }
        
    }

}