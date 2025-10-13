'use client';

import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import type { DehydratedState } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getQueryClient } from './getQueryClient.js';

export interface HydrateClientProps {
  children: ReactNode;
  state: DehydratedState | null | undefined;
}

export function HydrateClient({ children, state }: HydrateClientProps) {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {state ? <HydrationBoundary state={state}>{children}</HydrationBoundary> : children}
    </QueryClientProvider>
  );
}
