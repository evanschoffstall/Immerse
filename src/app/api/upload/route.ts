import { uploadImage } from "@/lib/upload";
import { validateImageFile } from "@/lib/constants/upload";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    try {
      validateImageFile(file);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Validation failed",
        },
        { status: 400 },
      );
    }

    const url = await uploadImage(file, folder);

    return NextResponse.json({
      url,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 },
    );
  }
}
