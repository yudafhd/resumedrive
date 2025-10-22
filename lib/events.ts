/**
 * Tiny event bus for cross-module notifications (e.g., cache invalidation).
 * No external dependencies; minimal overhead with unsubscribe support.
 */

export type Listener = (payload?: unknown) => void;

export interface EventBus {
    on(event: string, fn: Listener): () => void;
    off(event: string, fn: Listener): void;
    emit(event: string, payload?: unknown): void;
}

// Map of event name -> set of listeners
const listeners = new Map<string, Set<Listener>>();

function on(event: string, fn: Listener): () => void {
    let set = listeners.get(event);
    if (!set) {
        set = new Set<Listener>();
        listeners.set(event, set);
    }
    set.add(fn);

    // Return unsubscribe function
    return () => {
        off(event, fn);
    };
}

function off(event: string, fn: Listener): void {
    const set = listeners.get(event);
    if (!set) return;
    set.delete(fn);
    if (set.size === 0) {
        listeners.delete(event);
    }
}

function emit(event: string, payload?: unknown): void {
    const set = listeners.get(event);
    if (!set || set.size === 0) return;
    // Snapshot to avoid issues if listeners modify subscriptions during emit
    const snapshot = Array.from(set);
    for (const fn of snapshot) {
        try {
            fn(payload);
        } catch {
            // Swallow listener errors to avoid breaking other subscribers
        }
    }
}

export const events: EventBus = { on, off, emit };