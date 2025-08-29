'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { get_cookies } from "@/lib/utils/get-cookie"
import { getErrorMessage } from "@/lib/utils/get-error"
import axios from "axios"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
      const user_token = await get_cookies("user_token")
      if(!user_token) {
        return NextResponse.json({ error: "user not found", success: false }, { status: 401 })
      }
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "user not found", success: false }, { status: 404 })
      }
        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/entrance-quiz-service/get-user-past-entrance-quiz-history`, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = res.data;
        if (!data.success) throw new Error(data.error)
        if(data.success && data.data.correctQuestions === null){
          data.data.correctQuestions = []
        }
        if(data.success && data.data.wrongQuestions === null){
          data.data.wrongQuestions = []
        }
        console.log('this is the entrance quiz history data : ',data.data)
        return NextResponse.json({ questions: data.data, success: data.success }, { status: 200 })

    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is error in entrance quiz history: ", error)
        return NextResponse.json({ error, success: false }, { status: 500 })

    }
}