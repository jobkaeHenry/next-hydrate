import type { ComponentType } from 'react';
import { HydrateClient } from './HydrateClient.js';
import type { HydratableComponentProps } from './types.js';

/**
 * Higher-Order Component (HOC) that wraps a component with hydration support
 *
 * @template P - The props type of the component being wrapped
 * @param Component - The React component to wrap
 * @returns A new component that accepts dehydratedState prop
 *
 * @remarks
 * This HOC automatically injects the dehydratedState prop and wraps the component
 * with HydrateClient. The wrapped component receives all original props except
 * dehydratedState, which is handled internally.
 *
 * @example
 * ```tsx
 * // Define your client component
 * function PostsClientBase() {
 *   const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
 *   return <div>{posts?.map(p => <Post key={p.id} {...p} />)}</div>;
 * }
 *
 * // Wrap with hydration support
 * export default withHydration(PostsClientBase);
 *
 * // Use in server component
 * const hydration = await getHydrationProps({ queries: [...] });
 * return <PostsClient dehydratedState={hydration.dehydratedState} />;
 * ```
 */
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
