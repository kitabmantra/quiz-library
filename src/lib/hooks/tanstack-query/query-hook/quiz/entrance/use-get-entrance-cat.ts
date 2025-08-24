import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchEntranceCategory = async () => {
  const response = await axios.get(`/api/get/quiz/entrance-cat`);
  return response.data;
};

export const useGetEntranceCategory = () => {
  
  return useQuery({
    queryKey: ["get-entrance-category"],
    queryFn: fetchEntranceCategory,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
