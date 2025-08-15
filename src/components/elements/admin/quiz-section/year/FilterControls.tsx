import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"

interface FilterControlsProps {
  searchTerm: string
  difficultyFilter: string
  priorityFilter: string
  subjectFilter: string
  sortBy: string
  sortOrder: "asc" | "desc"
  uniqueSubjects: string[]
  onSearch: (value: string) => void
  onFilterChange: (type: "difficulty" | "priority" | "subject", value: string) => void
  onSortChange: (field: string, order: "asc" | "desc") => void
  onClearFilters: () => void
  onCreateQuestion: () => void
  disabled?: boolean
}

export const FilterControls = React.memo(({
  searchTerm,
  difficultyFilter,
  priorityFilter,
  subjectFilter,
  sortBy,
  sortOrder,
  uniqueSubjects,
  onSearch,
  onFilterChange,
  onSortChange,
  onClearFilters,
  onCreateQuestion,
  disabled = false,
}: FilterControlsProps) => (
  <div className="bg-white rounded-xl shadow-lg border-0 p-6 mb-8">
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions by text, tags, or subject..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <Button
          onClick={onCreateQuestion}
          disabled={disabled}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Question
        </Button>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => onFilterChange("difficulty", e.target.value)}
              disabled={disabled}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onFilterChange("priority", e.target.value)}
              disabled={disabled}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Priorities</option>
              <option value="1">High (1)</option>
              <option value="2">Medium (2)</option>
              <option value="3">Low (3)</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => onFilterChange("subject", e.target.value)}
              disabled={disabled}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              disabled={disabled}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="difficulty">Difficulty</option>
              <option value="priority">Priority</option>
              <option value="question">Question Text</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>

          {/* Clear Filters */}
          {(searchTerm || difficultyFilter !== "all" || priorityFilter !== "all" || subjectFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onClearFilters}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 transition-all duration-200 text-sm bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap items-center gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Search: &quot;{searchTerm}&quot;
            </Badge>
          )}
          {difficultyFilter !== "all" && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Difficulty: {difficultyFilter}
            </Badge>
          )}
          {priorityFilter !== "all" && (
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              Priority: {priorityFilter === "1" ? "High" : priorityFilter === "2" ? "Medium" : "Low"}
            </Badge>
          )}
          {subjectFilter !== "all" && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Subject: {subjectFilter}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-slate-100 text-slate-800">
            Sort: {sortBy} {sortOrder === "asc" ? "↑" : "↓"}
          </Badge>
        </div>
      </div>
    </div>
  </div>
))

FilterControls.displayName = "FilterControls" 