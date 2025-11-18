
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// This file is not currently used for authentication in the admin panel,
// as it has been migrated to Firebase Authentication.
// The code is kept here for potential future reference or alternative auth methods.

const ADMIN_USERNAME = "عبدالرحمن رضا محمد";
const SESSION_COOKIE_NAME = "admin_session";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const name = formData.get('name') as string;
  
  if (name === ADMIN_USERNAME) {
    cookies().set(SESSION_COOKIE_NAME, "true", { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    redirect('/admin/dashboard');
  }

  return "اسم المستخدم غير صحيح.";
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/admin/login');
}
