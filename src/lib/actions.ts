
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_USERNAME = "عبدالرحمن رضا محمد";
const SESSION_COOKIE_NAME = "admin_session";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const name = formData.get('name') as string;
  
  if (name === ADMIN_USERNAME) {
    // This is a simplified check. In a real app, you'd verify password and set a secure session.
    cookies().set(SESSION_COOKIE_NAME, "true", { httpOnly: true, secure: true });
    redirect('/admin/dashboard');
  }

  return "اسم المستخدم غير صحيح.";
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/admin/login');
}
