'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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

// Mock heavy data fetchers that simulate heavy API calls
async function fetchPosts(): Promise<Post[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    title: `No Library Post Title ${i + 1}`,
    body: `This is the body of no library post ${i + 1}. `.repeat(20),
    userId: Math.floor(Math.random() * 100) + 1,
  }));
}

async function fetchComments(): Promise<Comment[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  return Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    name: `No Library Commenter ${i + 1}`,
    email: `user${i + 1}@example.com`,
    body: `This is no library comment ${i + 1}. `.repeat(10),
    postId: Math.floor(Math.random() * 1000) + 1,
  }));
}

async function fetchUsers(): Promise<User[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `No Library User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));
}

async function fetchAlbums(): Promise<Album[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    title: `No Library Album ${i + 1}`,
    userId: Math.floor(Math.random() * 100) + 1,
  }));
}

async function fetchPhotos(): Promise<Photo[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 700));

  return Array.from({ length: 2000 }, (_, i) => ({
    id: i + 1,
    title: `No Library Photo ${i + 1}`,
    url: `https://picsum.photos/600/400?random=${i + 1}`,
    thumbnailUrl: `https://picsum.photos/150/150?random=${i + 1}`,
    albumId: Math.floor(Math.random() * 200) + 1,
  }));
}

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function PostsClientBase() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'users'>('posts');

  // These queries will be fetched on the client side only
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    enabled: activeTab === 'posts',
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['comments'],
    queryFn: fetchComments,
    enabled: activeTab === 'comments',
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: activeTab === 'users',
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case 'posts': return posts;
      case 'comments': return comments;
      case 'users': return users;
      default: return null;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'posts': return postsLoading;
      case 'comments': return commentsLoading;
      case 'users': return usersLoading;
      default: return false;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: activeTab === 'posts' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'posts' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Posts ({posts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: activeTab === 'comments' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'comments' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Comments ({comments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Users ({users?.length || 0})
        </button>
      </div>

      {/* Loading State */}
      {getCurrentLoading() && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading...
        </div>
      )}

      {/* Data Display */}
      {!getCurrentLoading() && getCurrentData() && (
        <div>
          {activeTab === 'posts' && (
            <div>
              <h3>Posts</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {posts?.map((post) => (
                  <div key={post.id} style={{ marginBottom: '15px', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <h4>{post.title}</h4>
                    <p><strong>Author ID:</strong> {post.userId}</p>
                    <p>{post.body.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <h3>Comments</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {comments?.slice(0, 50).map((comment) => (
                  <div key={comment.id} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                    <p><strong>{comment.name}</strong> ({comment.email})</p>
                    <p>{comment.body.substring(0, 80)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3>Users</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {users?.map((user) => (
                  <div key={user.id} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                    <p><strong>{user.name}</strong></p>
                    <p>{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PostsClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostsClientBase />
    </QueryClientProvider>
  );
}
