
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_USERNAME = "عبدالرحمن رضا محمد";
export const SESSION_COOKIE_NAME = "admin_session";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const name = formData.get('name') as string;
  
  if (name === ADMIN_USERNAME) {
    cookies().set(SESSION_COOKIE_NAME, "true", { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    redirect('/admin/dashboard');
  }

  return "اسم المستخدم غير صحيح.";
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/admin/login');
}
