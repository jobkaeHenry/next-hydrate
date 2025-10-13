export interface JsonFetchOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
}

export function makeJsonFetch<T>(url: string, opts: JsonFetchOptions = {}) {
  return async () => {
    const { revalidate, tags, ...init } = opts;
    const res = await fetch(url, { ...init, next: { revalidate, tags } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  };
}
