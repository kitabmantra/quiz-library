"use client"

import type React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useGetAcademicCategory } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/use-get-academic-category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Plus,
  GraduationCap,
  Calendar,
  Hash,
  Search,
  BookOpen,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { createAcademicLevel, type CreateAcademicLevel } from "@/lib/actions/quiz/academic/post/create-level"
import { useQueryClient } from "@tanstack/react-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteAcademicLevel } from "@/lib/actions/quiz/academic/delete/delete-academic-level"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { updateAcademicLevel, UpdateAcademicLevelType } from "@/lib/actions/quiz/academic/put/update-acacemic-level"

// Skeleton Components for Mobile List View
function MobileListSkeleton() {
  return (
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
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
        </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton Components for Desktop Card View
function DesktopCardSkeleton() {
  return (
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
          <div className="pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}


// Enhanced validation schema
const levelSchema = z.object({
  levelName: z
    .string()
    .min(2, "Level name must be at least 2 characters")
    .max(50, "Level name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\-_\s]+$/, "Only letters, numbers, hyphens, underscores, and spaces are allowed")
    .transform((val) => {
      // Trim spaces from front and back
      const trimmed = val.trim()
      // Convert to lowercase and replace spaces with hyphens
      const formatted = trimmed
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-_]/g, "")
      // Remove hyphens from start and end
      return formatted.replace(/^-+|-+$/g, "")
    })
    .refine((val) => val.length >= 2, "Level name must be at least 2 characters after formatting")
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Level name cannot start or end with hyphens"),
})

type LevelFormValues = z.infer<typeof levelSchema>

interface AcademicCategory {
  id: string
  type: "academic" | "entrance"
  levelName: string
  createdAt: string
}

function AcademicManagementPage() {
  const { data: academicCategory, isLoading, error } = useGetAcademicCategory()
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCategory, setEditingCategory] = useState<AcademicCategory | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<AcademicCategory | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const categories = useMemo(() => {
    const allCategories = academicCategory?.categories || []
    if (!searchTerm) return allCategories
    return allCategories.filter((category: AcademicCategory) =>
      category.levelName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [academicCategory, searchTerm])

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      levelName: "",
    },
  })

  const editForm = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      levelName: "",
    },
  })

  const onSubmit = useCallback(
    async (values: LevelFormValues) => {
      if (creating) return
      setCreating(true)
      try {
        const formData: CreateAcademicLevel = {
          levelName: values.levelName,
          type: "academic" as const,
        }
        const res = await createAcademicLevel(formData)
        if (res.success) {
          toast.success("Academic level created successfully!")
          form.reset()
          setShowCreateForm(false)
          queryClient.invalidateQueries({ queryKey: ["get-academic-category"] })
        } else {
          toast.error(res.error || "Failed to create level. Please try again.")
        }
      } catch (error) {
        toast.error((error as string) || "An error occurred while creating the level")
      } finally {
        setCreating(false)
      }
    },
    [creating, form, queryClient],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      form.setValue("levelName", value)
    },
    [form],
  )

  const getFormattedPreview = useCallback((value: string) => {
    // Trim spaces from front and back
    const trimmed = value.trim()
    // Convert to lowercase and replace spaces with hyphens
    const formatted = trimmed
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    // Remove hyphens from start and end
    return formatted
  }, [])

  const stats = useMemo(() => {
    const total = categories.length
    const academic = categories.filter((c: AcademicCategory) => c.type === "academic").length
    const entrance = categories.filter((c: AcademicCategory) => c.type === "entrance").length
    return { total, academic, entrance }
  }, [categories])

  // Action handlers
  const handleDelete = useCallback(async (category: AcademicCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return
    
    try {
      setDeleting(true)
      const res = await deleteAcademicLevel(categoryToDelete.id)
      if (res.success) {
        toast.success(`"${categoryToDelete.levelName}" deleted successfully`)
        queryClient.invalidateQueries({ queryKey: ["get-academic-category"] })
      } else {
        toast.error(res.error || "Failed to delete level")
      }
    } catch (error) {
      toast.error("Failed to delete level")
      console.error("Error deleting level:", error)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }, [categoryToDelete, queryClient])

  const handleUpdate = useCallback(
    (category: AcademicCategory) => {
      setEditingCategory(category)
      editForm.reset({ levelName: category.levelName })
    },
    [editForm],
  )

  // Auto-focus the input when editing starts
  useEffect(() => {
    if (editingCategory) {
      // Use setTimeout to ensure the input is rendered before focusing
      setTimeout(() => {
        const editInput = document.querySelector(`input[data-edit-id="${editingCategory.id}"]`) as HTMLInputElement
        if (editInput) {
          editInput.focus()
          editInput.select() // Also select all text for better UX
        }
      }, 100)
    }
  }, [editingCategory])

  const handleEditSubmit = useCallback(
    async (values: LevelFormValues) => {
      if (!editingCategory) return

      if (values.levelName.toLowerCase().replace(/\s+/g, "-") === editingCategory.levelName) {
        toast.error("Please make some changes to the level name before updating")
        return
      }

      try {
        setUpdating(true)
        const updateData: UpdateAcademicLevelType= {
          id: editingCategory.id,
          levelName: values.levelName,
          type: editingCategory.type,
          oldName : editingCategory.levelName
        }
        const res = await updateAcademicLevel(updateData)
        if (res.success) {
          toast.success(`"${editingCategory.levelName}" updated successfully`)
          queryClient.invalidateQueries({ queryKey: ["get-academic-category"] })
          setEditingCategory(null)
          editForm.reset()
        } else {
          toast.error(res.error || "Failed to update level")
        }
      } catch (error) {
        toast.error((error as string) || "An error occurred while updating the level")
      } finally {
        setUpdating(false)
      }
    },
    [editingCategory, editForm, queryClient],
  )

  const handleVisit = useCallback(
    (category: AcademicCategory) => {
      router.push(`/quiz-section/academic/level/${category.levelName}`)
    },
    [router],
  )

  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Categories</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/quiz-section')} 
                  className="p-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Academic Level Management</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <button
                      onClick={() => router.push('/quiz-section')}
                      className="hover:text-blue-600 hover:underline transition-colors"
                    >
                      Quiz Section
                    </button>
                    <span>•</span>
                    <span className="text-blue-600 font-medium underline">
                      Academic
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile Responsive */}
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 sm:px-3 py-2 min-w-[80px] sm:min-w-[100px]">
                <div className="flex items-center gap-1 sm:gap-2">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search academic levels..."
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

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md h-9 text-sm sm:text-base"
              disabled={creating || updating || deleting || (isLoading && !academicCategory)}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Create New Level</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Create Level Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Create New Academic Level
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Add a new level for academic content organization. The system will automatically format your input.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="levelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Level Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Bachelor of Science, Master Degree"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        {...field}
                        onChange={(e) => {
                          handleInputChange(e)
                          field.onChange(e)
                        }}
                        disabled={creating || updating || deleting}
                      />
                    </FormControl>
                    <FormMessage />

                    {field.value && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-700 font-medium">Preview:</span>
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs">
                            {getFormattedPreview(field.value)}
                          </code>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Formatting Rules:</p>
                          <ul className="space-y-1 text-xs">
                            <li>{"• Spaces will be replaced with hyphens (-)"}</li>
                            <li>• Text will be converted to lowercase</li>
                            <li>• Only letters, numbers, hyphens, and underscores allowed</li>
                            <li>• Maximum 50 characters</li>
                            <li>• Cannot start or end with hyphens</li>
                            <li>• Leading/trailing spaces will be removed</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    form.reset()
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                  disabled={creating || updating || deleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || updating || deleting}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] transition-colors w-full sm:w-auto"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Level"
                  )}
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
                <MobileListSkeleton />
              </div>

              <div className="hidden lg:block">
                <DesktopCardSkeleton />
              </div>
              </div>
            ) : categories.length > 0 ? (
            // Data available - show categories with optimized rendering
            <div className="p-4 space-y-6">
                              {/* Mobile View */}
              <div className="lg:hidden">
                <div className="space-y-4">
                  {categories.map((category: AcademicCategory) => (
                    <div
                      key={category.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => handleVisit(category)}
                      onMouseOver={()=>router.prefetch(`/quiz-section/academic/level/${category.levelName}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            {editingCategory?.id === category.id ? (
                              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  value={editForm.watch("levelName")}
                                  onChange={(e) => editForm.setValue("levelName", e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !updating) {
                                      editForm.handleSubmit(handleEditSubmit)()
                                    }
                                  }}
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                  placeholder="Enter level name"
                                  disabled={updating}
                                  data-edit-id={category.id}
                                  autoFocus
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => editForm.handleSubmit(handleEditSubmit)()}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {updating ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCategory(null)
                                      editForm.reset()
                                    }}
                                    disabled={updating}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium text-gray-900 capitalize">
                                  {category.levelName.replace(/-/g, " ")}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  ID: {category.id.slice(0, 8)}...
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.type === "academic" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {category.type}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => handleVisit(category)} className="cursor-pointer text-sm" disabled={creating || updating || deleting}>
                                <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                Visit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdate(category)} className="cursor-pointer text-sm" disabled={creating || updating || deleting}>
                                <Edit className="w-4 h-4 mr-2 text-green-600" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(category)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 text-sm" disabled={creating || updating || deleting}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                            {/* Desktop View */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categories.map((category: AcademicCategory) => (
                    <div
                      key={category.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                      onClick={() => handleVisit(category)}
                      onMouseOver={()=>router.prefetch(`/quiz-section/academic/level/${category.levelName}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handleVisit(category)} className="cursor-pointer text-sm" disabled={creating || updating || deleting}>
                                <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                Visit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdate(category)} className="cursor-pointer text-sm" disabled={creating || updating || deleting}>
                                <Edit className="w-4 h-4 mr-2 text-green-600" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(category)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 text-sm" disabled={creating || updating || deleting}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {editingCategory?.id === category.id ? (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editForm.watch("levelName")}
                              onChange={(e) => editForm.setValue("levelName", e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !updating) {
                                  editForm.handleSubmit(handleEditSubmit)()
                                }
                              }}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                              placeholder="Enter level name"
                              disabled={updating}
                              data-edit-id={category.id}
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => editForm.handleSubmit(handleEditSubmit)()}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {updating ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(null)
                                  editForm.reset()
                                }}
                                disabled={updating}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-gray-900 capitalize text-lg">
                              {category.levelName.replace(/-/g, " ")}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>ID: {category.id.slice(0, 8)}...</p>
                              <p>Created: {new Date(category.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="pt-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  category.type === "academic" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {category.type}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // No data - show empty state
            <div className="flex items-center justify-center h-full min-h-[400px] p-4 sm:p-6">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {searchTerm ? "No matching levels found" : "No academic levels yet"}
                </h3>
                <p className="text-base text-gray-600 mb-6">
                  {searchTerm
                    ? `No levels match "${searchTerm}". Try adjusting your search.`
                    : "Create your first academic level to get started."}
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
                    Create First Level
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the academic level{" "}
              <span className="font-semibold text-gray-900">
                "{categoryToDelete?.levelName.replace(/-/g, " ")}"
              </span>{" "}
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete Level"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AcademicManagementPage
