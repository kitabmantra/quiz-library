import { getErrorMessage } from "@/lib/utils/get-error";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"

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

export type UpdateQuestion = {
    id: string;
    yearName: string;
    faculty: string;
    levelName: string;
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

export type AcademicQuestionsResponse = {
    data: {
        questions: Question[];
        total: number;
        hasMore: boolean;
        nextOffset: number;
    };

};

export type AcademicQuestionsParams = {
    search?: string
    yearName: string
    faculty: string
    levelName: string
    limit?: number
    offset?: number
}

export const fetchAcademicQuestions = async (params: AcademicQuestionsParams): Promise<AcademicQuestionsResponse> => {
    const { search = "", yearName, faculty, levelName, limit = 100, offset = 1 } = params
    const res = await axios.get(`/api/get/cateogry/academic/questions?search=${search}&yearName=${yearName}&faculty=${faculty}&levelName=${levelName}&page=${limit}&offset=${offset}`)
    const data = res.data.data;
    return data as AcademicQuestionsResponse;
}

export const useGetAcademicQuestions = (params: Omit<AcademicQuestionsParams, 'limit' | 'offset'>, limit: number = 100) => {
    return useInfiniteQuery<AcademicQuestionsResponse, Error>({
        queryKey: ["get-academic-questions", params, limit],
        queryFn: ({ pageParam = 1 }) => fetchAcademicQuestions({ ...params, limit, offset: pageParam as number }),
        getNextPageParam: (lastPage) => lastPage.data.hasMore ? lastPage.data.nextOffset : undefined,
        initialPageParam: 0,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    })
}