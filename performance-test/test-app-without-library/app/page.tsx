import PostsClient from './PostsClient';

// No server-side data prefetching - all data loaded on client

export default async function PostsPage() {
  const startTime = Date.now();
  const serverTime = Date.now() - startTime;

  return (
    <div>
      <h1>Performance Test - Without Library</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Server-side processing time:</strong> {serverTime}ms</p>
        <p><strong>Loading strategy:</strong> Client-side only</p>
      </div>

      <PostsClient />
    </div>
  );
}
