
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin-auth";

export async function handleAdminLogin(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD || "q1w2e3r4";

  if (password !== adminPassword) {
    return { error: "كلمة المرور غير صحيحة." };
  }

  cookies().set(ADMIN_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function handleAdminLogout() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/");
}
