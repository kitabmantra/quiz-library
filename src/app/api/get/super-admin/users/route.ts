'use server'

import { getCurrentUser } from "@/lib/actions/user/get-current-user"
import { getBackendUrl } from "@/lib/utils/get-backendurl"
import { getErrorMessage } from "@/lib/utils/get-error"
import { get_cookies } from "@/lib/utils/get-cookie"
import axios from "axios"
import { NextResponse } from "next/server"


const defaultLimit = 100
const defaultPerPage = 1


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search")
        const limit = searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : defaultLimit;
        const offset = searchParams.has("offset") ? parseInt(searchParams.get("offset")!, 10) : defaultPerPage;
        const user_token = await get_cookies("user_token")
        if (!user_token) {
            throw new Error("unauthorized")
        }
        const user = await getCurrentUser();
        if (!user || !user.success || !user.user.superAdmin) {
            throw new Error("unauthorized")
        }
        const url = await getBackendUrl()
        const res = await axios.get(`${url}/api/v1/super-admin-service/get-all-users?search=${search}&offset=${offset}&limit=${limit}`, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = res.data;
        if (!data.success) throw new Error(data.error)
            
        let users = []
        if (data.success && data.users && data.users.users) {
            users = data.users.users
        } else if (data.success && data.users.users === null) {
            users = []
        }
        
        console.log("this is the data of all users : ", data)
        console.log("processed users : ", users)
        
        // Return in the format expected by the hook
        return NextResponse.json({
            data: {
                users: users,
                hasMore: data.users?.hasMore || false,
                nextOffset: data.users?.nextOffset || offset + 1
            }
        }, { status: 200 })
    } catch (error) {
        error = getErrorMessage(error)
        console.log("error in all users route : ", error)
        return NextResponse.json({ error, success: false, }, { status: 500 })

    }
}