import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const ExamplesPage = () => {
  const basicSSR = `// app/users/page.tsx
import { getHydrationProps } from '@jobkaehenry/next-hydrate';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const hydration = await getHydrationProps({
    queries: [
      {
        key: ['users'],
        fetchFn: async () => {
          const res = await fetch('https://api.example.com/users');
          return res.json();
        },
      },
    ],
  });

  return <UsersClient dehydratedState={hydration.dehydratedState} />;
}`

  const multipleQueries = `const hydration = await getHydrationProps({
  queries: [
    {
      key: ['posts'],
      fetchFn: () => fetchPosts(),
    },
    {
      key: ['categories'],
      fetchFn: () => fetchCategories(),
    },
    {
      key: ['tags'],
      fetchFn: () => fetchTags(),
    },
  ],
  concurrency: 3, // Control parallel execution
});`

  const isrExample = `export default async function ProductPage() {
  const hydration = await getHydrationProps({
    queries: [
      {
        key: ['product', id],
        fetchFn: async () => {
          const res = await fetch(\`/api/products/\${id}\`, {
            next: { revalidate: 3600 } // Revalidate every hour
          });
          return res.json();
        },
      },
    ],
    revalidate: 3600, // ISR revalidation interval
  });

  return <ProductClient dehydratedState={hydration.dehydratedState} />;
}`

  const conditionalHydration = `const hydration = await getHydrationProps({
  queries: [
    {
      key: ['public-data'],
      fetchFn: () => fetchPublicData(),
      hydrate: true, // Include in hydration
    },
    {
      key: ['user-specific'],
      fetchFn: () => fetchUserData(),
      hydrate: false, // Skip hydration, fetch on client
    },
  ],
});`

  const payloadControl = `const hydration = await getHydrationProps({
  queries: [
    {
      key: ['large-dataset'],
      fetchFn: () => fetchLargeData(),
      shouldDehydrate: (data) => {
        // Only hydrate if data is small enough
        return data.items.length < 100;
      },
    },
  ],
  maxPayloadKB: 500, // Increase payload limit
});`

  const infiniteQuery = `const hydration = await getHydrationProps({
  queries: [
    {
      key: ['posts'],
      fetchFn: () => fetchPosts({ page: 1 }),
      pagesToHydrate: 2, // Hydrate first 2 pages
    },
  ],
});

// Client component
function PostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => fetchPosts({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <div>
      {data?.pages.map((page) =>
        page.posts.map((post) => <Post key={post.id} {...post} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}`

  const errorHandling = `const hydration = await getHydrationProps({
  queries: [
    {
      key: ['data'],
      fetchFn: async () => {
        try {
          const res = await fetch('/api/data');
          if (!res.ok) throw new Error('Fetch failed');
          return res.json();
        } catch (error) {
          console.error('Prefetch error:', error);
          // Return fallback data or rethrow
          return { items: [] };
        }
      },
    },
  ],
  devLog: true, // Enable logging to see errors
});`

  const withAuth = `import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const hydration = await getHydrationProps({
    queries: [
      {
        key: ['user-data'],
        fetchFn: async () => {
          const res = await fetch('/api/user/data', {
            headers: {
              Authorization: \`Bearer \${token}\`,
            },
          });
          return res.json();
        },
      },
    ],
  });

  return <DashboardClient dehydratedState={hydration.dehydratedState} />;
}`

  return (
    <>
      <SEO
        title="Examples - next-hydrate"
        description="Common usage examples and patterns"
        pathname="/docs/examples"
      />
      <DocLayout>
        <h1>Examples</h1>

        <h2>Basic SSR Example</h2>
        <p>Simple server-side rendering with data prefetching:</p>
        <CodeBlock code={basicSSR} language="tsx" title="app/users/page.tsx" />

        <h2>Multiple Queries</h2>
        <p>Prefetch multiple queries in parallel:</p>
        <CodeBlock code={multipleQueries} language="tsx" />

        <h2>ISR (Incremental Static Regeneration)</h2>
        <p>Enable ISR with revalidation:</p>
        <CodeBlock code={isrExample} language="tsx" />

        <h2>Conditional Hydration</h2>
        <p>Skip hydration for specific queries:</p>
        <CodeBlock code={conditionalHydration} language="tsx" />

        <h2>Custom Payload Control</h2>
        <p>Control which data gets hydrated:</p>
        <CodeBlock code={payloadControl} language="tsx" />

        <h2>Infinite Query</h2>
        <p>Hydrate initial pages of infinite query:</p>
        <CodeBlock code={infiniteQuery} language="tsx" />

        <h2>Error Handling</h2>
        <p>Handle errors gracefully:</p>
        <CodeBlock code={errorHandling} language="tsx" />

        <h2>With Authentication</h2>
        <p>Handle authenticated requests:</p>
        <CodeBlock code={withAuth} language="tsx" />
      </DocLayout>
    </>
  )
}

export default ExamplesPage

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
