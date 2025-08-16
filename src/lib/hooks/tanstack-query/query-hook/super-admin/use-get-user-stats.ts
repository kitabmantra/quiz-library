import { getErrorMessage } from "@/lib/utils/get-error";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchAllUserStats = async () => {
  try {
    const response = await axios.get(`/api/get/super-admin/user-stats`);
    return response.data;
  } catch (error) {
    error = getErrorMessage(error)
    return {
      success: false,
      error: error
    }
  }
};

export const useGetAllUserStats = () => {

  return useQuery({
    queryKey: ["get-all-users-stats"],
    queryFn: () => fetchAllUserStats(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, 
    placeholderData: keepPreviousData
  });
};
