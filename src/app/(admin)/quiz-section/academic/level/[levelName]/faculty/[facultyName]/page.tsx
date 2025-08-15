import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { redirect, RedirectType } from 'next/navigation';
import React from 'react'
import YearListPage from '@/components/elements/admin/quiz-section/year/year-list-page';

async function page() {
    const user = await getCurrentUser();
    
    if(!user || !user.success || user.message !== "user found"){
      redirect("/",RedirectType.replace)
    }
    if(!user.user.admin){
      redirect("/",RedirectType.replace)
    }
  return <YearListPage />
}

export default page
