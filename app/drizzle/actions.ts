"use server";

import { db, poolConnect } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addUser(formData: FormData) {
    await poolConnect;

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name || !email) {
        console.error("Name and email are required");
        return;
    }

    try {
        await db.insert(usersTable).values({ name, email });
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to add user:", error);
    }
}

export async function toggleUserStatus(id: number, currentStatus: number) {
    await poolConnect;

    try {
        await db.update(usersTable)
            .set({ status: currentStatus === 1 ? 0 : 1 })
            .where(eq(usersTable.id, id));
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to update status:", error);
    }
}

export async function deleteUser(id: number) {
    await poolConnect;

    try {
        await db.delete(usersTable).where(eq(usersTable.id, id));
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to delete user:", error);
    }
}
