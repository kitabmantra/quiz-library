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

export const fetchQuizQuestions = async (
    levelName: string,
    faculty: string,
    yearName: string,
    subjectName: string,
    numberOfQuestions: string
): Promise<QuizQuestionsResponse> => {
    const params = new URLSearchParams({
        levelName,
        faculty,
        yearName,
        subjectName,
        numberOfQuestions
    });
    
    const response = await axios.get<QuizQuestionsResponse>(
        `/api/get/quiz/quiz-questions?${params.toString()}`
    );
    return response.data;
};

export const useGetQuizQuestions = (
    levelName: string,
    faculty: string,
    yearName: string,
    subjectName: string,
    numberOfQuestions: string,
    fetchQuestion: boolean = false
) => {
    return useQuery<QuizQuestionsResponse, Error>({
        queryKey: ["get-quiz-questions", levelName, faculty, yearName, subjectName, numberOfQuestions],
        queryFn: () => fetchQuizQuestions(levelName, faculty, yearName, subjectName, numberOfQuestions),
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
        enabled: fetchQuestion
    });
};
