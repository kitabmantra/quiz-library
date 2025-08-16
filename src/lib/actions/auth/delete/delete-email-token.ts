'use server'

import { cookies } from "next/headers"


export const deleteEmailToken = async () => {
    try {
        const cookieStore = await cookies()
        cookieStore.delete("user_email")
    } catch (error) {
        console.log("error in deleting email token : ", error)
    }
}