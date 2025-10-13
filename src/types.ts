import type { DehydratedState } from '@tanstack/react-query';

export interface WithDehydratedState {
  dehydratedState?: DehydratedState | null;
}

export type HydratableComponentProps<P> = P & WithDehydratedState;
