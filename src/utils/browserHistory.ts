// src/utils/browserHistory.ts

/**
 * A small utility for reading and writing browser history
 * and manipulating URL search params in a type-safe way.
 */

type Parser<T> = (value: string | null) => T;

// Common parsers/serializers
export const ParamTypes = {
  string: {
    parse: (v: string | null): string => v ?? '',
    serialize: (v: string): string => v,
  },
  number: {
    parse: (v: string | null): number => {
      if (v == null || v === '') return NaN;
      const n = Number(v);
      return isNaN(n) ? NaN : n;
    },
    serialize: (v: number): string => String(v),
  },
  boolean: {
    parse: (v: string | null): boolean => v === 'true',
    serialize: (v: boolean): string => (v ? 'true' : 'false'),
  },
} as const;

/**
 * Read a single search‑param, parse it, and return a typed value.
 * Falls back to defaultValue if missing or parse fails.
 */
export function getParam<T>(key: string, { parse }: { parse: Parser<T> }, defaultValue: T): T {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(key);
  try {
    if (raw == null) return defaultValue;
    return parse(raw);
  } catch {
    return defaultValue;
  }
}

/** Helpers for the three built‑in types */
export function getStringParam(key: string, defaultValue = ''): string {
  return getParam(key, ParamTypes.string, defaultValue);
}

export function getNumberParam(key: string, defaultValue = NaN): number {
  return getParam(key, ParamTypes.number, defaultValue);
}

export function getBooleanParam(key: string, defaultValue = false): boolean {
  return getParam(key, ParamTypes.boolean, defaultValue);
}

/**
 * Read all current search params into a Record<string, string>
 */
export function getAllParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    out[key] = value;
  }
  return out;
}

interface SetParamsOptions {
  /** if true, uses replaceState instead of pushState */
  replace?: boolean;
}

/**
 * Update one or more search params.
 * Pass null to delete a param.
 * By default uses history.pushState; set replace: true to call replaceState.
 */
export function setParams(updates: Record<string, string | number | boolean | null>, options: SetParamsOptions = {}): void {
  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of Object.entries(updates)) {
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  const newSearch = params.toString();
  const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;

  if (options.replace) {
    window.history.replaceState(window.history.state, '', newUrl);
  } else {
    window.history.pushState(window.history.state, '', newUrl);
  }
}

/**
 * Push a new history entry.
 * `path` may include search or hash.
 * `state` is the history state object.
 */
export function pushHistory(path: string, state: any = {}): void {
  window.history.pushState(state, '', path);
}

/**
 * Replace the current history entry.
 * `path` may include search or hash.
 * `state` is the history state object.
 */
export function replaceHistory(path: string, state: any = {}): void {
  window.history.replaceState(state, '', path);
}
