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
import { Play, ArrowLeft, RefreshCw, Plus, Clock, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showCheatingAlert, setShowCheatingAlert] = useState(false);
  const [cheatingCountdown, setCheatingCountdown] = useState(3);
  const [isTabSwitching, setIsTabSwitching] = useState(false);


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
  } = useQuizStore((state) => {
    if (!isStoreHydrated && (state.questions.length > 0 || state.progress)) {
      setIsStoreHydrated(true);
    }
    return state;
  });



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
        router.replace("/quizzes/academic/category-selection");
        return;
      }
    }

    if (quizData) {
      setFilter(quizData.filter);
      
      const existingProgress = useQuizStore.getState().progress;
      const isQuizInProgress = existingProgress && existingProgress.answers.length > 0 && !existingProgress.isCompleted;
      const isQuizCompleted = existingProgress && existingProgress.isCompleted;

      if (isQuizCompleted || isQuizInProgress) {
        setQuestions(quizData.questions);
        setIsResuming(true);
        quizStorage.storeQuizData(quizData.filter, quizData.questions, false);
        setIsLoading(false);
      } else {
        const shuffledQuestions = shuffleQuestionsAndOptions(quizData.questions);
        setQuestions(shuffledQuestions);
        quizStorage.storeQuizData(quizData.filter, shuffledQuestions, true);
        setIsLoading(false);
      }
      return;
    }

    if (!quizData && !oldFilter) {
      router.replace("/quizzes/academic/category-selection");
      return;
    }

    if (wasRecentlyCleared) {
      sessionStorage.removeItem("quiz_recently_cleared");
      router.replace("/quizzes/academic/category-selection");
      return;
    }

    router.replace("/quizzes/academic/category-selection");
  }, [router]);


 
  useEffect(() => {
    if (!filter) {
      return;
    }

    if (isResuming) {
      setFetchQuestion(false);
      return;
    }

    if (questions.length >= filter.questionCount) {
      setFetchQuestion(false);
      return;
    }
    setFetchQuestion(true);
  }, [filter, questions.length, isResuming]);


  const { data, isLoading: questionLoading, error } = useGetQuizQuestions(
    filter?.level || "",
    filter?.faculty || "",
    filter?.year || "",
    filter?.subjects?.join(",") || "",
    filter?.questionCount?.toString() || "0",
    fetchQuestion 
  );

  useEffect(() => {
    if (questionLoading || !data || !data.success || isResuming) return;
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      const shuffledQuestions = shuffleQuestionsAndOptions(data.questions);
      setQuestions(shuffledQuestions);
      quizStorage.storeQuizData(filter as Filter, shuffledQuestions, true);
      setFetchQuestion(false);
    }
  }, [data, questionLoading, filter, isResuming]);

  useEffect(() => {
    if (questions.length > 0 && isStoreHydrated) {
      initializeQuiz(questions);
      setIsLoading(false);
    }
  }, [questions, initializeQuiz, isStoreHydrated, isResuming]);

  useEffect(() => {
    if (!isLoading && questions.length > 0) {
      const wasRecentlyCleared = sessionStorage.getItem("quiz_recently_cleared");
      
      if (wasRecentlyCleared) {
        return;
      }
      
      const currentState = useQuizStore.getState();

      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        if (!currentState.isQuizStarted) {
          startQuiz();
        }
      } else if (currentState.progress && currentState.progress.isCompleted) {
        // The results will be shown automatically
      } else {
      }
    }
  }, [isLoading, questions.length, startQuiz]);

  useEffect(() => {
    const hydrationTimer = setTimeout(() => {
      if (!isStoreHydrated) {
        setIsStoreHydrated(true);
      }
    }, 1000);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        // Check if this is a reload attempt
        if (sessionStorage.getItem('quiz_reload_prevented')) {
          e.preventDefault();
          e.returnValue = 'Your quiz progress will be lost. Are you sure you want to leave?';
          return 'Your quiz progress will be lost. Are you sure you want to leave?';
        }
        e.preventDefault();
        e.returnValue = 'Your quiz progress will be lost. Are you sure you want to leave?';
        return 'Your quiz progress will be lost. Are you sure you want to leave?';
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        // Detect F5 key or Ctrl+R
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
          e.preventDefault();
          e.stopPropagation();
          sessionStorage.setItem('quiz_reload_prevented', 'true');
          setPendingNavigation('refresh');
          setShowLeaveAlert(true);
          return false;
        }
      }
    };

    // Add navigation event listener to reset progress when leaving quiz page
    const handleBeforeNavigate = () => {
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        // Reset quiz progress when navigating away
        useQuizStore.getState().resetProgressOnly();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    

    
    // Listen for copy events to detect cheating
    const handleCopy = (e: ClipboardEvent) => {
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        e.preventDefault();
        setIsTabSwitching(false);
        setShowCheatingAlert(true);
        setCheatingCountdown(3);
      }
    };
    
    // Prevent right-click context menu to disable copy options
    const handleContextMenu = (e: MouseEvent) => {
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        e.preventDefault();
        setIsTabSwitching(false);
        setShowCheatingAlert(true);
        setCheatingCountdown(3);
      }
    };
    
    // Prevent keyboard shortcuts for copy (Ctrl+C, Cmd+C)
    const handleKeyDownCopy = (e: KeyboardEvent) => {
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          e.preventDefault();
          setIsTabSwitching(false);
          setShowCheatingAlert(true);
          setCheatingCountdown(3);
        }
      }
    };
    
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu); // Add context menu listener
    document.addEventListener('keydown', handleKeyDownCopy); // Add keyboard shortcut listener

    return () => {
      clearTimeout(hydrationTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu); // Remove context menu listener
      document.removeEventListener('keydown', handleKeyDownCopy); // Remove keyboard shortcut listener
      useQuizStore.getState().stopTimer();
      
      // Reset quiz progress when component unmounts (user navigates away)
      const currentState = useQuizStore.getState();
      if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
        useQuizStore.getState().resetProgressOnly();
      }
      
      // Clean up the recently cleared flag when component unmounts
      sessionStorage.removeItem("quiz_recently_cleared");
      
      // Reset cheating alert state
      setShowCheatingAlert(false);
      setCheatingCountdown(3);
    };
  }, [isStoreHydrated]);

  // Handle cheating countdown and progress reset
  useEffect(() => {
    if (showCheatingAlert && cheatingCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setCheatingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Reset progress after countdown ends
            setTimeout(() => {
              useQuizStore.getState().resetProgressOnly();
              useQuizStore.getState().resetQuiz();
              // Force re-initialization of quiz
              if (questions.length > 0) {
                useQuizStore.getState().initializeQuiz(questions);
                // Reset quiz started state
                useQuizStore.getState().stopTimer();
              }
              setShowCheatingAlert(false);
              setCheatingCountdown(3);
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [showCheatingAlert, cheatingCountdown, questions]);

  // Handle tab switching - show cheating alert with countdown
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const currentState = useQuizStore.getState();
        if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
          // Show cheating alert for tab switching (same as copying)
          setIsTabSwitching(true);
          setShowCheatingAlert(true);
          setCheatingCountdown(3);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);




  const handleStartQuiz = () => {
    startQuiz();
  };

  const handlePlayAgain = () => {
    if (!filter) {
      console.error('Cannot play again: missing filter');
      
      return;
    }
    
    setIsShuffling(true);
    
    try {
      // Check if we have existing questions
      const existingQuestions = quizStorage.getQuizData()?.questions;
      
      if (existingQuestions && existingQuestions.length > 0) {
        // Use existing questions and shuffle them
        console.log('Using existing questions for play again');
        const reshuffledQuestions = shuffleQuestionsAndOptions(existingQuestions);
        quizStorage.storeQuizData(filter, reshuffledQuestions, true);
        setQuestions(reshuffledQuestions);
        resetProgressOnly();
        initializeQuiz(reshuffledQuestions);
        startQuiz();
      } else {
        // Fetch new questions
        console.log('Fetching new questions for play again');
        setFetchQuestion(true);
        resetProgressOnly();
      }
    } catch (error) {
      console.error('Error during play again:', error);
      // Fallback: try to fetch new questions
      setFetchQuestion(true);
      resetProgressOnly();
    } finally {
      setIsShuffling(false);
    }
  };

  const handleStopQuiz = () => {
    const currentState = useQuizStore.getState();
    if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
      setPendingNavigation("stop_quiz");
      setShowLeaveAlert(true);
    } else {
      stopQuizAndRedirect();
    }
  };

  const stopQuizAndRedirect = () => {
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

  const navigateToCategories = () => {
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



  const handleBack = () => {
    const currentState = useQuizStore.getState();
    console.log("iamtrpiggered")
    
    localStorage.removeItem("quiz-storage")
    localStorage.removeItem("quiz_start_time")
    localStorage.removeItem("qf")
    localStorage.removeItem("questions")
    
    const keysToRemove = [
      'quiz_progress',
      'quiz_state',
      'quiz_answers',
      'quiz_current_question',
      'quiz_timer',
      'quiz_completed',
      'quiz_results'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear any keys that might contain quiz-related data
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('quiz') || 
          key.toLowerCase().includes('question') ||
          key.toLowerCase().includes('answer') ||
          key.toLowerCase().includes('progress') ||
          key.toLowerCase().includes('timer')) {
        localStorage.removeItem(key)
      }
    })
    
    if (currentState.progress && currentState.progress.answers.length > 0 && !currentState.progress.isCompleted) {
      setPendingNavigation("/quizzes/academic/category-selection");
      setShowLeaveAlert(true);
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
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
    
    // Additional cleanup to ensure all data is cleared
    const keysToRemove = [
      'quiz-storage',
      'quiz_start_time',
      'qf',
      'questions',
      'quiz_progress',
      'quiz_state',
      'quiz_answers',
      'quiz_current_question',
      'quiz_timer',
      'quiz_completed',
      'quiz_results'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear any remaining quiz-related keys
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('quiz') || 
          key.toLowerCase().includes('question') ||
          key.toLowerCase().includes('answer') ||
          key.toLowerCase().includes('progress') ||
          key.toLowerCase().includes('timer')) {
        localStorage.removeItem(key)
      }
    })
    
    router.push("/quizzes/academic/category-selection");
  };

  if (isLoading || isShuffling || !isStoreHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isShuffling ? 'Shuffling questions...' : !isStoreHydrated ? 'Initializing...' : 'Loading quiz...'}
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
            onRetry={handlePlayAgain}
            onNewQuiz={handleStopQuiz}
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

      // Auto-move to next question after 1.5 seconds
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
              onClick={handlePlayAgain}
              disabled={isShuffling}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
              {isShuffling ? 'Shuffling...' : 'Play Again'}
            </Button>
            <Button
              onClick={handleStopQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Stop Quiz
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

      {/* Alert Dialog for Navigation Warning */}
      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {pendingNavigation === 'refresh' 
                ? 'Warning: Reset Progress & Reshuffle Questions'
                : pendingNavigation === 'stop_quiz'
                ? 'Warning: Stop Quiz Will Delete All Data'
                : 'Warning: Quiz Progress Will Be Lost'
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {pendingNavigation === 'refresh' 
                ? "You have unsaved quiz progress. If you refresh the page, your quiz progress (score, answers, timer) will be reset and questions will be reshuffled, but you'll keep the same filter settings."
                : pendingNavigation === 'stop_quiz'
                ? "You have unsaved quiz progress. If you stop the quiz, all your answers and progress will be deleted and you will be redirected to the category selection page."
                : "You have unsaved quiz progress. If you leave now, all your answers and progress will be lost."
              }
              <br /><br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowLeaveAlert(false);
              setPendingNavigation(null);
              // Clear the reload prevention flag when user cancels
              if (pendingNavigation === 'refresh') {
                sessionStorage.removeItem('quiz_reload_prevented');
              }
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowLeaveAlert(false);
              if (pendingNavigation === "/quizzes/academic/category-selection") {
                navigateToCategories();
              } else if (pendingNavigation === 'refresh') {
                // Reset only quiz progress but keep filter and questions, then reshuffle
                useQuizStore.getState().resetProgressOnly();
                // Get existing questions and reshuffle them
                const existingQuestions = quizStorage.getQuizData()?.questions;
                if (existingQuestions && existingQuestions.length > 0) {
                  const reshuffledQuestions = shuffleQuestionsAndOptions(existingQuestions);
                  quizStorage.storeQuizData(filter, reshuffledQuestions, true);
                }
                window.location.reload();
              } else if (pendingNavigation === 'stop_quiz') {
                stopQuizAndRedirect();
              }
              setPendingNavigation(null);
            }} className="bg-red-500 hover:bg-red-600">
              {pendingNavigation === 'refresh' ? 'Yes, Reset & Reshuffle' : 
               pendingNavigation === 'stop_quiz' ? 'Yes, Stop Quiz' : 'Yes, Leave Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Cheating Detection */}
      <AlertDialog open={showCheatingAlert} onOpenChange={setShowCheatingAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {isTabSwitching ? 'Tab Switching Detected!' : 'Cheating Detected!'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-left space-y-4">
            <p className="text-sm text-gray-700">
              Your quiz progress will be reset in <span className="font-bold text-red-600 text-lg">{cheatingCountdown}</span> seconds.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-center mb-2">
                <div className="w-16 h-16 rounded-full border-4 border-red-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">{cheatingCountdown}</span>
                </div>
              </div>
              <p className="text-sm text-red-700 font-medium text-center">⚠️ Warning:</p>
              <p className="text-sm text-red-600 text-center">
                {isTabSwitching 
                  ? "Switching tabs during the quiz is considered cheating. Please stay on this page and answer questions independently."
                  : "Copying quiz content is not allowed. Please answer questions independently."
                }
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowCheatingAlert(false);
                setCheatingCountdown(3);
                setIsTabSwitching(false);
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled
            >
              Acknowledged
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PlayingQuizSection;
