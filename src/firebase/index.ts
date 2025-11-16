
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'
import { getFunctions, Functions } from 'firebase/functions';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    const app = getApp();
    return getSdks(app);
  }
  
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

function getSdks(firebaseApp: FirebaseApp) {
  let auth: Auth;
  try {
    // This can fail in some environments (e.g. server-side) if persistence is not available
    auth = initializeAuth(firebaseApp, {
        persistence: indexedDBLocalPersistence
    });
  } catch (e) {
    auth = getAuth(firebaseApp);
  }
    
  const firestore = getFirestore(firebaseApp);
  const functions = getFunctions(firebaseApp);
    
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
