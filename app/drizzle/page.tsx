import { db, poolConnect } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { addUser, toggleUserStatus, deleteUser } from "./actions";
import { Button } from "@/components/ui/button";

export default async function Page() {
  // Read step: Await connection then select users
  await poolConnect;
  const users = await db.select().from(usersTable);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-8 space-y-12">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Next.js + Drizzle CRUD
        </h1>
        <p className="text-muted-foreground">
          Using Server Components and Server Actions alongside MS Fabric SQL.
        </p>
      </div>

      <div className="w-full max-w-md bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Add New User
        </h2>
        <form action={addUser} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            className="w-full p-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </form>
      </div>

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          User List
        </h2>

        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 bg-muted rounded-xl">
            No users found. Create one above!
          </p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm"
              >
                <div>
                  <h3 className="font-medium text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex gap-2">
                  <form
                    action={toggleUserStatus.bind(null, user.id, user.status)}
                  >
                    <Button
                      variant={user.status === 1 ? "secondary" : "outline"}
                      type="submit"
                    >
                      {user.status === 1 ? "Make Inactive" : "Make Active"}
                    </Button>
                  </form>
                  <form action={deleteUser.bind(null, user.id)}>
                    <Button variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
