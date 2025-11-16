import React from 'react'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const QuickStartPage = () => {
  const { t } = useTranslation()
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
        title={t('docs.quickStart.seoTitle')}
        description={t('docs.quickStart.seoDescription')}
        pathname="/docs/quick-start"
      />
      <DocLayout>
        <h1>{t('docs.quickStart.title')}</h1>

        <h2>{t('docs.quickStart.step1.title')}</h2>
        <p>
          {t('docs.quickStart.step1.description')}
        </p>
        <CodeBlock code={layoutCode} language="tsx" title="app/layout.tsx" />

        <h2>{t('docs.quickStart.step2.title')}</h2>
        <p>
          {t('docs.quickStart.step2.description')}
        </p>
        <CodeBlock code={serverCode} language="tsx" title="app/posts/page.tsx" />

        <h2>{t('docs.quickStart.step3.title')}</h2>
        <p>{t('docs.quickStart.step3.description')}</p>
        <CodeBlock code={clientCode} language="tsx" title="app/posts/PostsClient.tsx" />

        <h2>{t('docs.quickStart.alternative.title')}</h2>
        <p>
          {t('docs.quickStart.alternative.description')}
        </p>
        <CodeBlock code={alternativeCode} language="tsx" title="app/posts/PostsClient.tsx" />

        <h2>{t('docs.quickStart.thatsIt.title')}</h2>
        <p>
          {t('docs.quickStart.thatsIt.description')}
        </p>
        <ul>
          <li>{t('docs.quickStart.thatsIt.feature1')}</li>
          <li>{t('docs.quickStart.thatsIt.feature2')}</li>
          <li>{t('docs.quickStart.thatsIt.feature3')}</li>
          <li>{t('docs.quickStart.thatsIt.feature4')}</li>
        </ul>

        <h2>{t('docs.quickStart.whatsNext.title')}</h2>
        <ul>
          <li>
            {t('docs.quickStart.whatsNext.fetchModes')}
          </li>
          <li>
            {t('docs.quickStart.whatsNext.apiReference')}
          </li>
          <li>
            {t('docs.quickStart.whatsNext.examples')}
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
