"use client";
import { useGetQuizQuestions, type QuizQuestion as QuizQuestionType, shuffleOptions } from "@/lib/hooks/tanstack-query/query-hook/quiz/quiz-questions/use-get-quiz-question";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { useQuizStore } from "@/lib/store/useQuizStore";
import { QuizTimer } from "./components/QuizTimer";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizProgress } from "./components/QuizProgress";
import { QuizResults } from "./components/QuizResults";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, RefreshCw, Plus, Clock } from "lucide-react";
import { quizStorage } from "@/lib/utils/quiz-storage";
import { decodeBase64 } from "@/lib/utils/helper";
import { Filter } from "@/lib/types/quiz/quiz";
import { QuizAnswer } from "@/lib/store/useQuizStore";

function PlayingQuizSection() {
  const router = useRouter();
  const [fetchQuestion, setFetchQuestion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [filter, setFilter] = useState<Filter>({
    level: "",
    faculty: "",
    year: "",
    subjects: [],
    questionCount: 0,
  });


  const {
    currentQuestion,    
    progress,
    timeRemaining,
    isQuizStarted,
    isQuizCompleted,
    showResults,
    initializeQuiz,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
    resetProgressOnly,
  } = useQuizStore();



  const shuffleQuestionsAndOptions = (questions: QuizQuestionType[]): QuizQuestionType[] => {
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    
    return shuffledQuestions.map(question => shuffleOptions(question));
  };

  const answersMap = useMemo(() => {
    const map = new Map<string, QuizAnswer>();
    if (progress?.answers) {
      progress.answers.forEach(answer => {
        map.set(answer.questionId, answer);
      });
    }
    return map;
  }, [progress?.answers]);


  const getAnswerByQuestionId = (questionId: string): QuizAnswer | null => {
    return answersMap.get(questionId) || null;
  };

  useEffect(() => {
    const oldFilter = localStorage.getItem("qf");
    const quizData = quizStorage.getQuizData();
    
    // Check if quiz was recently cleared (after saving)
    const wasRecentlyCleared = sessionStorage.getItem("quiz_recently_cleared");
    
    if (oldFilter && !quizData) {
      try {
        const decodedFilter = decodeBase64(oldFilter);
        const parsedFilter = JSON.parse(decodedFilter);
        setFilter(parsedFilter);
        setIsLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem("qf");
        router.replace("/quizzes/category-selection");
        return;
      }
    }

    if (quizData) {
      setFilter(quizData.filter);
      
      // If there's no existing progress, shuffle the questions for a fresh start
      const existingProgress = useQuizStore.getState().progress;
      const isQuizInProgress = existingProgress && existingProgress.answers.length > 0;
      const isQuizCompleted = existingProgress && existingProgress.isCompleted;

      if (isQuizCompleted) {
        // Quiz was completed, show results - don't shuffle
        setQuestions(quizData.questions);
        setIsLoading(false);
      } else if (isQuizInProgress) {
        // Quiz was in progress, resume it - don't shuffle
        setQuestions(quizData.questions);
        startQuiz();
      } else {
        // Fresh quiz - shuffle questions and options
        const shuffledQuestions = shuffleQuestionsAndOptions(quizData.questions);
        setQuestions(shuffledQuestions);
        quizStorage.storeQuizData(quizData.filter, shuffledQuestions);
        setIsLoading(false);
      }
      return;
    }

    // If no quiz data and no old filter, redirect to category selection
    if (!quizData && !oldFilter) {
      router.replace("/quizzes/academic/category-selection");
      return;
    }

    // If quiz was recently cleared, redirect to category selection
    if (wasRecentlyCleared) {
      sessionStorage.removeItem("quiz_recently_cleared");
      router.replace("/quizzes/academic/category-selection");
      return;
    }

    // Fallback: redirect to category selection
    router.replace("/quizzes/academic/category-selection");
  }, [router]);


 
  useEffect(() => {
    if (!filter) {
      return;
    }

    if (questions.length >= filter.questionCount) {
      setFetchQuestion(false);
      return;
    }
    setFetchQuestion(true);
  }, [filter, questions.length]);


  const { data, isLoading: questionLoading, error } = useGetQuizQuestions(
    filter?.level || "",
    filter?.faculty || "",
    filter?.year || "",
    filter?.subjects?.join(",") || "",
    filter?.questionCount?.toString() || "0",
    fetchQuestion 
  );

  useEffect(() => {
    if (questionLoading || !data || !data.success) return;
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      // Shuffle questions and their options before storing
      const shuffledQuestions = shuffleQuestionsAndOptions(data.questions);
      setQuestions(shuffledQuestions);
      quizStorage.storeQuizData(filter as Filter, shuffledQuestions);
      setFetchQuestion(false);
    }
  }, [data, questionLoading, filter]);

  useEffect(() => {
    if (questions.length > 0) {
      initializeQuiz(questions);
      const checkResume = () => {
        const currentState = useQuizStore.getState();
        const wasRecentlyCleared = sessionStorage.getItem("quiz_recently_cleared");
        if (wasRecentlyCleared) {
          setIsLoading(false);
          return;
        }
        
        if (currentState.progress && currentState.progress.answers.length > 0) {
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      };

      setTimeout(checkResume, 100);
    }
  }, [questions, initializeQuiz]);

  useEffect(() => {
    if (!isLoading && questions.length > 0) {
      const wasRecentlyCleared = sessionStorage.getItem("quiz_recently_cleared");
      
      // If quiz was recently cleared, don't start or resume
      if (wasRecentlyCleared) {
        return;
      }
      
      if (canResumeQuiz()) {
        startQuiz();
      } else if (hasCompletedQuiz()) {
        // Quiz was completed, don't start it again
      }
    }
  }, [isLoading, questions.length]);

  useEffect(() => {
    return () => {
      useQuizStore.getState().stopTimer();
      // Clean up the recently cleared flag when component unmounts
      sessionStorage.removeItem("quiz_recently_cleared");
    };
  }, []);




  const handleStartQuiz = () => {
    startQuiz();
  };

  const handleRetry = () => {
    if (!filter || questions.length === 0) {
      console.error('Cannot retry: missing filter or questions');
      return;
    }
    
    setIsShuffling(true);
    
    try {
      // For retry: reshuffle questions and their options
      resetProgressOnly(); // Only reset progress/score, keep questions
      
      // Get the original questions from storage or use current questions
      const originalQuestions = quizStorage.getQuizData()?.questions || questions;
      
      // Reshuffle questions and options for retry
      const reshuffledQuestions = shuffleQuestionsAndOptions(originalQuestions);
      
      quizStorage.storeQuizData(filter, reshuffledQuestions);
      setQuestions(reshuffledQuestions);
      initializeQuiz(reshuffledQuestions);
      startQuiz();
    } catch (error) {
      console.error('Error during retry:', error);
      // Fallback: try to start with current questions
      initializeQuiz(questions);
      startQuiz();
    } finally {
      setIsShuffling(false);
    }
  };

  const handleNewQuiz = () => {
    // For new quiz: clear everything and redirect to fetch new questions
    quizStorage.clearAllQuizData();
    resetQuiz();
    setQuestions([]);
    setFilter({
      level: "",
      faculty: "",
      year: "",
      subjects: [],
      questionCount: 0,
    });
    setFetchQuestion(false);
    setIsLoading(false);
    router.push("/quizzes/academic/category-selection");
  };

  const canResumeQuiz = () => {
    const currentState = useQuizStore.getState();
    const wasRecentlyCleared = sessionStorage.getItem("quiz_recently_cleared");
    
    // If quiz was recently cleared, don't resume
    if (wasRecentlyCleared) {
      return false;
    }
    
    return currentState.progress &&
      currentState.progress.answers.length > 0 &&
      !currentState.progress.isCompleted;
  };

  const hasCompletedQuiz = () => {
    const currentState = useQuizStore.getState();
    const wasRecentlyCleared = sessionStorage.getItem("quiz_recently_cleared");
    
    // If quiz was recently cleared, don't show completed state
    if (wasRecentlyCleared) {
      return false;
    }
    
    return currentState.progress &&
      currentState.progress.answers.length > 0 &&
      currentState.progress.isCompleted;
  };

  const handleBack = () => {
    // For back: clear everything and redirect to fetch new questions
    quizStorage.clearAllQuizData();
    resetQuiz();
    setQuestions([]);
    setFilter({
      level: "",
      faculty: "",
      year: "",
      subjects: [],
      questionCount: 0,
    });
    setFetchQuestion(false);
    setIsLoading(false);
    router.push("/quizzes/academic/category-selection");
  };

  if (isLoading || isShuffling) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isShuffling ? 'Shuffling questions...' : 'Loading quiz...'}
          </p>
          {isShuffling && (
            <p className="text-sm text-gray-500 mt-2">Preparing fresh quiz experience</p>
          )}
        </div>
      </div>
    );
  }

  if (questionLoading && fetchQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading and shuffling questions...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your quiz experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load questions</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No questions available</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isQuizCompleted && showResults) {
    console.log('Debug - Progress in playing-quiz-section:', progress);
    console.log('Debug - Progress answers:', progress?.answers);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <QuizResults
            questions={questions}
            answers={progress?.answers || []}
            score={progress?.score || 0}
            totalTime={progress?.totalTime || 0}
            onRetry={handleRetry}
            onNewQuiz={handleNewQuiz}
          />
        </div>
      </div>
    );
  }

  if (isQuizCompleted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto text-center space-y-6 p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Quiz Completed!</h1>
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-base text-gray-700">Quiz finished successfully</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span className="text-base text-gray-700">{progress?.answers.length || 0} questions answered</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-base text-gray-700">Results ready to view</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => useQuizStore.getState().completeQuiz()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 mr-2" />
                View Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isQuizStarted) {
    const hasProgress = progress && progress.answers.length > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">   
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto text-center space-y-6 p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {hasProgress ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Quiz?</h1>
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-base text-gray-700">
                      {progress?.answers.length || 0} of {questions.length} questions completed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-base text-gray-700">
                      {progress?.correctAnswers || 0} correct answers so far
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-base text-gray-700">
                      {progress?.wrongAnswers || 0} wrong answers so far
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-base text-gray-700">
                      {progress?.timeoutAnswers || 0} timeout answers so far
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-base text-gray-700">Continue from where you left off</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleBack} className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleStartQuiz} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    <Play className="w-5 h-5 mr-2" />
                    Resume Quiz
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start?</h1>
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-base text-gray-700">{questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-base text-gray-700">Easy: 10s, Medium: 15s, Hard: 20s per question</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-base text-gray-700">Progress will be saved automatically</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleBack} className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleStartQuiz} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    <Play className="w-5 h-5 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading question...</p>
          <p className="text-sm text-gray-500 mt-2">
            Questions: {questions.length} | Started: {isQuizStarted ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    );
  }


  const currentAnswer = getAnswerByQuestionId(currentQuestion.id);
  const isAnswered = !!currentAnswer;


  const handleAnswer = (answer: string) => {
    if (!isAnswered) {
      answerQuestion(answer);

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <div className="text-xs font-medium text-yellow-800">
                  Quiz Session Timeout
                </div>
                <div className="text-xs text-yellow-700">
                  {quizStorage.getRemainingTime()} minutes remaining • Auto-save enabled
                </div>
              </div>
            </div>
          </div>

          <QuizTimer
            timeRemaining={timeRemaining}
            totalTime={useQuizStore.getState().getTimeLimit(currentQuestion.difficulty)}
            difficulty={currentQuestion.difficulty}
          />

          <QuizProgress
            currentIndex={progress.currentQuestionIndex}
            totalQuestions={questions.length}
            answers={progress.answers}
          />

          <QuizQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
            selectedAnswer={currentAnswer?.selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            currentAnswer={currentAnswer}
          />

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
            <Button
              onClick={handleRetry}
              disabled={isShuffling}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
              {isShuffling ? 'Shuffling...' : 'Play Again'}
            </Button>
            <Button
              onClick={handleNewQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Stop Quiz
            </Button>
            <Button
              onClick={() => {
                console.log('Clearing all data and going back to categories...');

                // For back to categories: clear everything and redirect to fetch new questions
                quizStorage.clearAllQuizData();
                
                resetQuiz();
                setQuestions([]);
                setFilter({
                  level: "",
                  faculty: "",
                  year: "",
                  subjects: [],
                  questionCount: 0,
                });
                setFetchQuestion(false);
                setIsLoading(false);

                console.log('All data cleared, redirecting to categories...');

                // Redirect to category selection
                router.push("/quizzes/academic/category-selection");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Categories
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default PlayingQuizSection;
