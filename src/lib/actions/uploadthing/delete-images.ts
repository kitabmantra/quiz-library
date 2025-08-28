"use server"
import { UTApi } from "uploadthing/server";
import { getCurrentUser } from "../user/get-current-user";


const utapi = new UTApi();


export const removeMultipleImages = async (imageUrls: string[]) => {
    try {
        const currentUser = await getCurrentUser();
        if(!currentUser || !currentUser.success) throw new Error("User not found");
        if(!currentUser.user.admin) throw new Error("User is not an admin");
        const keys = imageUrls.map(url => {
            const parts = url.split('/');
            return parts[parts.length - 1];
        });

        const deleteResult = await utapi.deleteFiles(keys);
        if (!deleteResult) {
            throw new Error("Failed to delete images")
        }


        return {
            message: "Images deleted successfully",
            success: true
        }
    } catch (error) {
        console.log("error in deleting image : ",error)
        return {
            success : false,
            error : error instanceof Error ? error.message : "Something went wrong",
        }
        
    }
}