"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_COOKIE_NAME = "admin-auth";

export async function handleAdminLogin(
  prevState: { error: string } | null,
  formData: FormData
) {
  const password = formData.get("password");

  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD environment variable is not set.");
    return { error: "خطأ في إعدادات الخادم. لا يمكن تسجيل الدخول." };
  }

  if (password === ADMIN_PASSWORD) {
    cookies().set(ADMIN_COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    redirect("/admin/dashboard");
  } else {
    return { error: "كلمة المرور غير صحيحة." };
  }
}
