import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/actions/users";
import { Header } from "@/components/layout/header";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";

export const metadata: Metadata = {
  title: "User Management — MyBudget",
  description: "Manage registered users",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await getAllUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <UserManagementTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
