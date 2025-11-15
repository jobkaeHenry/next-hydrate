import { headers } from "next/headers";

export type FetchMode = "ssr" | "isr" | "static" | "csr";

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
