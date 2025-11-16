
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = "arm";
const SESSION_COOKIE_NAME = "admin_session";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const password = formData.get("password");
    if (password === ADMIN_PASSWORD) {
      // Set a session cookie
      cookies().set(SESSION_COOKIE_NAME, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      // Redirect to the dashboard on successful login
      redirect("/admin/dashboard");
    } else {
      return "كلمة المرور غير صحيحة.";
    }
  } catch (error) {
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    return "حدث خطأ ما. يرجى المحاولة مرة أخرى.";
  }
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/admin/login');
}
