'use server'

export const getBackendUrl =async () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
    // return process.env.NEXT_PUBLIC_BACKEND_URL || "https://kitabmantra-backend.onrender.com"
}