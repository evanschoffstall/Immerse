import { uploadImage } from "@/lib/upload";
import { ApiErrors, apiRoute } from "@/lib/utils/api-proxy";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return apiRoute(async () => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const folder = (formData.get("folder") as string) || "general";

      if (!file) {
        return ApiErrors.badRequest("No file provided");
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!validTypes.includes(file.type)) {
        return ApiErrors.badRequest(
          "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed."
        );
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return ApiErrors.badRequest("File too large. Maximum size is 10MB.");
      }

      const url = await uploadImage(file, folder);

      return {
        url,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    }
  })(request);
}
