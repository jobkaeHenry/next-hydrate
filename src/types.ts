import type { DehydratedState, QueryKey } from '@tanstack/react-query';
import type { FetchMode } from './detectFetchMode.js';

export interface WithDehydratedState {
  dehydratedState?: DehydratedState | null;
}

export type HydratableComponentProps<P> = P & WithDehydratedState;

export interface QueryConfig<TData = unknown> {
  key: QueryKey;
  fetchFn: () => Promise<TData>;
  hydrate?: boolean;
  /**
   * For infinite queries: number of pages to prefetch during SSR
   * Requires `initialPageParam` and `getNextPageParam` to be set
   */
  pagesToHydrate?: number;
  /**
   * For infinite queries: initial page parameter
   */
  initialPageParam?: unknown;
  /**
   * For infinite queries: function to get next page parameter
   */
  getNextPageParam?: (lastPage: TData, allPages: TData[], lastPageParam: unknown) => unknown;
  shouldDehydrate?: (data: TData) => boolean;
}

export interface HydrationOptions<TData = unknown> {
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
