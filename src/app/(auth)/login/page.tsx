import LoginPage from '@/components/elements/auth/login-page'
import { getCurrentUser } from '@/lib/actions/user/get-current-user'
import { redirect, RedirectType } from 'next/navigation';
import React from 'react'

async function page() {
  const user = await getCurrentUser();
  if(user && user.success){
      redirect("/",RedirectType.replace)
  }
  return <LoginPage />
}

export default page
