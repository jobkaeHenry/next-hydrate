import { headers } from "next/headers";

/**
 * Rendering mode detected from the Next.js environment
 *
 * - `ssr`: Server-Side Rendering (dynamic)
 * - `isr`: Incremental Static Regeneration
 * - `static`: Static Site Generation (build time)
 * - `csr`: Client-Side Rendering (browser)
 */
export type FetchMode = "ssr" | "isr" | "static" | "csr";

/**
 * Automatically detects the current Next.js rendering mode
 *
 * @returns Promise resolving to the detected fetch mode
 *
 * @remarks
 * Detection logic:
 * 1. Browser environment → `csr`
 * 2. `next-router-prefetch` header → `csr` (prefetch request)
 * 3. `x-next-revalidate` header → `isr`
 * 4. `NEXT_PHASE=phase-production-build` → `static`
 * 5. Default → `ssr`
 *
 * @example
 * ```ts
 * const mode = await detectFetchMode();
 * console.log(mode); // "ssr" | "isr" | "static" | "csr"
 * ```
 */
export async function detectFetchMode(): Promise<FetchMode> {
  if (typeof window !== "undefined") return "csr";

  try {
    const hdr = await headers();

    if (hdr?.get("next-router-prefetch")) return "csr";
    if (hdr?.get("x-next-revalidate")) return "isr";
  } catch (error) {
    // If headers() fails (e.g., in test environment or non-request context),
    // fall back to environment-based detection
    if (process.env.NODE_ENV === "test") return "ssr";
  }

  if (process.env.NEXT_PHASE === "phase-production-build") return "static";

  return "ssr";
}
