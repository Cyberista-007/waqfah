
import admin from 'firebase-admin';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This function ensures we only initialize the admin app once.
const getAdminApp = (): App | null => {
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        // This is a common case in local development, so we'll just return null
        // and let the calling functions handle the absence of admin services.
        console.warn("FIREBASE_SERVICE_ACCOUNT is not set. Server-side data fetching will be disabled.");
        return null;
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string.", e);
        return null; // Return null if parsing fails
    }
}

export const initializeAdminApp = () => {
    const app = getAdminApp();
    if (!app) {
        // If the admin app couldn't be initialized, return null for all services.
        return { app: null, auth: null, firestore: null };
    }
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
}
