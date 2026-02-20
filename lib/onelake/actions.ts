"use server";

import { generateOneLakeSASUrl } from "@/lib/onelake/server";

export async function getUploadSASUrl(fileName: string) {
  try {
    const workspaceName = process.env.FABRIC_WORKSPACE_NAME;
    const lakehouseName = process.env.FABRIC_LAKEHOUSE_NAME;
    const uploadFolder = process.env.ONELAKE_UPLOAD_FOLDER ?? "Files";

    if (!workspaceName || !lakehouseName) {
      throw new Error(
        "FABRIC_WORKSPACE_NAME or FABRIC_LAKEHOUSE_NAME not configured.",
      );
    }

    const filePath = `${uploadFolder}/${fileName}`;

    const sasUrl = await generateOneLakeSASUrl(
      workspaceName,
      lakehouseName,
      filePath,
      "cw",
      60,
    );

    return { success: true, sasUrl, filePath };
  } catch (error: unknown) {
    console.error("Error generating SAS URL:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate SAS token";
    return { success: false, error: errorMessage };
  }
}
