import { getErrorMessage } from "@/lib/utils/get-error";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
export const verfiyUser = async (token: string) => {
    try {
        const res = await axios.get(`/api/get/auth/verify-token?token=${token}`)
        const data = res.data.data;
        return data;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error,
            success: false,
        }
    }
}

export const useVerifyToken = (token: string) => {
    return useQuery({
        queryKey: ["verify-token", token],
        queryFn: () => verfiyUser(token),
        enabled: !!token && token.trim() != "",
    })
}