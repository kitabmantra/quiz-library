"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Trash2, Save } from "lucide-react"
import { QuestionData } from "@/lib/types/quiz/quiz"

interface QuestionListProps {
  questions: QuestionData[]
  onSaveQuestion: (question: QuestionData, index: number) => void
  onRemoveQuestion: (index: number) => void
  isSaving?: boolean
}

export function QuestionList({ questions, onSaveQuestion, onRemoveQuestion, isSaving }: QuestionListProps) {
  if (questions.length === 0) return null

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index} className="bg-white border border-sky-200 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-sky-800">Question {index + 1}</h4>
                <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                  Generated
                </Badge>
              </div>
              <p className="text-sm text-sky-600 mb-4 leading-relaxed">{question.question}</p>

              <div className="space-y-2 mb-4">
                {question.options.map((option: string, optIndex: number) => (
                  <div
                    key={optIndex}
                    className={`flex items-center gap-2 text-sm p-3 rounded-lg border transition-all duration-200 ${
                      question.correctAnswer === optIndex
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-sky-50 border-sky-200 text-sky-700"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      question.correctAnswer === optIndex 
                        ? "bg-emerald-500 text-white" 
                        : "bg-sky-300 text-sky-700"
                    }`}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="flex-1">{option}</span>
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
                <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
                  {question.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
                  Priority {question.priority}
                </Badge>
                <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
                  {question.subjectName}
                </Badge>
              </div>

              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag: string, tagIndex: number) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs bg-sky-100 text-sky-800 border-sky-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => onSaveQuestion(question, index)} 
                disabled={isSaving} 
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button 
                onClick={() => onRemoveQuestion(index)} 
                variant="outline" 
                size="sm"
                className="border-red-300 hover:bg-red-50 text-red-700 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
