import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { redirect, RedirectType } from 'next/navigation';
import React from 'react'
import YearNamePage from '@/components/elements/admin/quiz-section/year/year-name-page';

async function page() {
    const user = await getCurrentUser();
    
    if(!user || !user.success || user.message !== "user found"){
      redirect("/",RedirectType.replace)
    }
    if(!user.user.admin){
      redirect("/",RedirectType.replace)
    }
  return <YearNamePage />
}

export default page
