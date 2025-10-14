'use client';

import { withHydration } from '@jobkaehenry/next-hydrate';
import { useQuery } from '@tanstack/react-query';

// Custom hooks for data fetching (would normally be in lib/queries.ts)
function usePostsQuery() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: false, // Disable automatic fetching since we're using hydration
  });
}

function useTagsQuery() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    },
    enabled: false,
  });
}

function PostsClientBase() {
  const { data: posts, isLoading: postsLoading } = usePostsQuery();
  const { data: tags, isLoading: tagsLoading } = useTagsQuery();

  if (postsLoading || tagsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <section>
        <h2>Tags</h2>
        {tags && tags.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {tags.map((tag: any) => (
              <span
                key={tag.id}
                style={{
                  backgroundColor: tag.color,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <p>No tags available</p>
        )}
      </section>

      <section>
        <h2>Posts</h2>
        {posts && posts.length > 0 ? (
          <ul>
            {posts.map((post: any) => (
              <li key={post.id} style={{ marginBottom: '10px' }}>
                <h3>{post.title}</h3>
                <p>By: {post.author}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts available</p>
        )}
      </section>
    </div>
  );
}

export default withHydration(PostsClientBase);
