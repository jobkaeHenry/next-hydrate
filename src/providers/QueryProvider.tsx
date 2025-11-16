'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { getQueryClient } from '../getQueryClient.js';

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Global React Query provider component for the application
 *
 * @param props - Component props
 * @returns Provider component wrapping children
 *
 * @remarks
 * This component should be placed at the root of your application (e.g., in app/layout.tsx).
 * It provides:
 * - QueryClientProvider for React Query
 * - ReactQueryDevtools in development mode
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { QueryProvider } from '@jobkaehenry/next-hydrate';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <QueryProvider>{children}</QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
