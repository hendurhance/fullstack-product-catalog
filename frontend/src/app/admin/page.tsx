import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getAdminToken } from "@/lib/auth/cookies";

async function AdminRedirect(): Promise<React.ReactNode> {
  const token = await getAdminToken();
  redirect(token ? "/admin/categories" : "/admin/login");
}

export default function AdminIndex() {
  return (
    <Suspense fallback={null}>
      <AdminRedirect />
    </Suspense>
  );
}
