
// src/firebase/server-init.ts
import { initializeApp, getApps, getApp, type FirebaseApp, AppOptions, deleteApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from './config';
import { credential } from 'firebase-admin';

// Use a custom type for config that includes serviceAccountId
interface FirebaseAdminConfig extends AppOptions {
  serviceAccountId?: string;
}

let serverApp: FirebaseApp | null = null;

const getAppInstance = (): FirebaseApp => {
    if (serverApp) {
        return serverApp;
    }

    const apps = getApps();
    if (apps.length > 0) {
        serverApp = apps[0];
        return serverApp;
    }

    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : undefined;
      
    const config: FirebaseAdminConfig = {
        projectId: firebaseConfig.projectId,
    };

    if (serviceAccount) {
        config.credential = credential.cert(serviceAccount);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        config.credential = credential.applicationDefault();
    } else {
       console.warn("Firebase Admin SDK initialized without explicit credentials. This might rely on ambient credentials (e.g., GCE metadata server). For local development, set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT.");
    }
    
    serverApp = initializeApp(config);
    return serverApp;
}


/**
 * Initializes and returns a server-side Firebase app instance.
 * Ensures that initialization only happens once.
 * This is safe to call from Server Components.
 */
export function initializeFirebaseOnServer() {
  const app = getAppInstance();
  const serverFirestore = getFirestore(app);
  const serverAuth = getAuth(app);
  return { serverApp: app, serverFirestore, serverAuth };
}
