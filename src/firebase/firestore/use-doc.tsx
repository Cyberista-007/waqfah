
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

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {string | DocumentReference<DocumentData> | null | undefined} pathOrRef -
 * The Firestore path string or DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  pathOrRef: string | DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;
  
  const firestore = useFirestore();
  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!pathOrRef || !firestore) {
      if (!pathOrRef) {
        setData(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    let docRef: DocumentReference<DocumentData>;
    try {
        if (typeof pathOrRef === 'string') {
            docRef = doc(firestore, pathOrRef);
        } else {
            docRef = pathOrRef;
        }
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
              
              setData(docData);
            } else {
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
            })

            console.error(`Firestore useDoc error at [${docRef.path}]:`, err.message);
            setError(contextualError)
            setData(null)
            setIsLoading(false)
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
  }, [firestore, pathOrRef]);

  return { data, isLoading, error };
}
