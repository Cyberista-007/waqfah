
'use client';

// This file is now simpler. It just re-exports everything.
// Initialization is handled internally by FirebaseProvider.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/useUser';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './config';
