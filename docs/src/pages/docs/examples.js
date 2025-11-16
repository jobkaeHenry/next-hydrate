import React from 'react'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const ExamplesPage = () => {
  const { t } = useTranslation()
  const basicSSR = `// ========== 서버 컴포넌트 ==========
// app/users/page.tsx
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
}

// ========== 클라이언트 컴포넌트 (withHydration HOC 사용) ==========
// app/users/UsersClient.tsx
'use client';
import { withHydration } from '@jobkaehenry/next-hydrate';
import { useQuery } from '@tanstack/react-query';

function UsersClientBase() {
  // 서버에서 미리 가져온 데이터가 자동으로 hydrate됨
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('https://api.example.com/users');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users</h1>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// withHydration HOC로 감싸서 자동 hydration
export default withHydration(UsersClientBase);

// ========== 또는 HydrateClient 직접 사용 ==========
// app/users/UsersClient.tsx (대안)
'use client';
import { HydrateClient } from '@jobkaehenry/next-hydrate';
import { useQuery } from '@tanstack/react-query';

function UsersView() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('https://api.example.com/users');
      return res.json();
    },
  });

  return (
    <div>
      <h1>Users</h1>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

export default function UsersClient({ dehydratedState }) {
  return (
    <HydrateClient state={dehydratedState}>
      <UsersView />
    </HydrateClient>
  );
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
        title={t('docs.examples.seoTitle')}
        description={t('docs.examples.seoDescription')}
        pathname="/docs/examples"
      />
      <DocLayout>
        <h1>{t('docs.examples.title')}</h1>

        <h2>{t('docs.examples.basicSSR.title')}</h2>
        <p>{t('docs.examples.basicSSR.description')}</p>
        <CodeBlock code={basicSSR} language="tsx" title="app/users/page.tsx" />

        <h2>{t('docs.examples.multipleQueries.title')}</h2>
        <p>{t('docs.examples.multipleQueries.description')}</p>
        <CodeBlock code={multipleQueries} language="tsx" />

        <h2>{t('docs.examples.isr.title')}</h2>
        <p>{t('docs.examples.isr.description')}</p>
        <CodeBlock code={isrExample} language="tsx" />

        <h2>{t('docs.examples.conditionalHydration.title')}</h2>
        <p>{t('docs.examples.conditionalHydration.description')}</p>
        <CodeBlock code={conditionalHydration} language="tsx" />

        <h2>{t('docs.examples.payloadControl.title')}</h2>
        <p>{t('docs.examples.payloadControl.description')}</p>
        <CodeBlock code={payloadControl} language="tsx" />

        <h2>{t('docs.examples.infiniteQuery.title')}</h2>
        <p>{t('docs.examples.infiniteQuery.description')}</p>
        <CodeBlock code={infiniteQuery} language="tsx" />

        <h2>{t('docs.examples.errorHandling.title')}</h2>
        <p>{t('docs.examples.errorHandling.description')}</p>
        <CodeBlock code={errorHandling} language="tsx" />

        <h2>{t('docs.examples.withAuth.title')}</h2>
        <p>{t('docs.examples.withAuth.description')}</p>
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
