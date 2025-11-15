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
  pagesToHydrate?: number;
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
