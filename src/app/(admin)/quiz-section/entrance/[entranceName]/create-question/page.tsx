import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { redirect, RedirectType } from 'next/navigation';
import React from 'react'
import CreateEntranceQuestionPage from '@/components/elements/admin/quiz-section/entrance/questions/create-entrance-question';

async function page() {
    const user = await getCurrentUser();
    if(!user || !user.success || user.message !== "user found"){
        redirect("/",RedirectType.replace)
    }
    if(!user.user.admin){
        redirect("/",RedirectType.replace)
    }
  return <CreateEntranceQuestionPage />
}

export default page
