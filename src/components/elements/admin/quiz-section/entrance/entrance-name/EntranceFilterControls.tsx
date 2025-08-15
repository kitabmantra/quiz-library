import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"

interface EntranceFilterControlsProps {
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

export const EntranceFilterControls = React.memo(({
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
}: EntranceFilterControlsProps) => (
  <div className="bg-white rounded-xl shadow-lg border-0 p-6 mb-8">
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search entrance questions..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <Button
          onClick={onCreateQuestion}
          disabled={disabled}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 sm:px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Create Question</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
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
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              disabled={disabled}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="createdAt">Date Created</option>
              <option value="updatedAt">Last Updated</option>
              <option value="difficulty">Difficulty</option>
              <option value="priority">Priority</option>
              <option value="subjectName">Subject</option>
            </select>
            <button
              onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
              disabled={disabled}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Clear Filters */}
          <Button
            onClick={onClearFilters}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2">
        {(difficultyFilter !== "all" || priorityFilter !== "all" || subjectFilter !== "all" || searchTerm) && (
          <>
            <span className="text-sm font-medium text-slate-700">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
              </Badge>
            )}
            {difficultyFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Difficulty: {difficultyFilter}
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Priority: {priorityFilter}
              </Badge>
            )}
            {subjectFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Subject: {subjectFilter}
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  </div>
))

EntranceFilterControls.displayName = "EntranceFilterControls"
