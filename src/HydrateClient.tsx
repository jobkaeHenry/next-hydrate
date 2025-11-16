'use client';

import { HydrationBoundary } from '@tanstack/react-query';
import type { DehydratedState } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * Client component that hydrates React Query cache from server-side data
 *
 * @remarks
 * This component must be used within a QueryClientProvider (e.g., QueryProvider from this package).
 * It wraps children with HydrationBoundary to rehydrate server-fetched queries.
 *
 * @example
 * ```tsx
 * // In your client component
 * <HydrateClient state={dehydratedState}>
 *   <YourComponent />
 * </HydrateClient>
 * ```
 */
export interface HydrateClientProps {
  children: ReactNode;
  state: DehydratedState | null | undefined;
}

export function HydrateClient({ children, state }: HydrateClientProps) {
  // No need for QueryClientProvider here - rely on parent QueryProvider
  // This prevents double-wrapping and follows React Query best practices
  return state ? <HydrationBoundary state={state}>{children}</HydrationBoundary> : children;
}
