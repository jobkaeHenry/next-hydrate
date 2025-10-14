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

// High load data fetchers that simulate heavy API calls
async function fetchPosts(): Promise<Post[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    title: `TanStack Post Title ${i + 1}`,
    body: `This is the body of TanStack post ${i + 1}. `.repeat(20),
    userId: Math.floor(Math.random() * 100) + 1,
  }));
}

async function fetchComments(): Promise<Comment[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  return Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    name: `TanStack Commenter ${i + 1}`,
    email: `user${i + 1}@example.com`,
    body: `This is TanStack comment ${i + 1}. `.repeat(10),
    postId: Math.floor(Math.random() * 1000) + 1,
  }));
}

async function fetchUsers(): Promise<User[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `TanStack User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));
}

async function fetchAlbums(): Promise<Album[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    title: `TanStack Album ${i + 1}`,
    userId: Math.floor(Math.random() * 100) + 1,
  }));
}

async function fetchPhotos(): Promise<Photo[]> {
  // Simulate heavy API delay
  await new Promise(resolve => setTimeout(resolve, 700));

  return Array.from({ length: 2000 }, (_, i) => ({
    id: i + 1,
    title: `TanStack Photo ${i + 1}`,
    url: `https://picsum.photos/600/400?random=${i + 1}`,
    thumbnailUrl: `https://picsum.photos/150/150?random=${i + 1}`,
    albumId: Math.floor(Math.random() * 200) + 1,
  }));
}
