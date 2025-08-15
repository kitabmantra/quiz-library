import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils/get-error";

export const fetchEntranceQuestionStat = async (entranceName: string) => {
  try {
    const response = await axios.get(`/api/get/cateogry/entrance/question-stats?entranceName=${entranceName}`);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return {
      success: false,
      error: errorMessage
    }
  }
};

export const useGetEntranceQuestionStat = (entranceName: string) => {

  return useQuery({
    queryKey: ["get-entrance-question-stat", entranceName],
    queryFn: () => fetchEntranceQuestionStat(entranceName),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
