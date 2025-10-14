import { getHydrationProps } from '@jobkaehenry/next-hydrate';
import PostsClient from './PostsClient';

// Define types for our data
type Post = {
  id: number;
  title: string;
  author: string;
};

type Tag = {
  id: number;
  name: string;
  color: string;
};

// Mock API data fetcher
async function fetchPosts(): Promise<Post[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return [
    { id: 1, title: 'Next.js Hydration Guide', author: 'John Doe' },
    { id: 2, title: 'React Query Best Practices', author: 'Jane Smith' },
    { id: 3, title: 'Server Components Deep Dive', author: 'Bob Johnson' },
  ];
}

// Mock API tags fetcher
async function fetchTags(): Promise<Tag[]> {
  await new Promise(resolve => setTimeout(resolve, 50));

  return [
    { id: 1, name: 'React', color: '#61dafb' },
    { id: 2, name: 'Next.js', color: '#000000' },
    { id: 3, name: 'TypeScript', color: '#3178c6' },
  ];
}

export default async function PostsPage() {
  // Server-side data prefetching with real async functions
  const hydration = await getHydrationProps<Post[] | Tag[]>({
    queries: [
      {
        key: ['posts'],
        fetchFn: async (): Promise<Post[]> => fetchPosts(),
      },
      {
        key: ['tags'],
        fetchFn: async (): Promise<Tag[]> => fetchTags(),
        shouldDehydrate: (data: Tag[]) => data.length > 0, // Only dehydrate if we have tags
      },
    ],
    maxPayloadKB: 50, // Test payload size limits
    devLog: true, // Enable logging for testing
  });

  return (
    <div>
      <h1>Posts Page - Server Rendered</h1>
      <PostsClient dehydratedState={hydration.dehydratedState} />
      <p>Mode: {hydration.dehydratedState ? 'Hydrated' : 'CSR Fallback'}</p>
      {hydration.revalidate && (
        <p>ISR Revalidate: {hydration.revalidate}s</p>
      )}
    </div>
  );
}
