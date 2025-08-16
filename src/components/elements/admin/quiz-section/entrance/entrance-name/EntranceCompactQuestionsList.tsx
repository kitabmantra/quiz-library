import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/entrance/use-get-entrance-questions"
import { EntranceCompactQuestionCard } from "./EntranceCompactQuestionCard"

interface EntranceCompactQuestionsListProps {
  isLoading: boolean
  error: Error | null
  isEmpty: boolean
  isFilteredEmpty: boolean
  filteredQuestions: Question[]
  totalQuestions: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  selectedQuestion: Question | null
  onClearFilters: () => void
  onCreateQuestion: () => void
  onQuestionSelect: (question: Question) => void
  onLoadMore: () => void
  disabled?: boolean
}

export const EntranceCompactQuestionsList = React.memo(({
  isLoading,
  error,
  isEmpty,
  isFilteredEmpty,
  filteredQuestions,
  totalQuestions,
  hasNextPage,
  isFetchingNextPage,
  selectedQuestion,
  onClearFilters,
  onCreateQuestion,
  onQuestionSelect,
  onLoadMore,
  disabled = false,
}: EntranceCompactQuestionsListProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? filteredQuestions.length + 1 : filteredQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 190, 
    overscan: 5,
  })

  // Handle infinite scroll
  React.useEffect(() => {
    const scrollElement = parentRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
      
      // Load more when user scrolls to 80% of the content
      if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage && !isLoading && !disabled) {
        onLoadMore()
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, isLoading, disabled, onLoadMore])

  if (isEmpty) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Entrance Questions Library
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {totalQuestions} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No entrance questions yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Start building your entrance question library by creating your first question. You can add questions manually
              or import them from files.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onCreateQuestion}
                disabled={disabled}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
              <FileText className="w-5 h-5 text-purple-600" />
              Entrance Questions Library
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
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
              Try adjusting your filters or search term to find entrance questions.
            </p>
            <Button
              onClick={onClearFilters}
              disabled={disabled}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Entrance Questions Library
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Loading...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 h-20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0 h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Entrance Questions Library
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {filteredQuestions.length} of {totalQuestions}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100vh-300px)]">
        <div
          ref={parentRef}
          className="h-full overflow-auto"
          style={{
            contain: 'strict',
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const isLoaderRow = virtualItem.index > filteredQuestions.length - 1
              const question = filteredQuestions[virtualItem.index]

              return (
                <div
                  key={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    hasNextPage ? (
                      <div className="px-3 py-2">
                        <div className="animate-pulse bg-slate-200 h-20 rounded-lg"></div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-center text-slate-500 text-sm">
                        <div className="bg-slate-50 rounded-lg p-4">
                          No more questions to load
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-2">
                      <EntranceCompactQuestionCard
                        question={question}
                        isSelected={selectedQuestion?.id === question.id}
                        onClick={() => onQuestionSelect(question)}
                        disabled={disabled}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Loading indicator for fetching next page */}
        {isFetchingNextPage && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
              <span className="text-sm">Loading more questions...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

EntranceCompactQuestionsList.displayName = "EntranceCompactQuestionsList"
