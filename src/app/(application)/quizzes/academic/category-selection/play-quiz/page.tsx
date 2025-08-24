import PlayingQuizSection from '@/components/elements/site/quiz/play-quiz/playing-quiz-section'
import { getCurrentUser } from '@/lib/actions/user/get-current-user'
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {
  const currentUser = await getCurrentUser()
  if(!currentUser || !currentUser.user){
    redirect('/login')
  }

  return <PlayingQuizSection />
}

export default page
