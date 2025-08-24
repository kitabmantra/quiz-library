import { getErrorMessage } from "@/lib/utils/get-error";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchEntranceQuizHistory = async () => {
    try {
        const response = await axios.get(`/api/get/quiz/entrnace-quiz-history`);
        return response.data;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            success: false,
            error: error
        }
    }
};

export const useGetEntranceQuizHistory = () => {

    return useQuery({
        queryKey: ["get-user-past-history"],
        queryFn: () => fetchEntranceQuizHistory(),
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData
    });
};
