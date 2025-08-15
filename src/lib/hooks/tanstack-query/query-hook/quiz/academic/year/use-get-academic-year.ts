import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils/get-error";
import { GetYearQueryType } from "@/components/elements/admin/quiz-section/year/year-list-page";

export const fetchAcademicYear = async (data: GetYearQueryType) => {
  try {
    const response = await axios.get(`/api/get/cateogry/academic/year?typeName=${data.typeName}&levelName=${data.levelName}&faculty=${data.faculty}`);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return {
      success: false,
      error: errorMessage
    }
  }
};

export const useGetAcademicYear = (data: GetYearQueryType) => {
  return useQuery({
    queryKey: ["get-academic-year", data.typeName, data.levelName, data.faculty],
    queryFn: () => fetchAcademicYear(data),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
