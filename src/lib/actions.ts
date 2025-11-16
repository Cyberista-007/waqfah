
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin-auth";
const ADMIN_PASSWORD = "q1w2e3r4"; // The password you requested

export async function handleAdminLogin(
  prevState: { error?: string, success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string, success?: boolean }> {

  const password = formData.get("password") as string;

  if (password !== ADMIN_PASSWORD) {
    return { error: "كلمة المرور غير صحيحة." };
  }

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
  
  redirect("/admin/dashboard");
}
