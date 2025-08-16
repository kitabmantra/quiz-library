import UserManagementPage from '@/components/elements/super-admin/user-management/user-management-page';
import { getCurrentUser } from '@/lib/actions/user/get-current-user'
import { redirect, RedirectType } from 'next/navigation'
import React from 'react'

async function page() {
    const user = await getCurrentUser();

    if (!user || !user.success || user.message !== "user found") {
        redirect("/", RedirectType.replace)
    }
    if (!user.user.superAdmin) {
        redirect("/", RedirectType.replace)
    }

    return <UserManagementPage />
}

export default page
