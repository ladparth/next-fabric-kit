import { int, mssqlTable, nvarchar, datetime2 } from "drizzle-orm/mssql-core";
import { sql } from "drizzle-orm";

export const usersTable = mssqlTable("users", {
    id: int().primaryKey().identity(),
    name: nvarchar({ length: 255 }).notNull(),
    email: nvarchar({ length: 255 }).notNull().unique(),
    status: int().notNull().default(1),
    createdAt: datetime2().notNull().default(sql`GETDATE()`),
});
