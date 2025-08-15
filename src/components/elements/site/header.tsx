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
    const {user, clearUser} = useUserStore();
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
        <header className="w-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
            {/* Logo - Left Side */}
            <Link href={"/"}>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Q</span>
                    </div>
                    <span className="text-xl font-bold text-sky-800">QuizMaster</span>
                </div>
            </Link>

            {/* Search Bar - Centered */}
            <div className="flex-1 max-w-2xl mx-4">
                <div className="flex">
                    <Input
                        type="text"
                        placeholder="Search quizzes..."
                        className="w-full bg-white text-black placeholder:text-gray-500 rounded-r-none border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                    />
                    <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-l-none">
                        <Search />
                    </Button>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
                <Link href="/quizzes" className="flex items-center gap-2 text-sky-700 hover:text-sky-800 font-medium transition-colors">
                    <BookOpen size={18} />
                    <span>Quizzes</span>
                </Link>
                <Link href="/leaderboard" className="flex items-center gap-2 text-sky-700 hover:text-sky-800 font-medium transition-colors">
                    <Trophy size={18} />
                    <span>Leaderboard</span>
                </Link>
            </div>

            {/* Right Side: User Avatar or Login */}
            <div className="flex items-center space-x-4 flex-shrink-0">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="w-8 h-8 cursor-pointer border-2 border-sky-200 hover:border-sky-500 transition-colors">
                                {user.image ? (
                                    <AvatarImage src={user.image} alt={`${user.firstName} ${user.lastName}`} />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold">
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
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/my-quizzes">My Quizzes</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/quiz-history">Quiz History</Link>
                            </DropdownMenuItem>
                            {user.admin && (
                                <DropdownMenuItem asChild>
                                    <Link href="/admin">Admin Panel</Link>
                                </DropdownMenuItem>
                            )}
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
                            <div className="flex items-center space-x-2 cursor-pointer text-sky-700 hover:text-sky-800 font-medium transition-colors">
                                <UserIcon size={20} />
                                <span className="hidden sm:inline">Sign In</span>
                            </div>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 font-medium transition-all">
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
