
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  collection,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If firestore or path is not ready, do nothing and reset state.
    if (!firestore || !path) {
      setData(null);
      setIsLoading(false); // Not loading if there's no path/firestore
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const constraints: QueryConstraint[] = [];
    if (options?.orderBy) {
        constraints.push(orderBy(...options.orderBy));
    }
    if (options?.where) {
        constraints.push(where(...options.where));
    }
    if (options?.limit) {
        constraints.push(limit(options.limit));
    }

    const colRef = collection(firestore, path);
    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            operation: 'list',
            path: path,
        })
        
        setError(contextualError);
        setData(null);
        setIsLoading(false);

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, path, options?.orderBy?.[0], options?.orderBy?.[1], options?.limit, options?.where?.[0], options?.where?.[1], options?.where?.[2]]);

  return { data, isLoading, error };
}
