import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const token = (await cookies()).get("admin_token")?.value;
  if (token) redirect("/admin/categories");

  return (
    <main className="flex min-h-[calc(100vh-3.25rem)] items-center justify-center px-4 py-16">
      <LoginForm />
    </main>
  );
}
