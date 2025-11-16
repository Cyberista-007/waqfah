
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

function getSdks(firebaseApp: FirebaseApp) {
    const auth = initializeAuth(firebaseApp, {
        persistence: indexedDBLocalPersistence
    });
    const firestore = getFirestore(firebaseApp);
    const functions = getFunctions(firebaseApp);

    if (process.env.NEXT_PUBLIC_EMULATORS_ENABLED === 'true') {
        const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || 'localhost';
        console.log(`Connecting to Firebase Emulators on ${host}`);
        connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
        connectFirestoreEmulator(firestore, host, 8080);
        connectFunctionsEmulator(functions, host, 5001);
    }
    
  return {
    firebaseApp,
    auth,
    firestore,
    functions,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
