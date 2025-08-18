import { getErrorMessage } from "@/lib/utils/get-error";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchAllAcademicCat = async () => {
    try {
        const response = await axios.get(`/api/get/quiz/academic-cat`);
        return response.data;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            success: false,
            error: error
        }
    }
};

export const useGetAllAcademicCat = () => {

    return useQuery({
        queryKey: ["get-all-academic-cat"],
        queryFn: () => fetchAllAcademicCat(),
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData
    });
};
