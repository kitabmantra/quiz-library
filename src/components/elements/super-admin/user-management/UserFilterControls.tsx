"use client"
import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, RefreshCw, UserPlus } from "lucide-react"

interface UserFilterControlsProps {
  searchTerm: string
  roleFilter: string
  verificationFilter: string
  dateFilter: string
  sortBy: string
  sortOrder: "asc" | "desc"
  onSearch: (searchTerm: string) => void
  onFilterChange: (filterType: "role" | "verification" | "date", value: string) => void
  onSortChange: (sortField: string, order: "asc" | "desc") => void
  onClearFilters: () => void
  onCreateUser?: () => void
  disabled?: boolean
}

export function UserFilterControls({
  searchTerm,
  roleFilter,
  verificationFilter,
  dateFilter,
  sortBy,
  sortOrder,
  onSearch,
  onFilterChange,
  onSortChange,
  onClearFilters,
  onCreateUser,
  disabled = false,
}: UserFilterControlsProps) {
  const hasActiveFilters = 
    searchTerm || 
    roleFilter !== "all" || 
    verificationFilter !== "all" || 
    dateFilter !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc"

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 bg-white/50 border-white/30 focus:bg-white focus:border-purple-300"
              disabled={disabled}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={(value) => onFilterChange("role", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-white/50 border-white/30 focus:bg-white focus:border-purple-300">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="superAdmin">Super Admins</SelectItem>
              </SelectContent>
            </Select>

            {/* Verification Filter */}
            <Select
              value={verificationFilter}
              onValueChange={(value) => onFilterChange("verification", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-white/50 border-white/30 focus:bg-white focus:border-purple-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select
              value={dateFilter}
              onValueChange={(value) => onFilterChange("date", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-white/50 border-white/30 focus:bg-white focus:border-purple-300">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-")
                onSortChange(field, order as "asc" | "desc")
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white/50 border-white/30 focus:bg-white focus:border-purple-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="firstName-asc">Name A-Z</SelectItem>
                <SelectItem value="firstName-desc">Name Z-A</SelectItem>
                <SelectItem value="email-asc">Email A-Z</SelectItem>
                <SelectItem value="email-desc">Email Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                disabled={disabled}
                className="bg-white/50 border-white/30 hover:bg-white hover:border-red-300 text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}

            {onCreateUser && (
              <Button
                onClick={onCreateUser}
                disabled={disabled}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* Compact Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
              <Filter className="w-3 h-3" />
              <span className="font-medium">Filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  "{searchTerm}"
                </span>
              )}
              {roleFilter !== "all" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {roleFilter}
                </span>
              )}
              {verificationFilter !== "all" && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {verificationFilter}
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {dateFilter}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
