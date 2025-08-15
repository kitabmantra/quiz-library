import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchEntrance = async () => {
  const response = await axios.get(`/api/get/cateogry/entrance`);
  return response.data;
};

export const useGetAllEntrance = () => {
  
  return useQuery({
    queryKey: ["get-all-entrance"],
    queryFn: fetchEntrance,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
