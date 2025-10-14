import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query';
import PostsClient from './PostsClient';
import { fetchPosts, fetchComments, fetchUsers, fetchAlbums, fetchPhotos } from './data';

// Define types for our data
type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

type Comment = {
  id: number;
  name: string;
  email: string;
  body: string;
  postId: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type Album = {
  id: number;
  title: string;
  userId: number;
};

type Photo = {
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
  albumId: number;
};

export default async function PostsPage() {
  const startTime = Date.now();

  // Create QueryClient instance for server-side prefetching
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: 60_000,
      },
    },
  });

  // Server-side data prefetching (manual approach)
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['posts'],
      queryFn: fetchPosts,
    }),
    queryClient.prefetchQuery({
      queryKey: ['comments'],
      queryFn: fetchComments,
    }),
    queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: fetchUsers,
    }),
    queryClient.prefetchQuery({
      queryKey: ['albums'],
      queryFn: fetchAlbums,
    }),
    queryClient.prefetchQuery({
      queryKey: ['photos'],
      queryFn: fetchPhotos,
    }),
  ]);

  const serverTime = Date.now() - startTime;

  // Dehydrate the QueryClient state
  const dehydratedState = dehydrate(queryClient);

  return (
    <div>
      <h1>Performance Test - TanStack Hydrate</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd' }}>
        <p><strong>Server-side processing time:</strong> {serverTime}ms</p>
        <p><strong>Loading strategy:</strong> Server prefetch + TanStack HydrationBoundary</p>
        <p><strong>Payload size:</strong> {JSON.stringify(dehydratedState).length / 1024}KB</p>
      </div>

      <HydrationBoundary state={dehydratedState}>
        <PostsClient />
      </HydrationBoundary>
    </div>
  );
}
