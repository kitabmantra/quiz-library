import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"


export type AllUsersResponse = {
    data: {
        users: User[];
        hasMore: boolean;
        nextOffset: number;
    };

};

export type AllUsersParams = {
    search?: string
    limit?: number
    offset?: number 
}

export const fetchAllUsers = async (params: AllUsersParams): Promise<AllUsersResponse> => {
    const { search = "", limit = 100, offset = 1 } = params
    const res = await axios.get(`/api/get/super-admin/users?search=${search}&page=${limit}&offset=${offset}`)
    const data = res.data;
    console.log("this is the data of all users in tanstack : ", data)
    
    // Ensure we return the expected structure
    
    
    return data as AllUsersResponse;
}

export const useGetAllUsers = (params: Omit<AllUsersParams, 'limit' | 'offset'>, limit: number = 100) => {
    return useInfiniteQuery({
        queryKey: ["get-all-users", params, limit],
        queryFn: ({ pageParam = 1 }) => fetchAllUsers({ ...params, limit, offset: pageParam as number }),
        getNextPageParam: (lastPage) => lastPage.data.hasMore ? lastPage.data.nextOffset : undefined,
        initialPageParam: 0,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    })
}