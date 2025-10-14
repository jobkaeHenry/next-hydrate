'use client';

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

export default function PostsClient() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'users' | 'albums' | 'photos'>('posts');

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

  const { data: albums, isLoading: albumsLoading } = useQuery<Album[]>({
    queryKey: ['albums'],
    enabled: activeTab === 'albums',
  });

  const { data: photos, isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ['photos'],
    enabled: activeTab === 'photos',
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case 'posts': return posts;
      case 'comments': return comments;
      case 'users': return users;
      case 'albums': return albums;
      case 'photos': return photos;
      default: return null;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'posts': return postsLoading;
      case 'comments': return commentsLoading;
      case 'users': return usersLoading;
      case 'albums': return albumsLoading;
      case 'photos': return photosLoading;
      default: return false;
    }
  };

  const getCurrentCount = () => {
    const data = getCurrentData();
    return data?.length || 0;
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
          Posts ({getCurrentCount()})
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
          Comments ({getCurrentCount()})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Users ({getCurrentCount()})
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: activeTab === 'albums' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'albums' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Albums ({getCurrentCount()})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'photos' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'photos' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Photos ({getCurrentCount()})
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
              <h3>Posts (High Load Test)</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {posts?.slice(0, 50).map((post) => (
                  <div key={post.id} style={{ marginBottom: '15px', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <h4>{post.title}</h4>
                    <p><strong>Author ID:</strong> {post.userId}</p>
                    <p>{post.body.substring(0, 100)}...</p>
                  </div>
                ))}
                {posts && posts.length > 50 && (
                  <p><em>Showing first 50 of {posts.length} posts...</em></p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <h3>Comments (High Load Test)</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {comments?.slice(0, 100).map((comment) => (
                  <div key={comment.id} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                    <p><strong>{comment.name}</strong> ({comment.email})</p>
                    <p>{comment.body.substring(0, 80)}...</p>
                  </div>
                ))}
                {comments && comments.length > 100 && (
                  <p><em>Showing first 100 of {comments.length} comments...</em></p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3>Users (High Load Test)</h3>
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

          {activeTab === 'albums' && (
            <div>
              <h3>Albums (High Load Test)</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {albums?.slice(0, 50).map((album) => (
                  <div key={album.id} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                    <p><strong>{album.title}</strong></p>
                    <p>User ID: {album.userId}</p>
                  </div>
                ))}
                {albums && albums.length > 50 && (
                  <p><em>Showing first 50 of {albums.length} albums...</em></p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              <h3>Photos (High Load Test)</h3>
              <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {photos?.slice(0, 50).map((photo) => (
                  <div key={photo.id} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                    <img src={photo.thumbnailUrl} alt={photo.title} style={{ width: '50px', height: '50px', marginRight: '10px', objectFit: 'cover' }} />
                    <div>
                      <p><strong>{photo.title}</strong></p>
                      <p>Album ID: {photo.albumId}</p>
                    </div>
                  </div>
                ))}
                {photos && photos.length > 50 && (
                  <p><em>Showing first 50 of {photos.length} photos...</em></p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
