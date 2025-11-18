
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = "arm";
const SESSION_COOKIE_NAME = "admin_session";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  // This functionality is disabled.
  return "Authentication is disabled.";
}

export async function logout() {
    // Since login is disabled, this function is not strictly necessary but kept for potential future use.
    // cookies().delete(SESSION_COOKIE_NAME);
    // redirect('/admin/login');
    redirect('/');
}
