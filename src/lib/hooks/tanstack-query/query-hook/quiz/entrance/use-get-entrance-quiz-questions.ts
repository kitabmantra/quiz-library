import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export type QuizQuestion = {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    subjectName: string;
    difficulty: "easy" | "medium" | "hard";
    hint?: string;
    referenceUrl?: string;
    priority?: number;
    shuffledOptions?: string[]; // Store shuffled options to maintain consistency
};

// Function to shuffle options while preserving correct answer mapping
export const shuffleOptions = (question: QuizQuestion): QuizQuestion => {
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    return {
        ...question,
        shuffledOptions,
    };
};

export type QuizQuestionsResponse = {
    success: boolean;
    questions: QuizQuestion[];
    error?: string;
};

export const fetchEntranceQuizQuestions = async (
    entranceName: string,
    subjectName: string,
    numberOfQuestions: string,
    difficulty: string
): Promise<QuizQuestionsResponse> => {
    const params = new URLSearchParams({
            entranceName,
        subjectName,
        numberOfQuestions,
        difficulty
    });
    
    const res = await axios.get(`/api/get/quiz/entrance-questions?${params.toString()}`)
    console.log("res", res.data)
    return res.data;
};      

export const useGetEntranceQuizQuestions = (
            entranceName: string,
    subjectName: string,
    numberOfQuestions: string,
    difficulty: string,
    fetchQuestion: boolean = false
) => {
    return useQuery<QuizQuestionsResponse, Error>({
        queryKey: ["get-entrance-quiz-questions", entranceName, subjectName, numberOfQuestions, difficulty],
        queryFn: () => fetchEntranceQuizQuestions(entranceName, subjectName, numberOfQuestions, difficulty),
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000,
                enabled: fetchQuestion
    });
};
