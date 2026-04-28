
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  collection,
  collectionGroup,
  query,
  orderBy,
  limit,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '../provider';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface CollectionOptions {
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
    where?: [string, '==' | '!=' | '<' | '<=' | '>' | '>=', any];
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * It now builds the query internally to be more robust.
 *
 * @param {string | null} path - The path to the collection. Hook does nothing if null.
 * @param {CollectionOptions} [options] - Optional sorting, limiting, and filtering for the query.
 */
export function useCollection<T = any>(
    path: string | null,
    options?: CollectionOptions
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const firestore = useFirestore();
  const [data, setData] = useState<StateDataType>(null);
  // Set initial loading state based on whether a path is provided.
  const [isLoading, setIsLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  const memoizedOptionsJSON = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    // If path is not ready, do nothing and reset state.
    if (!path || !firestore) {
      if (!path) {
        setData(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    if (!data) {
        setIsLoading(true);
    }
    setError(null);
    
    const constraints: QueryConstraint[] = [];
    if (options?.orderBy) {
        constraints.push(orderBy(...options.orderBy));
    }
    if (options?.where) {
        if (options.where[2] === undefined) {
            setData(null);
            setIsLoading(true);
            setError(null);
            return;
        }
        constraints.push(where(...options.where));
    }
    if (options?.limit) {
        constraints.push(limit(options.limit));
    }

    const isCollectionGroup = path === 'playlists';
    let isMounted = true;
    let localUnsubscribe: (() => void) | null = null;
    
    try {
        const ref = isCollectionGroup ? collectionGroup(firestore, path) : collection(firestore, path);
        const q = query(ref, ...constraints);

        localUnsubscribe = onSnapshot(
          q,
          (snapshot: QuerySnapshot<DocumentData>) => {
            if (!isMounted) return;
            const results: ResultItemType[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
            setData(results);
            setError(null);
            setIsLoading(false);
          },
          (err: FirestoreError) => {
            if (!isMounted) return;
            const contextualError = err.message.includes('requires an index')
                ? err
                : new FirestorePermissionError({
                    operation: 'list',
                    path: path,
                });
            
            console.error(`Firestore useCollection error at [${path}]:`, err.message);
            setError(contextualError);
            setData(null);
            setIsLoading(false);
            if (contextualError instanceof FirestorePermissionError) {
                errorEmitter.emit('permission-error', contextualError);
            }
          }
        );
    } catch (err: any) {
        console.error(`Firestore initial subscription error at [${path}]:`, err.message);
        setError(err);
        setIsLoading(false);
    }

    return () => {
        isMounted = false;
        if (localUnsubscribe) {
            // Using a tiny timeout for unsubscription helps avoid 
            // immediate SDK state conflicts during rapid HMR/Turbopack cycles.
            const toUnsub = localUnsubscribe;
            setTimeout(() => toUnsub(), 0);
        }
    };
  }, [firestore, path, memoizedOptionsJSON]); 

  return { data, isLoading, error };
}
