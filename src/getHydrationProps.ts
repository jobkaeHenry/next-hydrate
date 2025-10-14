import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { DehydratedState, QueryKey } from "@tanstack/react-query";
import { detectFetchMode, type FetchMode } from "./detectFetchMode.js";

async function runWithConcurrency(
  tasks: (() => Promise<void>)[],
  limit: number
) {
  if (tasks.length === 0) return;

  const queue = [...tasks];
  const workers = Array.from(
    { length: Math.min(Math.max(1, limit), tasks.length) },
    async () => {
      while (queue.length) {
        const task = queue.shift();
        if (!task) break;
        await task();
      }
    }
  );

  await Promise.all(workers);
}

const byteSize = (obj: unknown): number => {
  // Use more efficient byte size calculation
  const str = JSON.stringify(obj);
  return new TextEncoder().encode(str).length;
};

export type QueryConfig<TData> = {
  key: QueryKey;
  fetchFn: () => Promise<TData>;
  hydrate?: boolean;
  pagesToHydrate?: number;
  shouldDehydrate?: (data: TData) => boolean;
};

export interface HydrationOptions<TData = any> {
  queries: QueryConfig<TData>[];
  fetchMode?: FetchMode;
  revalidate?: number;
  concurrency?: number;
  maxPayloadKB?: number;
  devLog?: boolean;
}

export interface HydrationProps {
  dehydratedState: DehydratedState | null;
  revalidate?: number;
}

export async function getHydrationProps<TData = any>({
  queries,
  fetchMode = "ssr",
  revalidate,
  concurrency = 6,
  maxPayloadKB = 200,
  devLog = process.env.NODE_ENV !== "production",
}: HydrationOptions<TData>): Promise<HydrationProps> {
  fetchMode = await detectFetchMode();
  if (fetchMode === "csr" || !queries.some((q) => q.hydrate !== false)) {
    return { dehydratedState: null, revalidate };
  }

  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: 60_000,
      },
    },
  });

  const seen = new Set<string>();

  const tasks = queries
    .filter((query) => query.hydrate !== false)
    .map((query) => {
      const keyStr = JSON.stringify(query.key);
      if (seen.has(keyStr)) return null;
      seen.add(keyStr);

      return async () => {
        const pages = Math.max(1, query.pagesToHydrate ?? 1);
        for (let i = 0; i < pages; i += 1) {
          await qc.prefetchQuery({
            queryKey: query.key,
            queryFn: query.fetchFn,
          });
        }
      };
    })
    .filter(Boolean) as (() => Promise<void>)[];

  // Create a map for faster query lookup
  const queryMap = new Map<string, QueryConfig<TData>>();
  queries.forEach(query => {
    queryMap.set(JSON.stringify(query.key), query);
  });

  try {
    await runWithConcurrency(tasks, concurrency);

    const dehydrated = dehydrate(qc, {
      shouldDehydrateQuery: (query) => {
        if (query.state.status !== "success") return false;
        const data = query.state.data as TData;
        const keyStr = JSON.stringify(query.queryKey);
        const config = queryMap.get(keyStr);
        return config?.shouldDehydrate ? config.shouldDehydrate(data) : true;
      },
    });

    const payloadBytes = byteSize(dehydrated);
    const payloadKB = payloadBytes / 1024;
    const hasHydratableQueries = dehydrated.queries.length > 0;
    const dehydratedState =
      !hasHydratableQueries || payloadKB > maxPayloadKB ? null : dehydrated;

    if (devLog) {
      const modeInfo = `[hydrate] mode=${fetchMode} queries=${tasks.length} payload=${Math.round(payloadKB)}KB`;
      // eslint-disable-next-line no-console
      console.log(modeInfo + (dehydratedState ? "" : " (CSR fallback)"));
    }

    return {
      dehydratedState,
      revalidate: fetchMode === "isr" ? revalidate ?? 60 : undefined,
    };
  } finally {
    // Ensure cleanup happens even if errors occur
    qc.clear();
  }
}
