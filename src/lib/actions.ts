
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin-auth";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "q1w2e3r4";

export async function handleAdminLogin(
  prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  
  if (password !== ADMIN_PASSWORD) {
    return { error: "كلمة المرور غير صحيحة." };
  }

  cookies().set(ADMIN_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax", // Recommended for security
  });

  // Instead of returning, we redirect. The hook will not receive a state update on success.
  redirect("/admin/dashboard");
}

export async function handleAdminLogout() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/");
}
