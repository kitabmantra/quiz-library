import { redirect, RedirectType } from 'next/navigation'

function page() {
     redirect("/quiz-section/academic ",RedirectType.replace)
}

export default page
