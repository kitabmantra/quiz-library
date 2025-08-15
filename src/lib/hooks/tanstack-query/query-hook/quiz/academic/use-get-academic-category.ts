import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchAcademicCategory = async () => {
  const response = await axios.get(`/api/get/cateogry/academic`);
  return response.data;
};

export const useGetAcademicCategory = () => {
  
  return useQuery({
    queryKey: ["get-academic-category"],
    queryFn: fetchAcademicCategory,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
