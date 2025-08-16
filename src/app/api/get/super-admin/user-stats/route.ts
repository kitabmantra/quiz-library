'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {

        const user_token = await get_cookies("user_token")
        if (!user_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const user = await getCurrentUser()
        if (!user || !user.success || !user.user.superAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const url = await getBackendUrl();
        const res = await axios.get(`${url}/api/v1/super-admin-service/get-user-stats`, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = res.data;
        console.log("this is the data of user stats : ", data)
        if (!data.success) {
            throw new Error(data.error)
        }
        return NextResponse.json(data)
    } catch (error) {
        error = getErrorMessage(error)
        console.log("error in user stats route : ", error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}