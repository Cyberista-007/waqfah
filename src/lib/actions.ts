
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = "arm";
const SESSION_COOKIE_NAME = "admin_session";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const password = formData.get("password");
  if (password === ADMIN_PASSWORD) {
    cookies().set(SESSION_COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    // This must be called outside the try/catch block
    redirect("/admin/dashboard");
  } else {
    return "كلمة المرور غير صحيحة.";
  }
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/admin/login');
}
