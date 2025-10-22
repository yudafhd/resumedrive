/**
 * Lightweight validation helpers to replace Zod parse/safeParse ergonomics.
 * Pure TypeScript, no external deps.
 */

export type ParseOk<T> = { ok: true; data: T };
export type ParseErr = { ok: false; error: string };
export type ParseResult<T> = ParseOk<T> | ParseErr;

export function ok<T>(data: T): ParseOk<T> {
    return { ok: true, data };
}

export function err(message: string): ParseErr {
    return { ok: false, error: message };
}

/**
 * Create a safe parser from a type guard and optional normalizer.
 * If `isT(u)` is true, returns ok(normalize ? normalize(u) : u),
 * otherwise returns err("Invalid data").
 */
export function createSafeParser<T>(
    isT: (u: unknown) => u is T,
    normalize?: (t: T) => T
): (u: unknown) => ParseResult<T> {
    return (u: unknown): ParseResult<T> => {
        if (isT(u)) {
            const value = normalize ? normalize(u) : u;
            return ok<T>(value);
        }
        return err("Invalid data");
    };
}

/**
 * Type guard for string[]
 */
export function isStringArray(u: unknown): u is string[] {
    return Array.isArray(u) && u.every((v): v is string => typeof v === "string");
}

/**
 * Server-response-agnostic error helper (pure data object).
 */
export function badRequest(message: string): { error: string } {
    return { error: message };
}