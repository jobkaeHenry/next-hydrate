import type { ComponentType } from 'react';
import { HydrateClient } from './HydrateClient.js';
import type { HydratableComponentProps } from './types.js';

export const withHydration = <P extends Record<string, unknown>>(
  Component: ComponentType<P>
) => {
  function WrappedComponent(props: HydratableComponentProps<P>) {
    const { dehydratedState, ...rest } = props;

    return (
      <HydrateClient state={dehydratedState}>
        <Component {...(rest as P)} />
      </HydrateClient>
    );
  }

  WrappedComponent.displayName = `withHydration(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};
