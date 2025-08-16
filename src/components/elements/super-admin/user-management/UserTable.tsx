"use client"
import React, { useMemo } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserActionsMenu } from "./UserActionsMenu"
import { ChevronUp, ChevronDown, ArrowUpDown, Users, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface UserTableProps {
  users: User[]
  isLoading: boolean
  error?: Error | null
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore: () => void
  onPromoteToAdmin: (userId: string) => void
  onPromoteToSuperAdmin: (userId: string) => void
  onRemoveFromAdmin: (userId: string) => void
  onRemoveFromSuperAdmin: (userId: string) => void
  onDeleteUser: (userId: string) => void
  onViewUser: (userId: string) => void
  currentUserId?: string
  disabled?: boolean
}

const columnHelper = createColumnHelper<User>()

export function UserTable({
  users,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onPromoteToAdmin,
  onPromoteToSuperAdmin,
  onRemoveFromAdmin,
  onRemoveFromSuperAdmin,
  onDeleteUser,
  onViewUser,
  currentUserId,
  disabled = false,
}: UserTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const parentRef = React.useRef<HTMLDivElement>(null)

  const columns = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        id: "user",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              User
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          const user = row.original
          const firstName = user.firstName || ""
          const lastName = user.lastName || ""
          const initials = `${firstName.charAt(0) || "U"}${lastName.charAt(0) || "N"}`.toUpperCase()
          const firstNameInitial = (firstName.charAt(0) || "U").toUpperCase()
          
          return (
            <div className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                {user.image && user.image.trim() !== "" ? (
                  <AvatarImage 
                    src={user.image} 
                    alt={`${firstName} ${lastName}`} 
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold text-sm sm:text-lg">
                    {firstNameInitial}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {firstName || "Unknown"} {lastName || "User"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email || "No email"}</p>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone",
        cell: ({ getValue }) => (
          <div className="text-xs sm:text-sm text-gray-900">{getValue() || "N/A"}</div>
        ),
      }),
      columnHelper.accessor("isVerified", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge 
            variant={getValue() ? "default" : "secondary"} 
            className={`text-xs ${getValue() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
          >
            {getValue() ? "Verified" : "Unverified"}
          </Badge>
        ),
      }),
      columnHelper.accessor("admin", {
        id: "role",
        header: "Role",
        cell: ({ row }) => {
          const user = row.original
          if (user.superAdmin) {
            return <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">Super Admin</Badge>
          }
          if (user.admin) {
            return <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">Admin</Badge>
          }
          return <Badge variant="secondary" className="text-xs">User</Badge>
        },
      }),
      columnHelper.accessor((row) => row.createdAt, {
        id: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Joined
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ getValue }) => {
          const dateValue = getValue()
          if (!dateValue) {
            return (
              <div className="text-sm text-gray-500">
                No date
              </div>
            )
          }
          
          const date = new Date(dateValue)
          if (isNaN(date.getTime())) {
            return (
              <div className="text-sm text-gray-500">
                Invalid date
              </div>
            )
          }
          
          return (
            <div className="text-xs sm:text-sm text-gray-900">
              {format(date, "MMM dd, yyyy")}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <UserActionsMenu
            user={row.original}
            currentUserId={currentUserId}
            onPromoteToAdmin={onPromoteToAdmin}
            onPromoteToSuperAdmin={onPromoteToSuperAdmin}
            onRemoveFromAdmin={onRemoveFromAdmin}
            onRemoveFromSuperAdmin={onRemoveFromSuperAdmin}
            onDeleteUser={onDeleteUser}
            onViewUser={onViewUser}
            disabled={disabled}
          />
        ),
      }),
    ],
    [currentUserId, onPromoteToAdmin, onPromoteToSuperAdmin, onRemoveFromAdmin, onRemoveFromSuperAdmin, onDeleteUser, onViewUser, disabled]
  )

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  // Loading skeleton
  if (isLoading && users.length === 0) {
    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <div className="min-w-[700px] sm:min-w-[800px] md:min-w-[900px]">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2 sm:space-x-4">
                      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[200px]" />
                        <Skeleton className="h-2 sm:h-3 w-[100px] sm:w-[150px]" />
                      </div>
                      <Skeleton className="h-5 w-12 sm:h-6 sm:w-16" />
                      <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
                      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 sm:p-12 text-center">
          <div className="text-red-500 mb-4">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {error.message || "Failed to load users"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!isLoading && users.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 sm:p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-sm sm:text-base text-gray-600">No users match your current filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="min-w-[700px] sm:min-w-[800px] md:min-w-[900px]"> {/* Minimum width for horizontal scroll */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50/80 border-b border-gray-200/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <div key={headerGroup.id} className="flex">
                      {headerGroup.headers.map((header) => (
                        <div
                          key={header.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                            header.id === "user" ? "flex-1 min-w-[250px] sm:min-w-[280px] md:min-w-[320px]" :
                            header.id === "phoneNumber" ? "w-28 sm:w-32 md:w-36 lg:w-40" :
                            header.id === "isVerified" ? "w-20 sm:w-24 md:w-28 lg:w-32" :
                            header.id === "role" ? "w-20 sm:w-24 md:w-28 lg:w-32" :
                            header.id === "createdAt" ? "w-28 sm:w-32 md:w-36 lg:w-40" :
                            header.id === "actions" ? "w-16 sm:w-20 md:w-20 lg:w-24" : "flex-1"
                          }`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Virtualized Table Body */}
                <div
                  ref={parentRef}
                  className="h-[400px] sm:h-[600px] overflow-auto"
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
                    if (scrollHeight - scrollTop - clientHeight < 100 && hasNextPage && !isFetchingNextPage) {
                      onLoadMore()
                    }
                  }}
                >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: "relative",
                    }}
                  >
                    {virtualRows.map((virtualRow) => {
                      const row = rows[virtualRow.index]
                      return (
                        <div
                          key={row.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          className="flex items-center border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <div
                              key={cell.id}
                              className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 ${
                                cell.column.id === "user" ? "flex-1 min-w-[250px] sm:min-w-[280px] md:min-w-[320px]" :
                                cell.column.id === "phoneNumber" ? "w-28 sm:w-32 md:w-36 lg:w-40" :
                                cell.column.id === "isVerified" ? "w-20 sm:w-24 md:w-28 lg:w-32" :
                                cell.column.id === "role" ? "w-20 sm:w-24 md:w-28 lg:w-32" :
                                cell.column.id === "createdAt" ? "w-28 sm:w-32 md:w-36 lg:w-40" :
                                cell.column.id === "actions" ? "w-16 sm:w-20 md:w-20 lg:w-24" : "flex-1"
                              }`}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                  <div className="p-3 sm:p-4 text-center border-t border-gray-200/50">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading more users...</span>
                    </div>
                  </div>
                )}

                {/* No more data indicator */}
                {!hasNextPage && users.length > 0 && (
                  <div className="p-3 sm:p-4 text-center border-t border-gray-200/50 text-sm text-gray-500">
                    No more users to load
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
