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
        if(!user_token) throw new Error("User token not found")
            const currentUser = await getCurrentUser();
        if(!currentUser) throw new Error("User not found")
            const searchParams = new URL(request.url).searchParams
        const levelName = searchParams.get("levelName")
        if(!levelName) throw new Error("Level name not found")
            
            const faculty = searchParams.get("faculty")
            const yearName = searchParams.get("yearName")
            const subjectName = searchParams.get("subjectName")
            const numberOfQuestions = searchParams.get("numberOfQuestions") || "10"
            let     difficulty = searchParams.get("difficulty") || "all"
            if(!["easy", "medium", "hard"].includes(difficulty) || difficulty === "all") {
                difficulty = ""
            }

            const url = await getBackendUrl();

            const res = await axios.get(`${url}/api/v1/quiz-service/user-quiz-questions?levelName=${levelName}&faculty=${faculty}&yearName=${yearName}&subjectName=${subjectName}&numberOfQuestions=${numberOfQuestions}&difficulty=${difficulty}`, {
                withCredentials : true,
                headers : {
                    Cookie : `user_token=${user_token}`
                }
            })

            const data = res.data;
            if(!data.success) throw new Error(data.error)

            return NextResponse.json({ questions : data.data, success : data.success  }, { status: 200 })

    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is error in quiz questions: ", error)
        return NextResponse.json({ error, success : false }, { status: 500 })
        
    }
}