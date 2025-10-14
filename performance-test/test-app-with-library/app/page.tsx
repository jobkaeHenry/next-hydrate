import { getHydrationProps } from '@jobkaehenry/next-hydrate';
import PostsClient from './PostsClient';
import { fetchPosts, fetchComments, fetchUsers } from './data';

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

export default async function PostsPage() {
  const startTime = Date.now();

  // Server-side data prefetching with real async functions
  const hydration = await getHydrationProps<Post[] | Comment[] | User[]>({
    queries: [
      {
        key: ['posts'],
        fetchFn: async (): Promise<Post[]> => fetchPosts(),
      },
      {
        key: ['comments'],
        fetchFn: async (): Promise<Comment[]> => fetchComments(),
      },
      {
        key: ['users'],
        fetchFn: async (): Promise<User[]> => fetchUsers(),
      },
    ],
    maxPayloadKB: 500, // Allow larger payload for testing
    devLog: true,
    concurrency: 3, // Limit concurrency for realistic testing
  });

  const serverTime = Date.now() - startTime;

  return (
    <div>
      <h1>Performance Test - With Library</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Server-side processing time:</strong> {serverTime}ms</p>
        <p><strong>Hydration mode:</strong> {hydration.dehydratedState ? 'Hydrated' : 'CSR Fallback'}</p>
        {hydration.dehydratedState && (
          <p><strong>Payload size:</strong> {JSON.stringify(hydration.dehydratedState).length / 1024}KB</p>
        )}
        {hydration.revalidate && (
          <p><strong>ISR Revalidate:</strong> {hydration.revalidate}s</p>
        )}
      </div>

      <PostsClient dehydratedState={hydration.dehydratedState} />
    </div>
  );
}
