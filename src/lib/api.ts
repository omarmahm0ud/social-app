import axios from "axios";

export function extractList<T>(body: unknown, key: string): T[] {
  const data = (body as { data?: unknown } | undefined)?.data ?? body;
  if (Array.isArray(data)) return data as T[];
  const nested = (data as Record<string, unknown> | undefined)?.[key];
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export function extractAnyList<T>(body: unknown, keys: string[]): T[] {
  const data = (body as { data?: unknown } | undefined)?.data ?? body;
  if (Array.isArray(data)) return data as T[];
  const record = data as Record<string, unknown> | undefined;
  for (const key of keys) {
    const value = record?.[key];
    if (Array.isArray(value)) return value as T[];
  }
  const firstArray = Object.values(record ?? {}).find(
    (value): value is unknown[] => Array.isArray(value),
  );
  return (firstArray as T[] | undefined) ?? [];
}

export function extractObject<T>(body: unknown, key: string): T {
  const data = (body as { data?: unknown } | undefined)?.data ?? body;
  const nested = (data as Record<string, unknown> | undefined)?.[key];
  return (nested ?? data) as T;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: string[] }
      | undefined;
    if (data?.errors?.length) return data.errors.join(" - ");
    if (data?.message) return data.message;
  }
  return fallback;
}
