'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  getDocs,
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
  where?: [
    string,
    '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any',
    any
  ];
  silent?: boolean;
  /** Read once via getDocs instead of keeping a live WebSocket/snapshot listener */
  once?: boolean;
}

const MAX_CACHE_ENTRIES = 60;
const STALE_TIME_MS = 2 * 60 * 1000; // 2 minutes fresh window for `once` queries
const collectionCache = new Map<string, { data: any[]; timestamp: number }>();

function writeCollectionCache(key: string, data: any[]) {
  if (collectionCache.size >= MAX_CACHE_ENTRIES && !collectionCache.has(key)) {
    const oldestKey = collectionCache.keys().next().value;
    if (oldestKey) collectionCache.delete(oldestKey);
  }
  collectionCache.set(key, { data, timestamp: Date.now() });
}

/**
 * React hook to subscribe to a Firestore collection or query.
 * Includes an in-memory cache so navigating between pages renders cached data immediately
 * with zero layout shift, and supports `once: true` for static catalog queries.
 */
export function useCollection<T = any>(
  path: string | null,
  options?: CollectionOptions
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const firestore = useFirestore();
  const memoizedOptionsJSON = useMemo(() => JSON.stringify(options), [options]);
  const cacheKey = path ? `${path}::${memoizedOptionsJSON || ''}` : null;

  const [data, setData] = useState<StateDataType>(() => {
    if (!cacheKey) return null;
    return (collectionCache.get(cacheKey)?.data as StateDataType) ?? null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!cacheKey) return false;
    return !collectionCache.has(cacheKey);
  });
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!path || !firestore || !cacheKey) {
      if (!path) {
        setData(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    const cached = collectionCache.get(cacheKey);
    if (cached) {
      setData(cached.data as StateDataType);
      setIsLoading(false);
    } else {
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

      if (options?.once) {
        if (cached && Date.now() - cached.timestamp < STALE_TIME_MS) {
          return;
        }
        getDocs(q)
          .then((snapshot: QuerySnapshot<DocumentData>) => {
            if (!isMounted) return;
            const results: ResultItemType[] = snapshot.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
            writeCollectionCache(cacheKey, results);
            setData(results);
            setError(null);
            setIsLoading(false);
          })
          .catch((err: FirestoreError) => {
            if (!isMounted) return;
            const contextualError = err.message.includes('requires an index')
              ? err
              : new FirestorePermissionError({ operation: 'list', path });
            if (!options?.silent) {
              console.warn(`Firestore useCollection(once) warning at [${path}]:`, err.message);
            }
            setError(contextualError);
            setIsLoading(false);
          });
      } else {
        localUnsubscribe = onSnapshot(
          q,
          (snapshot: QuerySnapshot<DocumentData>) => {
            if (!isMounted) return;
            const results: ResultItemType[] = snapshot.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
            writeCollectionCache(cacheKey, results);
            setData(results);
            setError(null);
            setIsLoading(false);
          },
          (err: FirestoreError) => {
            if (!isMounted) return;
            const contextualError = err.message.includes('requires an index')
              ? err
              : new FirestorePermissionError({ operation: 'list', path });

            if (!options?.silent) {
              console.warn(`Firestore useCollection warning at [${path}]:`, err.message);
            }
            setError(contextualError);
            if (!cached) setData(null);
            setIsLoading(false);
            if (!options?.silent && contextualError instanceof FirestorePermissionError) {
              errorEmitter.emit('permission-error', contextualError);
            }
          }
        );
      }
    } catch (err: any) {
      console.error(`Firestore initial subscription error at [${path}]:`, err.message);
      setError(err);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      if (localUnsubscribe) {
        try {
          localUnsubscribe();
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, path, cacheKey]);

  return { data, isLoading, error };
}
