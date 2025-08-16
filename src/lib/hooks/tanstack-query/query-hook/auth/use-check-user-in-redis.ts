import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchCheckUserInRedis = async () => {
  const response = await axios.get(`/api/get/auth/check-email`);
  console.log("this is the response of check user in redis : ", response.data)
  return response.data;
};

export const useCheckUserInRedis = () => {
  
  return useQuery({
    queryKey: ["check-user-in-redis"],
    queryFn: () => fetchCheckUserInRedis(),
    refetchOnWindowFocus: false,
  });
};
