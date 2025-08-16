'use server'

import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"

type ResetPasswordType = {
    email: string,
    sessionToken: string,
    password: string,
    token: string,
}

export const resetForgotPassword = async (resetPassword: ResetPasswordType) => {
    try {
        if (!resetPassword.password || resetPassword.password.trim() === "") {
            return {
                success: false,
                error: "New password is required"
            }
        }

        if (resetPassword.password.length < 6) {
            return {
                success: false,
                error: "Password must be at least 6 characters long"
            }
        }

        if (!resetPassword.token || resetPassword.token.trim() === "" || resetPassword.token.length !== 6) {
            return {
                success: false,
                error: "Invalid OTP. Please enter a 6-digit code."
            }
        }

        if (!resetPassword.sessionToken || resetPassword.sessionToken.trim() === "") {
            return {
                success: false,
                error: "Session token is required"
            }
        }

        if (!resetPassword.email || resetPassword.email.trim() === "") {
            return {
                success: false,
                error: "Email is required"
            }
        }

        const url = await getBackendUrl();
        const res = await axios.post(`${url}/api/v1/user-service/reset-password`, {
            email: resetPassword.email,
            sessionToken: resetPassword.sessionToken,
            newPassword: resetPassword.password,
            token: resetPassword.token
        })

        const data = res.data;
        if (!data.success) {
            return {
                success: false,
                error: data.error || "Failed to reset password"
            }
        }

        return {
            success: true,
            message: "Password reset successfully"
        }

    } catch (error) {
        error = getErrorMessage(error)
        console.log("Error in resetting password:", error)
        return {
            success: false,
            error: error
        }
    }
}

// Keep the original OTP verification function for the OTP verification step
export const verifyForgotPasswordOTP = async (otp: string, sessionToken: string) => {
    try {
        if (!otp || otp.trim() === "" || otp.length !== 6) {
            return {
                success: false,
                error: "Invalid OTP. Please enter a 6-digit code."
            }
        }

        if (!sessionToken || sessionToken.trim() === "") {
            return {
                success: false,
                error: "Session token is required"
            }
        }

        const forgot_email = await get_cookies("forgot_email");
        if (!forgot_email || forgot_email === "") {
            return {
                success: false,
                error: "Session expired. Please start the password reset process again."
            }
        }

        const url = await getBackendUrl();
        const res = await axios.post(`${url}/api/v1/user-service/verify-forgot-password-otp`, {
            otp,
            sessionToken,
            email: forgot_email
        })

        const data = res.data;
        if (!data.success) {
            return {
                success: false,
                error: data.error || "Failed to verify OTP"
            }
        }

        return {
            success: true,
            message: "OTP verified successfully",
            resetToken: data.resetToken // This would be used for the actual password reset
        }

    } catch (error) {
        error = getErrorMessage(error)
        console.log("Error in verifying forgot password OTP:", error)
        return {
            success: false,
            error: error
        }
    }
}
