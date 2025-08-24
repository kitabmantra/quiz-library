import PlayEntranceQuiz from '@/components/elements/site/quiz/entrance/play-quiz/play-entrance-quiz'
import { getCurrentUser } from '@/lib/actions/user/get-current-user'
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {
  const currentUser = await getCurrentUser()
  if(!currentUser || !currentUser.user){
    redirect('/login')
  }
  return <PlayEntranceQuiz />
}

export default page
