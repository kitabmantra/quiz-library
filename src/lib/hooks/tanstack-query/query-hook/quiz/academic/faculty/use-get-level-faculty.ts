import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils/get-error";
export const fetchLevelFaculty = async (typeName: string, levelName: string) => {
  try {
    const response = await axios.get(`/api/get/cateogry/academic/faculty?typeName=${typeName}&levelName=${levelName}`);
    console.log("this is reposne data : ",response.data)
    return response.data;
  } catch (error) {
    error = getErrorMessage(error)
    console.log("error in getting the data : ",error)
    return {
      error , success : false
    }
  }
};

export const useGetLevelFaculty = (typeName: string, levelName: string) => {

  return useQuery({
    queryKey: ["get-level-faculty", typeName, levelName],
        queryFn: () => fetchLevelFaculty(typeName, levelName),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
    placeholderData: keepPreviousData
  });
};
