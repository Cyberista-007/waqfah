
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin-auth";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "q1w2e3r4";

// This function is no longer used for login but kept for logout functionality.
export async function handleAdminLogin(
  prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  // Password check is removed.
  cookies().set(ADMIN_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax",
  });

  redirect("/admin/dashboard");
}

export async function handleAdminLogout() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/");
}
