import { headers } from 'next/headers';

export type FetchMode = 'ssr' | 'isr' | 'static' | 'csr';

export function detectFetchMode(): FetchMode {
  if (typeof window !== 'undefined') return 'csr';

  let hdr: ReturnType<typeof headers> | null = null;

  try {
    hdr = headers();
  } catch (error) {
    hdr = null;
  }

  if (hdr?.get('next-router-prefetch')) return 'csr';
  if (hdr?.get('x-next-revalidate')) return 'isr';
  if (process.env.NEXT_PHASE === 'phase-production-build') return 'static';

  return 'ssr';
}
