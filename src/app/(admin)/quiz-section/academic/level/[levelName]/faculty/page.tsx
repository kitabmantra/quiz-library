"use client"
import { useLevelName } from '@/lib/hooks/params/useLevelName'
import { redirect, RedirectType } from 'next/navigation'
function page() {
    const levelName = useLevelName();
    redirect(`/quiz-section/academic/level/${levelName}`,RedirectType.replace)
}

export default page
