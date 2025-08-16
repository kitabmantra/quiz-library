'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"

export const RemoveFromAdmin = async (userId: string) => {
    try {
        if (!userId) throw new Error("invalid userid")
        const user_token = await get_cookies("user_token")
        if (!user_token) throw new Error("user not authorized")
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.user || !currentUser.user.superAdmin) throw new Error("user not authorized")
        const url = await getBackendUrl();
        const res = await axios.put(`${url}/api/v1/super-admin-service/remove-user-from-admin/${userId}`, {}, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = res.data;
        if (!data.success) throw new Error("failed to remove from admin")
        return data;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error, success: false
        }
    }
}
