"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Save, CheckCircle, List } from "lucide-react"
import { QuestionData } from "@/lib/types/quiz/quiz"

interface ManualQuestionListProps {
  questions: QuestionData[]
  onEditQuestion: (index: number) => void
  onRemoveQuestion: (index: number) => void
  onSaveAll: () => void
  isSaving?: boolean
}

export function ManualQuestionList({
  questions,
  onEditQuestion,
  onRemoveQuestion,
  onSaveAll,
  isSaving,
}: ManualQuestionListProps) {
  if (questions.length === 0) return null

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-sky-100 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-sky-600" />
            <span className="text-sky-800">Questions to Save ({questions.length})</span>
          </div>
          <Button 
            onClick={onSaveAll} 
            disabled={isSaving || questions.length === 0}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : `Save All ${questions.length} Questions`}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {questions.map((question, index) => (
          <div key={index} className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-sky-800">Question {index + 1}</h4>
                  <Badge variant="outline" className="text-xs bg-white text-sky-700 border-sky-300">
                    Manual
                  </Badge>
                </div>
                <p className="text-sm text-sky-600 mb-4 line-clamp-2 leading-relaxed">{question.question}</p>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 text-sm p-3 rounded-lg border transition-all duration-200 ${
                        question.correctAnswer === optIndex
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-white border-sky-200 text-sky-700"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                        question.correctAnswer === optIndex 
                          ? "bg-emerald-500 text-white" 
                          : "bg-sky-300 text-sky-700"
                      }`}>
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="truncate flex-1">{option}</span>
                      {question.correctAnswer === optIndex && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                            Correct
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-white">
                    {question.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-white">
                    Priority {question.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-white">
                    {question.subjectName}
                  </Badge>
                </div>

                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {question.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs bg-sky-100 text-sky-800 border-sky-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => onEditQuestion(index)} 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 border-sky-300 hover:bg-sky-50 text-sky-700 hover:border-sky-400"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button 
                  onClick={() => onRemoveQuestion(index)} 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 border-red-300 hover:bg-red-50 text-red-700 hover:border-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
