/**
 * Async resource hook that uses local cache and events to replace useQuery-style fetching.
 * Consumers must be in client components; this file itself is not marked 'use client'.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { cache, makeStableKey, type Key } from "./cache";
import { events } from "./events";

export interface UseResourceOptions<T> {
    staleTime?: number;
    initialData?: T;
}

export interface UseResourceResult<T> {
    data: T | undefined;
    error: unknown;
    loading: boolean;
    refetch: () => Promise<void>;
}

export function useResource<T>(
    key: Key,
    fetcher: (signal: AbortSignal) => Promise<T>,
    options?: UseResourceOptions<T>
): UseResourceResult<T> {
    const staleTime = options?.staleTime ?? 0;
    const stableKey = makeStableKey(key);

    // Compute initial state from cache or provided initialData
    const entry = cache.get<T>(key);
    const isFresh = entry ? Date.now() - entry.timestamp <= staleTime : false;
    const seeded = (options?.initialData !== undefined) ? options.initialData : (isFresh ? entry?.value : undefined);

    const [data, setData] = useState<T | undefined>(seeded);
    const [error, setError] = useState<unknown>(undefined);
    const [loading, setLoading] = useState<boolean>(!isFresh && seeded === undefined);

    // Refs to latest values to avoid stale closures
    const mountedRef = useRef(true);
    const abortRef = useRef<AbortController | null>(null);
    const keyRef = useRef<Key>(key);
    const stableKeyRef = useRef<string>(stableKey);
    const fetcherRef = useRef<(signal: AbortSignal) => Promise<T>>(fetcher);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (abortRef.current && !abortRef.current.signal.aborted) {
                abortRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        keyRef.current = key;
        stableKeyRef.current = stableKey;
        fetcherRef.current = fetcher;
    }, [key, stableKey, fetcher]);

    const refetch = useCallback(async (): Promise<void> => {
        // Abort any in-flight request for this hook instance
        if (abortRef.current && !abortRef.current.signal.aborted) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);

        try {
            const value = await cache.startFetch<T>(keyRef.current, () => fetcherRef.current(controller.signal));
            if (controller.signal.aborted) return;
            // Persist in cache and update local state
            cache.set(keyRef.current, value);
            if (mountedRef.current && stableKeyRef.current === makeStableKey(keyRef.current)) {
                setError(undefined);
                setData(value);
            }
        } catch (err: unknown) {
            if (controller.signal.aborted) return;
            if (mountedRef.current) {
                setError(err);
            }
        } finally {
            if (!controller.signal.aborted && mountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // On mount or when key changes, resolve from cache or fetch if stale/missing
    useEffect(() => {
        const e = cache.get<T>(key);
        const fresh = e ? Date.now() - e.timestamp <= staleTime : false;

        if (fresh) {
            setData(e?.value);
            setLoading(false);
            return;
        }

        // If we have stale data, keep showing it while we refetch
        if (e) {
            setData(e.value);
        }

        void refetch();

        return () => {
            if (abortRef.current && !abortRef.current.signal.aborted) {
                abortRef.current.abort();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stableKey, staleTime]); // depend on stableKey to trigger on key change

    // Subscribe to invalidation signals
    useEffect(() => {
        const offExact = events.on("cache:invalidate", (payload?: unknown) => {
            if (typeof payload === "string" && payload === stableKeyRef.current) {
                void refetch();
            }
        });
        const offPrefix = events.on("cache:invalidatePrefix", (payload?: unknown) => {
            const prefix = String(payload ?? "");
            const sk = stableKeyRef.current;
            if (sk.startsWith(prefix)) {
                void refetch();
            }
        });
        return () => {
            offExact();
            offPrefix();
        };
    }, [refetch]);

    return { data, error, loading, refetch };
}

// Fetch helper returning parsed JSON or throwing rich errors
export async function fetchJSON<T>(
    input: RequestInfo,
    init?: RequestInit,
    signal?: AbortSignal
): Promise<T> {
    const res = await fetch(input, { ...init, signal });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        const err = Object.assign(new Error(`HTTP ${res.status} ${res.statusText}`), {
            status: res.status,
            body,
        }) as Error & { status: number; body?: string };
        throw err;
    }
    // Typesafe parse
    return (await res.json()) as T;
}