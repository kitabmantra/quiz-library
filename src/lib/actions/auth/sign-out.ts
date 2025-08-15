'use server'

import { delete_cookies } from "@/lib/utils/get-cookie"

export const SignOutUser = async () => {
    try {
        await delete_cookies("user_token")
        return {
            success: true,
            message: "Logged out successfully"
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to logout"
        }
    }
}
