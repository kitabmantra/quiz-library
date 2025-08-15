import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { redirect, RedirectType } from 'next/navigation';
import React from 'react'
import CreateQuestionMainPage from '@/components/elements/admin/quiz-section/questions/create-quesiton-main-page';

async function page() {
    const user = await getCurrentUser();

    if (!user || !user.success || user.message !== "user found") {
        redirect("/", RedirectType.replace)
    }
    if (!user.user.admin) {
        redirect("/", RedirectType.replace)
    }
        return <CreateQuestionMainPage />
}

export default page
