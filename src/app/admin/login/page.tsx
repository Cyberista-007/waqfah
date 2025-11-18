
import { redirect } from 'next/navigation';

// The admin login page has been disabled.
// Redirect any access to the dashboard.
export default function AdminLoginPage() {
  redirect('/admin/dashboard');
}
