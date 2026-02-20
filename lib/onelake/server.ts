import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import type { StoragePipelineOptions } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const accountName = "onelake";
const blobServiceVersion = "2023-11-03";
const accountUrl =
  process.env.ONELAKE_BLOB_ACCOUNT_URL ??
  `https://${accountName}.blob.fabric.microsoft.com`;

let serviceClient: BlobServiceClient | null = null;
type OneLakeBlobClientOptions = StoragePipelineOptions & { version: string };

/** Gets or creates a BlobServiceClient using Service Principal credentials (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET). */
export function getOneLakeClient() {
  if (!serviceClient) {
    if (
      !process.env.AZURE_TENANT_ID ||
      !process.env.AZURE_CLIENT_ID ||
      !process.env.AZURE_CLIENT_SECRET
    ) {
      throw new Error(
        "Azure AD credentials for Service Principal are missing in environment variables.",
      );
    }

    const credential = new DefaultAzureCredential();
    const clientOptions: OneLakeBlobClientOptions = {
      audience: "https://storage.azure.com/.default",
      version: blobServiceVersion,
    };

    serviceClient = new BlobServiceClient(accountUrl, credential, clientOptions);
  }
  return serviceClient;
}

/**
 * Generates a User Delegation SAS URL for a file path in OneLake.
 *
 * @param workspaceName Fabric Workspace name (acts as container).
 * @param lakehouseName Lakehouse name including extension (e.g., 'MyLakehouse.Lakehouse').
 * @param filePath Path relative to Lakehouse root (e.g., 'Files/uploads/image.png').
 * @param permissions SAS permissions string (e.g., "w", "r", "cw").
 * @param expiresInMinutes Duration the SAS token is valid for (capped at 59 min).
 */
export async function generateOneLakeSASUrl(
  workspaceName: string,
  lakehouseName: string,
  filePath: string,
  permissions: string = "w",
  expiresInMinutes: number = 60,
) {
  const client = getOneLakeClient();

  const now = Date.now();
  const startsOn = new Date(now);
  startsOn.setMilliseconds(0);

  // Keep UDK validity strictly below 1 hour to avoid boundary rejections
  const safeLifetimeMinutes = Math.max(1, Math.min(expiresInMinutes, 59));
  const expiresOn = new Date(startsOn.getTime() + safeLifetimeMinutes * 60 * 1000);
  expiresOn.setMilliseconds(0);

  const fullPath = `${lakehouseName}/${filePath}`;

  try {
    const userDelegationKey = await client.getUserDelegationKey(startsOn, expiresOn);

    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: workspaceName,
        blobName: fullPath,
        permissions: BlobSASPermissions.parse(permissions),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
        version: blobServiceVersion,
      },
      userDelegationKey,
      accountName,
    );

    return `${accountUrl}/${workspaceName}/${fullPath}?${sasParams.toString()}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to generate OneLake SAS URL for "${workspaceName}/${fullPath}": ${message}`,
    );
  }
}
