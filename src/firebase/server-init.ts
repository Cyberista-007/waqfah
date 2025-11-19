
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

// Store app instance in a global variable to avoid re-initialization
let serverApp: FirebaseApp | null = null;
let initError: Error | null = null;

// Determine if credentials are available at the module level.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
        : undefined;
const credentialsAvailable = !!serviceAccount || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;


/**
 * Safely initializes and returns a server-side Firebase app instance.
 * Ensures that initialization only happens once.
 * This is safe to call from Server Components.
 * Throws an error if initialization fails and no credentials are provided.
 */
export function initializeFirebaseOnServer() {
  if (serverApp) {
      return { 
          serverApp, 
          serverFirestore: getFirestore(serverApp), 
          serverAuth: getAuth(serverApp) 
      };
  }
  
  // If an initialization error occurred previously, re-throw it.
  if (initError) {
      throw initError;
  }

  // If no credentials, don't even try to initialize.
  if (!credentialsAvailable) {
      const errorMsg = "Firebase Admin SDK not initialized: No credentials found. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS environment variables for server-side data fetching.";
      initError = new Error(errorMsg);
      // We don't throw here, but let the `getDb` function in `data.ts` handle it.
      // This allows the app to fall back to dummy data instead of crashing.
      console.warn(errorMsg);
      throw initError;
  }

  try {
    // Check if any app is already initialized by Next.js hot-reloading in dev
    const apps = getApps();
    if (apps.length > 0) {
        serverApp = apps[0];
    } else {
        const config: FirebaseAdminConfig = {
            projectId: firebaseConfig.projectId,
        };

        // Prefer service account from env var, fall back to ADC
        if (serviceAccount) {
            config.credential = credential.cert(serviceAccount);
        } else {
            config.credential = credential.applicationDefault();
        }
        
        serverApp = initializeApp(config);
    }
    
    const serverFirestore = getFirestore(serverApp);
    const serverAuth = getAuth(serverApp);
    return { serverApp, serverFirestore, serverAuth };

  } catch (e: any) {
      initError = e; // Store the error for subsequent calls
      console.error("FATAL: Firebase Admin SDK initialization failed:", e.message);
      // Re-throw so data fetching functions can catch it and fall back to dummy data.
      throw e; 
  }
}
