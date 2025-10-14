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

// Mock heavy data fetchers that simulate real API calls
async function fetchPosts(): Promise<Post[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Post Title ${i + 1}`,
    body: `This is the body of post ${i + 1}. `.repeat(10),
    userId: Math.floor(Math.random() * 10) + 1,
  }));
}

async function fetchComments(): Promise<Comment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));

  return Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    name: `Commenter ${i + 1}`,
    email: `user${i + 1}@example.com`,
    body: `This is comment ${i + 1}. `.repeat(5),
    postId: Math.floor(Math.random() * 100) + 1,
  }));
}

async function fetchUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));
}
