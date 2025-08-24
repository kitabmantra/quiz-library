"use client";

import React, { useEffect, useState } from "react";
import { Search, User as UserIcon, BookOpen, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useUserStore } from "@/lib/store/useUserStore";
import { SignOutUser } from "@/lib/actions/auth/sign-out";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function Header() {
    const [mounted, setMounted] = useState(false);
    const { user, clearUser } = useUserStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Get first character of firstName for avatar fallback
    const avatarChar = user?.firstName?.charAt(0).toUpperCase() || "";

    const handleSignOut = async () => {
        const res = await SignOutUser();
        if (res.success) {
            toast.success("Logged out successfully");
            clearUser();
        } else {
            toast.error("Failed to logout");
            return;
        }
        queryClient.invalidateQueries({ queryKey: ["get-user-from-token"] });
        router.refresh();
    };

    return (
        <header className="w-full bg-gradient-to-br from-purple-50 via-white to-purple-100 px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
            {/* Logo - Left Side */}
            <Link href={"/"}>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Q</span>
                    </div>
                    <span className="text-xl font-bold text-purple-800">QuizMaster</span>
                </div>
            </Link>

            {/* Right Side: Navigation Links + User Avatar/Login */}
            <div className="flex items-center space-x-6">
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/quizzes" className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-purple-50">
                        <BookOpen size={18} />
                        <span>Quizzes</span>
                    </Link>
                    <Link href="/leaderboard" className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-purple-50">
                        <Trophy size={18} />
                        <span>Leaderboard</span>
                    </Link>
                </div>

                {/* User Avatar or Login */}
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="w-8 h-8 cursor-pointer border-2 border-purple-200 hover:border-purple-500 transition-colors">
                                {user.image ? (
                                    <AvatarImage src={user.image} alt={`${user.firstName} ${user.lastName}`} />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold">
                                    {avatarChar}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5 text-sm font-medium">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="px-2 py-1.5 text-xs text-gray-500">
                                {user.email}
                            </div>
                            <DropdownMenuItem asChild>
                                <Link href="/user/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/quizzes">Play Quizzes</Link>
                            </DropdownMenuItem>
                            {user.admin && (
                                <DropdownMenuItem asChild>
                                    <Link href="/quiz-section">Admin Section</Link>
                                </DropdownMenuItem>
                            )}

                            {
                                user.superAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/super-admin">Super Admin Panel </Link>
                                    </DropdownMenuItem>
                                )
                            }
                            <DropdownMenuItem asChild>
                                <button className="w-full text-left" onClick={handleSignOut}>
                                    Sign Out
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link href="/login">
                            <div className="flex items-center gap-2 cursor-pointer text-purple-700 hover:text-purple-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-purple-50">
                                <UserIcon size={20} />
                                <span className="hidden sm:inline">Sign In</span>
                            </div>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
