
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin-auth";

export async function handleAdminLogin(
  prevState: { error?: string, success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string, success?: boolean }> {
  try {
    cookies().set(ADMIN_COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
  } catch (error) {
    return { error: "حدث خطأ غير متوقع أثناء تسجيل الدخول." };
  }
  // Redirect must be called outside of the try/catch block
  // as it throws a NEXT_REDIRECT error.
  redirect("/admin/dashboard");
}
