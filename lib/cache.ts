/**
 * In-memory cache with stable keying and invalidation signaling.
 * No external deps. Designed for React Query replacement internals.
 */

import { events } from "./events";

export type Key = string | readonly unknown[];

// Deterministic stringify with object key sorting, array handling, primitives,
// and a simple WeakSet circular guard. Always produces JSON-safe strings.
function stableStringify(value: unknown, seen?: WeakSet<object>): string {
    const s = seen ?? new WeakSet<object>();

    // Primitives and special types normalized to JSON-safe strings
    const t = typeof value;
    if (value === null) return "null";
    if (t === "string" || t === "number" || t === "boolean") return JSON.stringify(value);
    if (t === "bigint") return JSON.stringify(`bigint:${String(value)}`);
    if (t === "symbol") return JSON.stringify(`symbol:${(value as symbol).description ?? ""}`);
    if (t === "undefined") return JSON.stringify("undefined");
    if (t === "function") return JSON.stringify("function");

    // Objects / Arrays
    const obj = value as object;

    // Handle common built-ins as tagged strings for stability
    if (value instanceof Date) return JSON.stringify(`date:${value.toISOString()}`);
    if (value instanceof RegExp) return JSON.stringify(`regexp:${String(value)}`);

    if (s.has(obj)) {
        return JSON.stringify("[Circular]");
    }
    s.add(obj);

    if (Array.isArray(value)) {
        const out = "[" + value.map((v) => stableStringify(v, s)).join(",") + "]";
        s.delete(obj);
        return out;
    }

    // Plain object: sort keys
    const isPlain =
        Object.prototype.toString.call(value) === "[object Object]" ||
        // allow objects created via Object.create(null)
        (Object.getPrototypeOf(value) === null && typeof value === "object");

    if (!isPlain) {
        // Fallback for other objects: tag with ctor name + stable fields if enumerable
        const ctor = (obj as { constructor?: { name?: string } }).constructor?.name ?? "Object";
        const entries = Object.keys(value as Record<string, unknown>).sort();
        const body = entries
            .map((k) => JSON.stringify(k) + ":" + stableStringify((value as Record<string, unknown>)[k], s))
            .join(",");
        const out = `{"$ctor":${JSON.stringify(ctor)}${body ? "," + body : ""}}`;
        s.delete(obj);
        return out;
    }

    const keys = Object.keys(value as Record<string, unknown>).sort();
    const parts = keys.map((k) => JSON.stringify(k) + ":" + stableStringify((value as Record<string, unknown>)[k], s));
    const out = "{" + parts.join(",") + "}";
    s.delete(obj);
    return out;
}

// Stable key that begins with the "prefix" when the key is an array,
// enabling efficient prefix-based invalidation/subscription checks.
// For string keys, the key is used as-is.
export function makeStableKey(key: Key): string {
    if (typeof key === "string") return key;
    const head = String(key[0]);
    // Ensure stableKey starts with the head so startsWith(prefix) works downstream.
    return `${head}|${stableStringify(key)}`;
}

interface CacheEntry<T = unknown> {
    value: T;
    timestamp: number;
}

export class CacheStore {
    private store = new Map<string, CacheEntry>();
    private inFlight = new Map<string, Promise<unknown>>();

    get<T>(key: Key): CacheEntry<T> | undefined {
        const sk = makeStableKey(key);
        return this.store.get(sk) as CacheEntry<T> | undefined;
    }

    set<T>(key: Key, value: T): void {
        const sk = makeStableKey(key);
        this.store.set(sk, { value, timestamp: Date.now() });
    }

    delete(key: Key): void {
        const sk = makeStableKey(key);
        this.store.delete(sk);
    }

    clear(): void {
        this.store.clear();
    }

    has(key: Key): boolean {
        const sk = makeStableKey(key);
        return this.store.has(sk);
    }

    // Deduplicate concurrent fetches for the same key.
    startFetch<T>(key: Key, factory: () => Promise<T>): Promise<T> {
        const sk = makeStableKey(key);
        const existing = this.inFlight.get(sk) as Promise<T> | undefined;
        if (existing) return existing;

        const p: Promise<T> = (async () => {
            try {
                return await factory();
            } finally {
                this.inFlight.delete(sk);
            }
        })();

        this.inFlight.set(sk, p);
        return p;
    }

    // Delete entry and emit precise invalidation.
    invalidate(key: Key): void {
        const sk = makeStableKey(key);
        this.store.delete(sk);
        events.emit("cache:invalidate", sk);
    }

    // Invalidate all entries that:
    //  - have a stableKey starting with the given prefix, OR
    //  - were created from an array key whose first segment equals the prefix.
    invalidatePrefix(prefix: string): void {
        const toDelete: string[] = [];
        for (const sk of this.store.keys()) {
            // Fast path: stableKey already starts with the prefix
            if (sk.startsWith(prefix)) {
                toDelete.push(sk);
                continue;
            }
            // If the stableKey was built from an array, it will have the form "head|[...]"
            const bar = sk.indexOf("|");
            if (bar !== -1) {
                const head = sk.slice(0, bar);
                if (head === prefix) {
                    toDelete.push(sk);
                }
            }
        }
        for (const sk of toDelete) {
            this.store.delete(sk);
        }
        events.emit("cache:invalidatePrefix", prefix);
    }
}

export const cache = new CacheStore();

// Helpers
export function keyToPrefix(key: Key): string {
    return typeof key === "string" ? key : String(key[0]);
}
