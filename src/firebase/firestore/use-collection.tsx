

'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemoFirebase } from '../provider';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemoFirebase to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>))  | null,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // Use a stable reference for the query across renders
  const stableQueryDep = useMemoFirebase(() => memoizedTargetRefOrQuery, [memoizedTargetRefOrQuery]);

  useEffect(() => {
    // CRITICAL FIX: If the query is null or undefined, it's not ready. 
    // Immediately set a clean state and exit the effect. Do not proceed to onSnapshot.
    if (!stableQueryDep) {
      setData(null);
      setIsLoading(false); // No query means we are not loading.
      setError(null);
      return; // Stop execution here.
    }
    
    // Query is valid, start loading and clear previous errors.
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      stableQueryDep,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // Attempt to get the path for a better error message.
        let path = 'unknown/path';
        try {
            // This is a best-effort attempt to get a path for error logging.
            // It might not work for all query types, especially complex ones.
            if (stableQueryDep.type === 'collection') {
              path = (stableQueryDep as CollectionReference).path;
            } else if ((stableQueryDep as any)?._query?.path) {
                // This accesses an internal property and might break in future SDK versions.
                path = (stableQueryDep as any)._query.path.canonicalString();
            }
        } catch (e) {
            // Path extraction failed, use the fallback.
            console.warn("Could not determine path for Firestore query error logging.");
        }


        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });
        
        // We log the error in dev to make it visible in the Next.js overlay
        if (process.env.NODE_ENV === 'development') {
           console.error("Firestore Permission Error in useCollection:", contextualError.message);
        }

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup function to unsubscribe from the listener when the component unmounts
    // or when the query dependency changes.
    return () => unsubscribe();
  }, [stableQueryDep]); // Effect dependencies
  
  return { data, isLoading, error };
}
