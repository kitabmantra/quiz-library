import { getCurrentUser } from '@/lib/actions/user/get-current-user'
import { redirect } from 'next/navigation';
import React from 'react'
import UserQuizHistoryPage from '@/components/elements/site/quiz/user-quiz-history/user-quiz-history-page'

async function page() {
    const currentUser = await getCurrentUser();
    if(!currentUser){
        redirect("/login")
    }
  return <UserQuizHistoryPage />
}

export default page
