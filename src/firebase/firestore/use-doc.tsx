'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  doc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '../provider';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

const MAX_DOC_CACHE = 80;
const docCache = new Map<string, { data: any; timestamp: number }>();

function writeDocCache(key: string, data: any) {
  if (docCache.size >= MAX_DOC_CACHE && !docCache.has(key)) {
    const oldest = docCache.keys().next().value;
    if (oldest) docCache.delete(oldest);
  }
  docCache.set(key, { data, timestamp: Date.now() });
}

function getCacheKey(
  pathOrRef: string | DocumentReference<DocumentData> | null | undefined
): string | null {
  if (!pathOrRef) return null;
  return typeof pathOrRef === 'string' ? pathOrRef : pathOrRef.path;
}

/**
 * React hook to subscribe to a single Firestore document with instant memory cache hydration.
 */
export function useDoc<T = any>(
  pathOrRef: string | DocumentReference<DocumentData> | null | undefined
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const firestore = useFirestore();
  const cacheKey = getCacheKey(pathOrRef);

  const [data, setData] = useState<StateDataType>(() => {
    if (!cacheKey) return null;
    const hit = docCache.get(cacheKey);
    return hit ? (hit.data as StateDataType) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!cacheKey) return false;
    return !docCache.has(cacheKey);
  });
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!pathOrRef || !firestore || !cacheKey) {
      if (!pathOrRef) {
        setData(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    const cached = docCache.get(cacheKey);
    if (cached) {
      setData(cached.data as StateDataType);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    setError(null);

    let docRef: DocumentReference<DocumentData>;
    try {
      docRef = typeof pathOrRef === 'string' ? doc(firestore, pathOrRef) : pathOrRef;
    } catch (e: any) {
      setError(e);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let localUnsubscribe: (() => void) | null = null;

    try {
      localUnsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            const docData = { ...(snapshot.data() as T), id: snapshot.id } as any;

            if (docRef.path.startsWith('users/') && docData.role === 'admin' && !docData.donationTier) {
              docData.donationTier = 'gold';
            }

            writeDocCache(cacheKey, docData);
            setData(docData);
          } else {
            writeDocCache(cacheKey, null);
            setData(null);
          }
          setError(null);
          setIsLoading(false);
        },
        (err: FirestoreError) => {
          if (!isMounted) return;
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: docRef.path,
          });

          console.error(`Firestore useDoc error at [${docRef.path}]:`, err.message);
          setError(contextualError);
          if (!cached) setData(null);
          setIsLoading(false);
          errorEmitter.emit('permission-error', contextualError);
        }
      );
    } catch (err: any) {
      console.error(`Firestore useDoc initial subscription error at [${pathOrRef}]:`, err.message);
      setError(err);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      if (localUnsubscribe) {
        const toUnsub = localUnsubscribe;
        setTimeout(() => toUnsub(), 0);
      }
    };
  }, [firestore, pathOrRef, cacheKey]);

  return { data, isLoading, error };
}
