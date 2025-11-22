// --- Functions to be used in Client Components ---

// Because client components can't access cookies directly,
// we create API routes to get and clear the session state.

export async function getSession() {
    try {
        const res = await fetch('/api/admin/session');
        if (!res.ok) return null;
        return await res.json();
    } catch(e) {
        console.error("Could not fetch session", e);
        return null;
    }
}

export async function clearSession() {
    await fetch('/api/admin/logout', { method: 'POST' });
}
