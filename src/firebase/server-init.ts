// src/firebase/server-init.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// A singleton for the server-side Firebase app instance.
let serverApp: FirebaseApp | null = null;
let serverFirestore: Firestore | null = null;

/**
 * Initializes and returns a server-side Firebase app and Firestore instance.
 * Ensures that initialization only happens once.
 * This is safe to call from Server Components.
 */
export function initializeFirebaseOnServer() {
  if (!serverApp) {
    // Check if an app is already initialized (though it shouldn't be on the server)
    if (!getApps().length) {
      // Use initializeApp with the explicit config for server environments.
      serverApp = initializeApp(firebaseConfig);
    } else {
      // If an app somehow already exists, get it.
      serverApp = getApp();
    }
    serverFirestore = getFirestore(serverApp);
  }

  return { serverApp, serverFirestore };
}
