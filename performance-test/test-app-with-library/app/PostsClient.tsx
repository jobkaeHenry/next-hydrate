'use client';

import { withHydration } from '@jobkaehenry/next-hydrate';
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

function PostsClientBase() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'users'>('posts');

  // These queries will be hydrated from server data
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    enabled: activeTab === 'posts',
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['comments'],
    enabled: activeTab === 'comments',
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
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

export default withHydration(PostsClientBase);
