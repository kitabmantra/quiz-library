"use client"
import React, { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGetAllUsers } from "@/lib/hooks/tanstack-query/query-hook/super-admin/use-get-all-users"
import { useGetAllUserStats } from "@/lib/hooks/tanstack-query/query-hook/super-admin/use-get-user-stats"
import { UpdateToAdmin } from "@/lib/actions/quiz/super-admin/put/update-to-admin"
import { UpdateToSuperAdmin } from "@/lib/actions/quiz/super-admin/put/update-to-super-admin"
import { RemoveFromAdmin } from "@/lib/actions/quiz/super-admin/put/remove-from-admin"
import { RemoveFromSuperAdmin } from "@/lib/actions/quiz/super-admin/put/remove-from-super-admin"
import { deleteUser } from "@/lib/actions/quiz/super-admin/delete/delete-user"
import { useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

import { UserStatsCards } from "./UserStatsCards"
import { UserFilterControls } from "./UserFilterControls"
import { UserTable } from "./UserTable"
import { useUserStore } from "@/lib/store/useUserStore"

function UserManagementPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isActionInProgress, setIsActionInProgress] = useState(false)
  const {user} = useUserStore();

  const currentUserId = user?.id 

  const { data: userStats, error: userStatsError, isLoading: userStatsLoading } = useGetAllUserStats()


  
  const {
    data: usersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useGetAllUsers(
    {
      search: debouncedSearchTerm,
    },
    100,
  )


  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  
  const allUsers = useMemo(() => {
    if (!usersData?.pages || usersData.pages.length === 0) {
      console.log("No pages found or empty pages")
      return []
    }
    
    
    const flattenedUsers = usersData.pages.flatMap((page) => {
      return page.data?.users || []
    })
    
    return flattenedUsers
  }, [usersData])


  const stats = useMemo(() => {
    if (!userStats?.success || !userStats?.stats) {
      return {
        totalUsers: allUsers.length,
        totalAdmins: allUsers.filter(user => user.admin && !user.superAdmin).length,
        totalSuperAdmins: allUsers.filter(user => user.superAdmin).length,
        recentUsers: 0,
      }
    }
    
    console.log("this is the user stats INSIDE MEMO : ", userStats.stats)
  
    return {
      totalUsers: userStats.stats.totalUsers || allUsers.length,
      totalAdmins: userStats.stats.totalAdmins || allUsers.filter(user => user.admin && !user.superAdmin).length,
      totalSuperAdmins: userStats.stats.totalSuperAdmins || allUsers.filter(user => user.superAdmin).length,
      recentUsers: userStats.stats.totalVerifiedUsers || 0, 
    }
  }, [userStats, allUsers])

  console.log("this is the stats : ", stats)

  const totalUsers = useMemo(() => {
        return (userStats?.success && userStats?.stats?.totalUsers) ? userStats.stats.totalUsers : allUsers.length
  }, [userStats, allUsers.length])

  
  const filteredUsers = useMemo(() => {
    
    if (allUsers.length === 0) {
      return []
    }

    const filtered = allUsers.filter((user) => {
      
      if (roleFilter === "admin" && (!user.admin || user.superAdmin)) return false
      if (roleFilter === "superAdmin" && !user.superAdmin) return false
      if (roleFilter === "user" && (user.admin || user.superAdmin)) return false

      if (verificationFilter === "verified" && !user.isVerified) return false
      if (verificationFilter === "unverified" && user.isVerified) return false

    
      if (dateFilter !== "all") {
        const userDate = new Date(user.createdAt)
        const now = new Date()
        
        switch (dateFilter) {
          case "today":
            if (userDate.toDateString() !== now.toDateString()) return false
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (userDate < weekAgo) return false
            break
          case "month":
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            if (userDate < monthAgo) return false
            break
          case "year":
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            if (userDate < yearAgo) return false
            break
        }
      }

      return true
    })
    
    return filtered
  }, [allUsers, roleFilter, verificationFilter, dateFilter])




  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage])

  const handleBack = useCallback(() => {
    router.push(`/super-admin`)
  }, [router])


  const handleSearch = useCallback(async (searchValue: string) => {
    setSearchTerm(searchValue)
  }, [])

  const handleFilterChange = useCallback(async (filterType: "role" | "verification" | "date", value: string) => {
    if (filterType === "role") {
      setRoleFilter(value)
    } else if (filterType === "verification") {
      setVerificationFilter(value)
    } else if (filterType === "date") {
      setDateFilter(value)
    }
  }, [])

  const handleSortChange = useCallback(async (sortField: string, order: "asc" | "desc") => {
    setSortBy(sortField)
    setSortOrder(order)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setRoleFilter("all")
    setVerificationFilter("all")
    setDateFilter("all")
    setSortBy("createdAt")
    setSortOrder("desc")
  }, [])


  const handlePromoteToAdmin = useCallback(async (userId: string) => {
    setIsActionInProgress(true)
    try {
      const res = await UpdateToAdmin(userId)
      if (res.success && res.message) {
        toast.success(res.message)
        
        queryClient.invalidateQueries({
          queryKey: ["get-all-users", {
            search: debouncedSearchTerm, 
          }, 100]
        })
        
        queryClient.invalidateQueries({
          queryKey: ["get-all-users-stats"]
        })
      } else if (!res.success && res.error) {
        toast.error(res.error)
      } else {
        toast.error("Failed to promote user to admin. Please try again.")
      }
    } catch (error) {
      console.error("Error promoting user to admin:", error)
      toast.error("Failed to promote user to admin. Please try again.")
    } finally {
      setIsActionInProgress(false)
    }
  }, [debouncedSearchTerm, queryClient])

  const handlePromoteToSuperAdmin = useCallback(async (userId: string) => {
    setIsActionInProgress(true)
    try {
      const res = await UpdateToSuperAdmin(userId)
      if (res.success && res.message) {
        toast.success(res.message)
        

        queryClient.invalidateQueries({
          queryKey: ["get-all-users", {
            search: debouncedSearchTerm, 
          }, 100]
        })
        

        queryClient.invalidateQueries({
          queryKey: ["get-all-users-stats"]
        })
      } else if (!res.success && res.error) {
        toast.error(res.error)
      } else {
        toast.error("Failed to promote user to super admin. Please try again.")
      }
    } catch (error) {
      console.error("Error promoting user to super admin:", error)
      toast.error("Failed to promote user to super admin. Please try again.")
    } finally {
      setIsActionInProgress(false)
    }
  }, [debouncedSearchTerm, queryClient])

  const handleRemoveFromAdmin = useCallback(async (userId: string) => {
    setIsActionInProgress(true)
    try {
      const res = await RemoveFromAdmin(userId)
      if (res.success && res.message) {
        toast.success(res.message)
        
        queryClient.invalidateQueries({
          queryKey: ["get-all-users", {
            search: debouncedSearchTerm, 
          }, 100]
        })
        
        queryClient.invalidateQueries({
          queryKey: ["get-all-users-stats"]
        })
      } else if (!res.success && res.error) {
        toast.error(res.error)
      } else {
        toast.error("Failed to remove user from admin. Please try again.")
      }
    } catch (error) {
      console.error("Error removing user from admin:", error)
      toast.error("Failed to remove user from admin. Please try again.")
    } finally {
      setIsActionInProgress(false)
    }
  }, [debouncedSearchTerm, queryClient])

  const handleRemoveFromSuperAdmin = useCallback(async (userId: string) => {
    setIsActionInProgress(true)
    try {
      const res = await RemoveFromSuperAdmin(userId)
      if (res.success && res.message) {
        toast.success(res.message)
        
        queryClient.invalidateQueries({
          queryKey: ["get-all-users", {
            search: debouncedSearchTerm, 
          }, 100]
        })
        
        queryClient.invalidateQueries({
          queryKey: ["get-all-users-stats"]
        })
      } else if (!res.success && res.error) {
        toast.error(res.error)
      } else {
        toast.error("Failed to remove user from super admin. Please try again.")
      }
    } catch (error) {
      console.error("Error removing user from super admin:", error)
      toast.error("Failed to remove user from super admin. Please try again.")
    } finally {
      setIsActionInProgress(false)
    }
  }, [debouncedSearchTerm, queryClient])

  const handleDeleteUser = useCallback(async (email : string) => {
    setIsActionInProgress(true)
    try {
      const res = await deleteUser(email)
      if (res.success && res.message) {
        toast.success(res.message)
        

        queryClient.invalidateQueries({
          queryKey: ["get-all-users", {
            search: debouncedSearchTerm, 
          }, 100]
        })
        

        queryClient.invalidateQueries({
          queryKey: ["get-all-users-stats"]
        })
      } else if (!res.success && res.error) {
        toast.error(res.error as string)
      } else {
        toast.error("Failed to delete user. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user. Please try again.")
    } finally {
      setIsActionInProgress(false)
    }
  }, [debouncedSearchTerm, queryClient])

  const handleViewUser = useCallback((userId: string) => {
    router.push(`/super-admin/users/${userId}`)
  }, [router])


  const disabled = isActionInProgress || isLoading || isFetchingNextPage || userStatsLoading


  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Failed to load user data"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-7xl">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <button
              onClick={handleBack}
              disabled={disabled}
              className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 shadow-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                User Management
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 truncate">Manage system users, roles, and permissions</p>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <UserStatsCards stats={stats} totalUsers={totalUsers} error={userStatsError} isLoading={userStatsLoading} />
        </div>

        <div className="mb-4 sm:mb-6">
          <UserFilterControls
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            verificationFilter={verificationFilter}
            dateFilter={dateFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onClearFilters={clearFilters}
            disabled={disabled}
          />
        </div>

        
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <UserTable
                users={filteredUsers}
                isLoading={isLoading}
                error={error}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={loadMore}
                onPromoteToAdmin={handlePromoteToAdmin}
                onPromoteToSuperAdmin={handlePromoteToSuperAdmin}
                onRemoveFromAdmin={handleRemoveFromAdmin}
                onRemoveFromSuperAdmin={handleRemoveFromSuperAdmin}
                onDeleteUser={handleDeleteUser}
                onViewUser={handleViewUser}
                currentUserId={currentUserId}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
