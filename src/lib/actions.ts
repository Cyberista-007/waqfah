'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  // This function is kept for the admin logout button, but it will be adapted
  // In a real Firebase app, you'd call signOut() on the client and redirect.
  // For now, we just clear the "pretend" cookie if it exists and redirect.
  const cookieName = 'admin_session'; // Using a local constant
  cookies().delete(cookieName);
  redirect('/auth/login');
}
