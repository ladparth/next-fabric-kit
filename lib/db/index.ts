import { drizzle, type NodeMsSqlDatabase } from "drizzle-orm/node-mssql";
import * as schema from "./schema";
import mssql from "mssql";

declare global {
    var _dbPool: mssql.ConnectionPool | undefined;
    var _db: NodeMsSqlDatabase<typeof schema> | undefined;
}

const config: mssql.config = {
    server: process.env.MSSQL_SERVER!,
    database: process.env.MSSQL_DATABASE!,
    port: parseInt(process.env.MSSQL_PORT || "1433", 10),
    authentication: {
        type: "azure-active-directory-service-principal-secret",
        options: {
            clientId: process.env.AZURE_CLIENT_ID!,
            clientSecret: process.env.AZURE_CLIENT_SECRET!,
            tenantId: process.env.AZURE_TENANT_ID!,
        },
    },
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
};

const pool = globalThis._dbPool ?? new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

export const db = globalThis._db ?? drizzle({ client: pool, schema });

if (process.env.NODE_ENV !== "production") {
    globalThis._dbPool = pool;
    globalThis._db = db;
}

export { poolConnect };
