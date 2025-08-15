"use client"

import type React from "react"
import { useState, useMemo, useCallback,  useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, TrendingUp, AlertCircle, X, RefreshCw, ArrowLeft, Clock, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useFacultyName } from '@/lib/hooks/params/useFaucltyName'
import { useLevelName } from '@/lib/hooks/params/useLevelName'
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useGetAcademicYear } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-year"
import { createYear, type CreateYearRequestType } from "@/lib/actions/quiz/year/post/create-year"
import { updateYear, type UpdateYearRequestType } from "@/lib/actions/quiz/year/put/update-year"
import { deleteYear, type DeleteYearRequestType } from "@/lib/actions/quiz/year/delete/delete-year"
import { Badge } from "@/components/ui/badge"

// Enhanced validation schema
const yearSchema = z.object({
  yearName: z
    .string()
    .min(2, "Year name must be at least 2 characters")
    .max(50, "Year name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\-_\s]+$/, "Only letters, numbers, hyphens, underscores, and spaces are allowed")
    .transform((val) => {
      // Trim spaces from front and back
      const trimmed = val.trim()
      // Convert to lowercase and replace spaces with hyphens
      const formatted = trimmed
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace one or more spaces with single hyphen
        .replace(/[^a-z0-9\-_]/g, "") // Allow only a-z, 0-9, -, _
      // Remove hyphens and underscores from start and end
      return formatted.replace(/^[-_]+|[-_]+$/g, "")
    })
    .refine((val) => val.length >= 2, "Year name must be at least 2 characters after formatting")
    .refine(
      (val) => !val.startsWith("-") && !val.startsWith("_") && !val.endsWith("-") && !val.endsWith("_"),
      "Year name cannot start or end with hyphens or underscores"
    ),
})

type YearFormValues = z.infer<typeof yearSchema>

interface YearResponse {
  id: string
  levelName: string
  typeName: string
  faculty: string
  yearName: string
  createdAt: string
  updatedAt: string
  displayName?: string // Added for original year name display
}

export interface GetYearQueryType {
    typeName : "academic" | "entrance"
    levelName : string
    faculty : string
}

type SortOption = "name-asc" | "name-desc" | "created-asc" | "created-desc"

function YearListpage() {
  const facultyName = useFacultyName()
  const levelName = useLevelName()
  const { data: academicYear, isLoading, error, refetch } = useGetAcademicYear({
    typeName : "academic",
    levelName : levelName,
    faculty : facultyName
  })
  
  // Debug logging
  useEffect(() => {
    console.log("YearListpage Debug:", {
      levelName,
      facultyName,
      academicYear,
      isLoading,
      error,
      yearsCount: academicYear?.years?.length || 0,
      success: academicYear?.success,
      errorMessage: academicYear?.error
    });
  }, [levelName, facultyName, academicYear, isLoading, error]);

  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("name-asc")
  const [editingYear, setEditingYear] = useState<YearResponse | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const years = useMemo(() => {
    // Check if academicYear exists and has success: true
    if (!academicYear || academicYear.success !== true) {
      console.log("No valid academicYear data:", { academicYear });
      return [];
    }

    // Ensure we have a valid array of years - handle different possible structures
    let allYears: YearResponse[] = [];
    if (Array.isArray(academicYear.years)) {
      allYears = academicYear.years;
    } else if (academicYear.years && typeof academicYear.years === 'object') {
      // If it's an object, try to extract the array
      const possibleArray = Object.values(academicYear.years).find(val => Array.isArray(val));
      if (possibleArray) {
        allYears = possibleArray as YearResponse[];
      }
    }
    
    console.log("Processing years:", allYears);
    console.log("Search term:", searchTerm);
    console.log("Sort by:", sortBy);
    
    // First filter by search term
    let filtered = allYears;
    if (searchTerm.trim()) {
      filtered = allYears.filter((year: YearResponse) => {
        const yearName = year.yearName.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return yearName.includes(searchLower);
      });
    }
    
    // Then sort the filtered results
    const sorted = [...filtered].sort((a: YearResponse, b: YearResponse) => {
      switch (sortBy) {
        case "name-asc":
          return a.yearName.localeCompare(b.yearName);
        case "name-desc":
          return b.yearName.localeCompare(a.yearName);
        case "created-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    console.log("Filtered and sorted years:", sorted);
    return sorted;
  }, [academicYear, searchTerm, sortBy])

  const form = useForm<YearFormValues>({
    resolver: zodResolver(yearSchema),
    defaultValues: {
      yearName: "",
    },
  })

  const editForm = useForm<YearFormValues>({
    resolver: zodResolver(yearSchema),
    defaultValues: {
      yearName: "",
    },
  })

  const onSubmit = useCallback(
    async (values: YearFormValues) => {
      if (creating) return
      setCreating(true)
      try {
        const formData: CreateYearRequestType = {
          levelName: levelName,
          typeName: "academic" as const,
          faculty: facultyName,
          yearName: values.yearName,
        }
        const res = await createYear(formData)
        if (res.success) {
          toast.success("Year created successfully!")
          form.reset()
          setShowCreateForm(false)
          // Invalidate with the correct query key
          queryClient.invalidateQueries({ queryKey: ["get-academic-year", "academic", levelName, facultyName] })
        } else {
          toast.error(res.error as string || "Failed to create year. Please try again.")
        }
      } catch (error) {
        toast.error((error as string) || "An error occurred while creating the year")
      } finally {
        setCreating(false)
      } 
    },
    [creating, form, queryClient, levelName, facultyName]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // Apply real-time formatting while typing
      const formattedValue = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-_]/g, "")// Remove -/_ from start/end
      form.setValue("yearName", formattedValue)
    },
    [form]
  )

  const handleEditInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // Apply real-time formatting while typing - same as creating
      const formattedValue = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-_]/g, "")
      editForm.setValue("yearName", formattedValue)
    },
    [editForm]
  )

  const stats = useMemo(() => {
    const total = years.length
    // Since all years are academic, we don't need to filter by type
    return { total, academic: total, entrance: 0 }
  }, [years])

  // Action handlers
  const handleDelete = useCallback(
    async (year: YearResponse) => {
      try {
        setDeleting(true)
        const deleteData: DeleteYearRequestType = {
          id: year.id,
        }
        const res = await deleteYear(deleteData)
        if (res.success) {
          toast.success(`"${year.yearName}" deleted successfully`)
          // Invalidate with the correct query key
          queryClient.invalidateQueries({ queryKey: ["get-academic-year", "academic", levelName, facultyName] })
        } else {
          toast.error(res.error || "Failed to delete year")
        }
      } catch (error) {
        toast.error("Failed to delete year")
        console.error("Error deleting year:", error)
      } finally {
        setDeleting(false)
      }
    },
    [queryClient, levelName, facultyName]
  )

  const handleUpdate = useCallback(
    (year: YearResponse) => {
      setEditingYear(year)
      editForm.reset({ yearName: year.yearName })
    },
    [editForm]
  )

  const handleEditSubmit = useCallback(
    async (values: YearFormValues) => {
      if (!editingYear) return

      // Use the same validation logic as creating
      const formattedValue = values.yearName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-_]/g, "")

      if (formattedValue === editingYear.yearName) {
        toast.error("Please make some changes to the year name before updating")
        return
      }

      try {
        setUpdating(true)
        const updateData: UpdateYearRequestType = {
          id: editingYear.id,
          type : "academic" as const,
          levelName ,
          faculty : facultyName,
          yearName: formattedValue, // Use the formatted value
        }
        const res = await updateYear(updateData)
        if (res.success) {
          toast.success(`"${editingYear.yearName}" updated successfully`)
          // Invalidate with the correct query key
          queryClient.invalidateQueries({ queryKey: ["get-academic-year", "academic", levelName, facultyName] })
          setEditingYear(null)
          editForm.reset()
        } else {
          toast.error(res.error || "Failed to update year")
        }
      } catch (error) {
        toast.error((error as string) || "An error occurred while updating the year")
      } finally {
        setUpdating(false)
      }
    },
    [editingYear, editForm, queryClient, levelName, facultyName]
  )

  const handleVisit = useCallback(
    (year: YearResponse) => {
      router.push(`/quiz-section/academic/level/${levelName}/faculty/${facultyName}/${year.yearName}`)
    },
    [router, levelName, facultyName]
  )

  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle API error (network error, etc.)
  if (error) {
    console.error("YearListpage Error:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Years</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Failed to load year data"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Handle backend error (success: false)
  if (academicYear && academicYear.success === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Years</h3>
          <p className="text-gray-600 mb-4">
            {academicYear.error || "Failed to load year data from server"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push(`/quiz-section/academic/level/${levelName}`)} 
                  className="p-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Year Management</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <button
                      onClick={() => router.push('/quiz-section/academic')}
                      className="hover:text-blue-600 hover:underline transition-colors"
                    >
                      Academic
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => router.push(`/quiz-section/academic/level/${levelName}`)}
                      className="hover:text-blue-600 hover:underline transition-colors capitalize"
                    >
                      {levelName.replace(/-/g, " ")}
                    </button>
                    <span>•</span>
                    <span className="text-blue-600 font-medium underline capitalize">
                      {facultyName.replace(/-/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile Responsive */}
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 sm:px-3 py-2 min-w-[80px] sm:min-w-[100px]">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-900">Total</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-2 sm:px-3 py-2 min-w-[80px] sm:min-w-[100px]">
                <div className="flex items-center gap-1 sm:gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-green-900">Academic</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">{stats.academic}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Controls Section */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search years..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  disabled={creating || updating || deleting}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="created-asc">Oldest First</SelectItem>
                    <SelectItem value="created-desc">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md h-9 text-sm sm:text-base"
                disabled={creating || updating || deleting}
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create New Year</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Create Form Card */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Year</DialogTitle>
            <DialogDescription>
              Add a new academic year to the faculty. Examples: First Year, Second Year, Third Year, Fourth Year
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="yearName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., first-year, second-year, third-year"
                        value={field.value}
                        onChange={handleInputChange}
                        disabled={creating}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        autoFocus
                        ref={(el) => {
                          if (el && showCreateForm) {
                            setTimeout(() => el.focus(), 100)
                          }
                        }}
                      />
                    </FormControl>
                    {field.value && (
                      <p className="text-xs text-gray-500 mt-1">
                        Formatted: <span className="font-mono text-blue-600">{field.value}</span>
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    form.reset()
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {creating ? "Creating..." : "Create Year"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Year Dialog */}
      <Dialog open={!!editingYear} onOpenChange={(open) => !open && setEditingYear(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Year</DialogTitle>
            <DialogDescription>
              Update the year name. Current: {editingYear?.yearName.replace(/-/g, " ")}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="yearName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., first-year, second-year, third-year"
                        value={field.value}
                        onChange={handleEditInputChange}
                        disabled={updating}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        autoFocus
                        ref={(el) => {
                          if (el && editingYear) {
                            setTimeout(() => el.focus(), 100)
                          }
                        }}
                      />
                    </FormControl>
                    {field.value && (
                      <p className="text-xs text-gray-500 mt-1">
                        Formatted: <span className="font-mono text-blue-600">{field.value}</span>
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingYear(null)
                    editForm.reset()
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="bg-green-600 hover:bg-green-700 text-white">
                  {updating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {updating ? "Updating..." : "Update Year"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto h-full">
          {isLoading ? (
            // Loading state - show simple skeletons
            <div className="p-4 space-y-4">
              <div className="lg:hidden">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg animate-pulse"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : years.length > 0 ? (
            // Data available - show years with optimized rendering
            <div className="p-4 space-y-6">
              {/* Mobile View */}
              <div className="lg:hidden">
                <div className="space-y-4">
                  {years.map((year) => (
                    <div
                      key={year.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => handleVisit(year)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 capitalize">
                              {year.yearName.replace(/-/g, " ")}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ID: {year.id.slice(0, 8)}...
                            </p>
                            {year.displayName && year.displayName !== year.yearName && (
                              <p className="text-xs text-gray-400 mt-1">
                                Original: {year.displayName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVisit(year)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(year)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(year)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {years.map((year) => (
                    <div
                      key={year.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                      onClick={() => handleVisit(year)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVisit(year)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(year)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(year)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 capitalize text-lg">
                          {year.yearName.replace(/-/g, " ")}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>ID: {year.id.slice(0, 8)}...</p>
                          <p>Created: {new Date(year.createdAt).toLocaleDateString()}</p>
                          <p>Updated: {new Date(year.updatedAt).toLocaleDateString()}</p>
                          {year.displayName && year.displayName !== year.yearName && (
                            <p className="text-gray-500">
                              Original: {year.displayName}
                            </p>
                          )}
                        </div>
                        <div className="pt-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Academic
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show more button for large datasets */}
              {years.length > 20 && (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    Load More Years
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // No data - show empty state
            <div className="flex items-center justify-center h-full min-h-[400px] p-4 sm:p-6">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {searchTerm ? "No matching years found" : "No years yet"}
                </h3>
                <p className="text-base text-gray-600 mb-6">
                  {searchTerm
                    ? `No years match "${searchTerm}". Try adjusting your search.`
                    : "Create your first year to get started with examples like first-year, second-year, third-year."}
                </p>
                {searchTerm ? (
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Year
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default YearListpage
