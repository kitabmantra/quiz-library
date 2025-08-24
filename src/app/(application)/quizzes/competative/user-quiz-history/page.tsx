import { getCurrentUser } from '@/lib/actions/user/get-current-user'
import { redirect } from 'next/navigation';
import React from 'react'
import EntranceQuizUserHistory from '@/components/elements/site/quiz/entrance/entrance-quiz-user-history'

async function page() {
    const currentUser = await getCurrentUser();
    if(!currentUser){
        redirect("/login")
    }
  return <EntranceQuizUserHistory />
}

export default page
