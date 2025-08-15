import { getErrorMessage } from "@/lib/utils/get-error";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getUserFromToken = async () => {
    try {
        const res = await axios.get(`/api/get/auth/get-user-from-token`)
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

export const useGetUserFromToken = () => {
    return useQuery({
        queryKey: ["get-user-from-token"],
        queryFn: () => getUserFromToken(),
        refetchOnWindowFocus : false,
        retryDelay : 2000,
    })
}