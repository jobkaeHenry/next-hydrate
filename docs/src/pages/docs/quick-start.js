import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const QuickStartPage = () => {
  const layoutCode = `// app/layout.tsx
import { QueryProvider } from '@jobkaehenry/next-hydrate';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}`

  const serverCode = `// app/posts/page.tsx
import { getHydrationProps } from '@jobkaehenry/next-hydrate';
import PostsClient from './PostsClient';

export default async function PostsPage() {
  const hydration = await getHydrationProps({
    queries: [
      {
        key: ['posts'],
        fetchFn: async () => {
          const res = await fetch(\`\${process.env.API_URL}/api/posts\`, {
            next: { revalidate: 60, tags: ['posts'] }
          });
          if (!res.ok) throw new Error('Failed to fetch posts');
          return res.json();
        },
      },
    ],
  });

  return <PostsClient dehydratedState={hydration.dehydratedState} />;
}`

  const clientCode = `// app/posts/PostsClient.tsx
'use client';

import { withHydration } from '@jobkaehenry/next-hydrate';
import { useQuery } from '@tanstack/react-query';

function PostsClientBase() {
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts');
      return res.json();
    },
  });

  return (
    <div>
      <h1>Posts</h1>
      {posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

export default withHydration(PostsClientBase);`

  const alternativeCode = `// app/posts/PostsClient.tsx
'use client';

import { HydrateClient } from '@jobkaehenry/next-hydrate';
import PostsView from './PostsView';

export default function PostsClient({ dehydratedState }) {
  return (
    <HydrateClient state={dehydratedState}>
      <PostsView />
    </HydrateClient>
  );
}`

  return (
    <>
      <SEO
        title="Quick Start - next-hydrate"
        description="Get up and running with next-hydrate in minutes"
        pathname="/docs/quick-start"
      />
      <DocLayout>
        <h1>Quick Start</h1>

        <h2>Step 1: Setup Query Provider</h2>
        <p>
          First, wrap your application with the <code>QueryProvider</code> in your root layout:
        </p>
        <CodeBlock code={layoutCode} language="tsx" title="app/layout.tsx" />

        <h2>Step 2: Server-Side Data Fetching</h2>
        <p>
          In your server component, use <code>getHydrationProps</code> to prefetch data:
        </p>
        <CodeBlock code={serverCode} language="tsx" title="app/posts/page.tsx" />

        <h2>Step 3: Client Component</h2>
        <p>Create a client component that uses the hydrated data:</p>
        <CodeBlock code={clientCode} language="tsx" title="app/posts/PostsClient.tsx" />

        <h2>Alternative: Using HydrateClient</h2>
        <p>
          If you prefer composition over HOCs, you can use <code>HydrateClient</code> directly:
        </p>
        <CodeBlock code={alternativeCode} language="tsx" title="app/posts/PostsClient.tsx" />

        <h2>That's It!</h2>
        <p>
          You've successfully set up <code>next-hydrate</code> in your Next.js application. The library
          will automatically:
        </p>
        <ul>
          <li>Detect the rendering mode (SSR/ISR/SSG/CSR)</li>
          <li>Prefetch queries on the server</li>
          <li>Hydrate the client with server data</li>
          <li>Fall back to CSR if the payload is too large</li>
        </ul>

        <h2>What's Next?</h2>
        <ul>
          <li>
            Learn about <a href="/docs/fetch-modes">Fetch Modes</a>
          </li>
          <li>
            Explore the <a href="/docs/api">API Reference</a>
          </li>
          <li>
            Check out <a href="/docs/examples">Examples</a> for common use cases
          </li>
        </ul>
      </DocLayout>
    </>
  )
}

export default QuickStartPage

export const query = graphql`
  query($language: String!) {
    locales: allLocale(filter: {language: {eq: $language}}) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`
