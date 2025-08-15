'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const yearName = searchParams.get('yearName')
        const levelName = searchParams.get('levelName')
        const faculty = searchParams.get('faculty')
        const typeName = searchParams.get('typeName')
        if (!yearName || !levelName || !faculty || !typeName) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const user_token = await get_cookies("user_token")
        if (!user_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const user = await getCurrentUser()
        if (!user || !user.success || !user.user.admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/question-service/get-question-stat?yearName=${yearName}&levelName=${levelName}&faculty=${faculty}&typeName=${typeName}`, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = res.data;
        if (!data.success) {
            throw new Error(data.error)
        }
        return NextResponse.json(data)
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}

