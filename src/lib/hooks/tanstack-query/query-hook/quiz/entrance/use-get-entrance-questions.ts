import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { AcademicQuestionsResponse } from "../academic/year/use-get-academic-questions";

export type Question = {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    hint?: string;
    tags: string[];
    subjectName: string;
    referenceUrl?: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
};

export type EntranceQuestionsResponse = {
    data: {
        questions: Question[];
        hasMore: boolean;
        nextOffset: number;
    };

};

export type EntranceQuestionsParams = {
    search?: string
    entranceName: string
    limit?: number
    offset?: number
}

export const fetchEntranceQuestions = async (params: EntranceQuestionsParams): Promise<EntranceQuestionsResponse> => {
    const { search = "", entranceName, limit = 100, offset = 1 } = params
    const res = await axios.get(`/api/get/cateogry/entrance/questions?search=${search}&entranceName=${entranceName}&page=${limit}&offset=${offset}`)
    const data = res.data.data;
    return data as AcademicQuestionsResponse;
}

export const useGetEntranceQuestions = (params: Omit<EntranceQuestionsParams, 'limit' | 'offset'>, limit: number = 100) => {
    return useInfiniteQuery<EntranceQuestionsResponse, Error>({
        queryKey: ["get-entrance-questions", params, limit],
        queryFn: ({ pageParam = 1 }) => fetchEntranceQuestions({ ...params, limit, offset: pageParam as number }),
        getNextPageParam: (lastPage) => lastPage.data.hasMore ? lastPage.data.nextOffset : undefined,
        initialPageParam: 0,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    })
}