import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils/get-error";

export const fetchYearAcademicStat = async (yearName: string, levelName: string, faculty: string, typeName: string) => {
  try {
    const response = await axios.get(`/api/get/cateogry/academic/question-stat?yearName=${yearName}&levelName=${levelName}&faculty=${faculty}&typeName=${typeName}`);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return {
      success: false,
      error: errorMessage
    }
  }
};

export const useGetYearAcademicStat = (yearName: string, levelName: string, faculty: string, typeName: string) => {

  return useQuery({
    queryKey: ["get-year-academic-stat", yearName, levelName, faculty, typeName],
    queryFn: () => fetchYearAcademicStat(yearName, levelName, faculty, typeName),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
