import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const server = process.env.MSSQL_SERVER;
const database = process.env.MSSQL_DATABASE;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const tenantId = process.env.AZURE_TENANT_ID;

if (!server || !database || !clientId || !clientSecret || !tenantId) {
    throw new Error("Missing required environment variables for MSSQL AAD auth.");
}

// node-mssql connection string format for AAD Service Principal.
// Uses "Active Directory Integrated" which internally resolves to
// "azure-active-directory-service-principal-secret" when Client Id,
// Client secret, and Tenant Id are provided.
// See: https://github.com/tediousjs/node-mssql#azure-active-directory-authentication-connection-string
const url = [
    `Server=${server},${process.env.MSSQL_PORT || "1433"}`,
    `Database=${database}`,
    `Authentication=Active Directory Integrated`,
    `Client Id=${clientId}`,
    `Client secret=${clientSecret}`,
    `Tenant Id=${tenantId}`,
    `Encrypt=true`,
].join(";");

export default defineConfig({
    out: "./lib/db/migrations",
    schema: "./lib/db/schema.ts",
    dialect: "mssql",
    dbCredentials: { url },
});
