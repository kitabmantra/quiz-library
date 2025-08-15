"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, CheckCircle } from "lucide-react"
import { QuestionData } from "@/lib/types/quiz/quiz"

interface QuestionPreviewProps {
  questionData: QuestionData
}

export function QuestionPreview({ questionData }: QuestionPreviewProps) {
  return (
    <Card className="h-fit bg-white shadow-lg border-0">
      <CardHeader className="pb-3 border-b border-sky-100">
        <CardTitle className="flex items-center gap-2 text-lg text-sky-800">
          <Eye className="w-5 h-5 text-sky-600" />
          Question Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Question Preview */}
        <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
          <h4 className="font-semibold mb-2 text-sm text-sky-700">Question:</h4>
          <p className="text-sm leading-relaxed text-sky-800">{questionData.question || "Your question will appear here..."}</p>
        </div>

        {/* Options Preview */}
        <div>
          <h4 className="font-semibold mb-2 text-sm text-sky-700">Options:</h4>
          <div className="space-y-2">
            {questionData.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 border rounded-lg transition-all duration-200 ${
                  questionData.correctAnswer === index
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-sky-200 hover:border-sky-300 bg-white"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  questionData.correctAnswer === index 
                    ? "bg-emerald-500 text-white" 
                    : "bg-sky-200 text-sky-700"
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm flex-1 text-sky-800">
                  {option || `Option ${String.fromCharCode(65 + index)} will appear here...`}
                </span>
                {questionData.correctAnswer === index && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <Badge
                      variant="secondary"
                      className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200"
                    >
                      Correct
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
              {questionData.difficulty.charAt(0).toUpperCase() + questionData.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
              Priority {questionData.priority}
            </Badge>
            {questionData.tags.length > 0 && (
              <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
                {questionData.tags.length} tag{questionData.tags.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {questionData.hint && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1 text-xs">💡 Hint:</h5>
              <p className="text-blue-700 text-xs">{questionData.hint}</p>
            </div>
          )}

          {questionData.referenceUrl && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
              <h5 className="font-semibold mb-1 text-xs text-sky-700">🔗 Reference:</h5>
              <a
                href={questionData.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 hover:underline text-xs break-all transition-colors"
              >
                {questionData.referenceUrl}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
