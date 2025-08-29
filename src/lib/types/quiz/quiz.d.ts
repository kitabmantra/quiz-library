export type CreateQuizQuestionType = {
    correctAnswer : string;
    difficulty : "easy" | "medium" | "hard";
    hint ?: string
    metadata? : {
        key : string;
        value : string;
    }[];
    question : string;
    referenceUrl? : string;
    options : string[];
}

export type Filter = {
  level: string | null
  faculty: string | null
  year: string | null
  subjects: string[] ,
  questionCount: number
  timerEnabled: boolean
}

export interface QuestionData {
    question: string
    options: string[]
    correctAnswer: number
    difficulty: "easy" | "medium" | "hard"
    hint?: string
    referenceUrl?: string
    tags: string[]
    priority: number
    subjectName: string
  }
  
  export interface CreateQuestionRequest {
    type: "academic"
    levelName: string
    faculty: string
    yearName: string
    question: string
    options: string[]
    correctAnswer: string
    difficulty: "easy" | "medium" | "hard"
    tags: string[]
    priority: number
    hint?: string
    subjectName: string
    referenceUrl?: string
  }


  export interface EntranceQuestionData {
    question: string
    options: string[]
    correctAnswer: string
    difficulty: "easy" | "medium" | "hard"
    hint?: string
    referenceUrl?: string
    tags: string[]
    priority: number
    subjectName: string
    entranceId?: string
    entranceName?: string
  }

  export interface CreateEntranceQuestionRequest {
    entranceName: string
    questions: EntranceQuestionData[]
  }

  export interface Subject {
    subjectName: string
    yearId: string
  }
  
  export interface Year {
    id: string
    yearName: string
  }
  
  export interface Faculty {
    faculty: string
    years: Year[]
  }
  
  export interface Level {
    levelName: string
    faculties: Faculty[]
  }
  
  export interface CountQuestionItem {
    levelName: string
    faculty: string
    yearName: string
    count: number
    subjectName: string
  }
  
  export interface AcademicCategories {
    type: string
    levels: Level[]
    subjects?: Subject[]
    countQuestionData?: CountQuestionItem[]
  }
  
  export type CreationMode = "single" | "multiple" | "import" | "ai"
  
