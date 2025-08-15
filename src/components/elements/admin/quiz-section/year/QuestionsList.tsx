import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions"
import { QuestionCard } from "./QuestionCard"

interface QuestionsListProps {
  isLoading: boolean
  error: Error | null
  isEmpty: boolean
  isFilteredEmpty: boolean
  filteredQuestions: Question[]
  totalQuestions: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onClearFilters: () => void
  onCreateQuestion: () => void
}

export const QuestionsList = React.memo(({
  isLoading,
  error,
  isEmpty,
  isFilteredEmpty,
  filteredQuestions,
  totalQuestions,
  hasNextPage,
  isFetchingNextPage,
  onClearFilters,
  onCreateQuestion,
}: QuestionsListProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? filteredQuestions.length + 1 : filteredQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 3,
  })

  if (isEmpty) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Questions Library
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalQuestions} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No questions yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Start building your question library by creating your first question. You can add questions manually
              or import them from files.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onCreateQuestion}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Question
              </Button>
              <Button variant="outline" size="lg" className="border-slate-300 hover:bg-slate-50 bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Import Questions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isFilteredEmpty) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Questions Library
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalQuestions} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No questions found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search term to find questions.
            </p>
            <Button
              onClick={onClearFilters}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Questions Library
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalQuestions} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Virtualized List Container */}
          <div
            ref={parentRef}
            className="h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50/50 p-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading questions...</h3>
                  <p className="text-slate-600">Please wait while we fetch your questions</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Error loading questions</h3>
                  <p className="text-slate-600 mb-4 max-w-md mx-auto">
                    {error.message || "Something went wrong while loading questions."}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const question = filteredQuestions[virtualRow.index]

                  // Show loading indicator at the end when fetching more
                  if (virtualRow.index === filteredQuestions.length && isFetchingNextPage) {
                    return (
                      <div
                        key="loading-more"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="flex justify-center items-center h-full">
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-sm font-medium">Loading more questions...</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (!question) return null

                  return (
                    <div
                      key={question.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                        paddingBottom: "16px",
                      }}
                    >
                      <QuestionCard question={question} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Show total count and loading status */}
          {!isLoading && !error && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {filteredQuestions.length} of {totalQuestions} questions
                {hasNextPage && <span className="ml-2 text-blue-600 font-medium">• Scroll to load more</span>}
              </div>
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="font-medium">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

QuestionsList.displayName = "QuestionsList" 