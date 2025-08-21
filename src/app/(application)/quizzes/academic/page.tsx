import { redirect, RedirectType } from 'next/navigation'

function page() {
    return redirect("/quizzes/academic/category-selection", RedirectType.replace)
}

export default page
