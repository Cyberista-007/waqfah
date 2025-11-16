
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ADMIN_COOKIE_NAME = "admin-auth";
const ADMIN_PASSWORD = "q1w2e3r4"; // The password you requested

export async function handleAdminLogin(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {

  const password = formData.get("password") as string;

  if (password !== ADMIN_PASSWORD) {
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
