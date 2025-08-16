"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Shield, Crown, Trash2, Eye, UserCheck, ShieldOff, UserMinus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserActionsMenuProps {
  user: User
  currentUserId?: string
  onPromoteToAdmin: (userId: string) => void
  onPromoteToSuperAdmin: (userId: string) => void
  onRemoveFromAdmin: (userId: string) => void
  onRemoveFromSuperAdmin: (userId: string) => void
  onDeleteUser: (email: string) => void
  onViewUser: (userId: string) => void
  disabled?: boolean
  isLoading?: boolean
}

export function UserActionsMenu({
  user,
  currentUserId,
  onPromoteToAdmin,
  onPromoteToSuperAdmin,
  onRemoveFromAdmin,
  onRemoveFromSuperAdmin,
  onDeleteUser,
  onViewUser,
  disabled = false,
  isLoading = false,
}: UserActionsMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [promoteAdminDialogOpen, setPromoteAdminDialogOpen] = React.useState(false)
  const [promoteSuperAdminDialogOpen, setPromoteSuperAdminDialogOpen] = React.useState(false)
  const [removeAdminDialogOpen, setRemoveAdminDialogOpen] = React.useState(false)
  const [removeSuperAdminDialogOpen, setRemoveSuperAdminDialogOpen] = React.useState(false)

  const isCurrentUser = user.id === currentUserId
  
  // Updated Permission logic - Super admin can modify anyone including themselves
  const canPromoteToAdmin = !user.admin && !user.superAdmin  // Regular users can be promoted to admin
  const canPromoteToSuperAdmin = !user.superAdmin  // Non-super admin users can be promoted to super admin
  const canRemoveFromAdmin = user.admin && !user.superAdmin  // Admin users can be removed from admin
  const canRemoveFromSuperAdmin = user.superAdmin  // Super admin users can be removed from super admin
  const canDelete = !user.superAdmin && !isCurrentUser  // Cannot delete super admins or current user

  const getUserRoleDisplay = () => {
    if (user.superAdmin) {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Super Admin</Badge>
    }
    if (user.admin) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Admin</Badge>
    }
    return <Badge variant="secondary">User</Badge>
  }

  const handlePromoteToAdmin = () => {
    onPromoteToAdmin(user.id)
    setPromoteAdminDialogOpen(false)
  }

  const handlePromoteToSuperAdmin = () => {
    onPromoteToSuperAdmin(user.id)
    setPromoteSuperAdminDialogOpen(false)
  }

  const handleRemoveFromAdmin = () => {
    onRemoveFromAdmin(user.id)
    setRemoveAdminDialogOpen(false)
  }

  const handleRemoveFromSuperAdmin = () => {
    onRemoveFromSuperAdmin(user.id)
    setRemoveSuperAdminDialogOpen(false)
  }

  const handleDeleteUser = () => {
    onDeleteUser(user.email)
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            disabled={disabled || isLoading}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onViewUser(user.id)} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canPromoteToAdmin && (
            <DropdownMenuItem 
              onClick={() => setPromoteAdminDialogOpen(true)} 
              className="cursor-pointer"
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Add to Admin</span>
            </DropdownMenuItem>
          )}

          {canPromoteToSuperAdmin && (
            <DropdownMenuItem 
              onClick={() => setPromoteSuperAdminDialogOpen(true)} 
              className="cursor-pointer"
            >
              <Crown className="mr-2 h-4 w-4" />
              <span>Add to Super Admin</span>
            </DropdownMenuItem>
          )}

          {canRemoveFromAdmin && (
            <DropdownMenuItem 
              onClick={() => setRemoveAdminDialogOpen(true)} 
              className="cursor-pointer text-orange-600 focus:text-orange-600"
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              <span>Remove from Admin</span>
            </DropdownMenuItem>
          )}

          {canRemoveFromSuperAdmin && (
            <DropdownMenuItem 
              onClick={() => setRemoveSuperAdminDialogOpen(true)} 
              className="cursor-pointer text-orange-600 focus:text-orange-600"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              <span>Remove from Super Admin</span>
            </DropdownMenuItem>
          )}

          {(canPromoteToAdmin || canPromoteToSuperAdmin || canRemoveFromAdmin || canRemoveFromSuperAdmin) && canDelete && (
            <DropdownMenuSeparator />
          )}

          {canDelete && (
            <DropdownMenuItem 
              onClick={() => setDeleteDialogOpen(true)} 
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete User</span>
            </DropdownMenuItem>
          )}

          {isCurrentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-blue-600 bg-blue-50">
                <UserCheck className="mr-2 h-4 w-4" />
                <span>This is you</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{user.firstName || "Unknown"} {user.lastName || "User"}</strong>? 
              This action cannot be undone and will permanently remove the user and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Admin Confirmation Dialog */}
      <AlertDialog open={promoteAdminDialogOpen} onOpenChange={setPromoteAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add <strong>{user.firstName || "Unknown"} {user.lastName || "User"}</strong> to Admin role? 
              This will give {isCurrentUser ? "you" : "them"} administrative privileges in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePromoteToAdmin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add to Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Super Admin Confirmation Dialog */}
      <AlertDialog open={promoteSuperAdminDialogOpen} onOpenChange={setPromoteSuperAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Super Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add <strong>{user.firstName || "Unknown"} {user.lastName || "User"}</strong> to Super Admin role? 
              This will give {isCurrentUser ? "you" : "them"} full system privileges including user management capabilities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePromoteToSuperAdmin}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add to Super Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove from Admin Confirmation Dialog */}
      <AlertDialog open={removeAdminDialogOpen} onOpenChange={setRemoveAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{user.firstName || "Unknown"} {user.lastName || "User"}</strong> from Admin role? 
              This will revoke {isCurrentUser ? "your" : "their"} administrative privileges and {isCurrentUser ? "you" : "they"} will become a regular user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveFromAdmin}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Remove from Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove from Super Admin Confirmation Dialog */}
      <AlertDialog open={removeSuperAdminDialogOpen} onOpenChange={setRemoveSuperAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Super Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{user.firstName || "Unknown"} {user.lastName || "User"}</strong> from Super Admin role? 
              This will revoke {isCurrentUser ? "your" : "their"} super admin privileges and {isCurrentUser ? "you" : "they"} will become a regular admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveFromSuperAdmin}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Remove from Super Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
