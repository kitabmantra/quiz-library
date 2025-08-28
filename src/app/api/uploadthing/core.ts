import { getCurrentUser } from "@/lib/actions/user/get-current-user";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();
export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount : 5,
    },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user || !user.success) {
        throw new UploadThingError("Unauthorized");
      }
      if (!user.user.admin) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: user?.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;