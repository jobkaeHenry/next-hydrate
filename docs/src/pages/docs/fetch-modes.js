import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const FetchModesPage = () => {
  const ssrExample = `// app/posts/page.tsx
import { getHydrationProps } from '@jobkaehenry/next-hydrate'
import { getQueryClient } from '@/lib/query-client'

export default async function PostsPage() {
  const queryClient = getQueryClient()

  const props = await getHydrationProps({
    queryClient,
    queries: [
      {
        queryKey: ['posts'],
        queryFn: async () => {
          const res = await fetch('https://api.example.com/posts')
          return res.json()
        },
      },
    ],
  })

  return <PostsList dehydratedState={props.dehydratedState} />
}`

  const isrExample = `// app/product/[id]/page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function ProductPage({ params }: { params: { id: string } }) {
  const queryClient = getQueryClient()

  const props = await getHydrationProps({
    queryClient,
    queries: [
      {
        queryKey: ['product', params.id],
        queryFn: async () => fetchProduct(params.id),
      },
    ],
  })

  return <Product dehydratedState={props.dehydratedState} />
}`

  const ssgExample = `// app/docs/[slug]/page.tsx
export async function generateStaticParams() {
  return [
    { slug: 'getting-started' },
    { slug: 'api-reference' },
  ]
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const queryClient = getQueryClient()

  const props = await getHydrationProps({
    queryClient,
    queries: [
      {
        queryKey: ['doc', params.slug],
        queryFn: async () => fetchDoc(params.slug),
      },
    ],
  })

  return <DocContent dehydratedState={props.dehydratedState} />
}`

  const csrExample = `'use client'

import { useQuery } from '@tanstack/react-query'

export function UserDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn: fetchUserDashboard,
  })

  if (isLoading) return <Spinner />

  return <Dashboard data={data} />
}`

  const detectExample = `import { detectFetchMode } from '@jobkaehenry/next-hydrate'

const mode = detectFetchMode()
// Returns: 'SSR' | 'ISR' | 'SSG' | 'CSR'`

  return (
    <>
      <SEO
        title="Fetch Modes - next-hydrate"
        description="Understanding different fetch modes in next-hydrate: SSR, ISR, SSG, and CSR"
        pathname="/docs/fetch-modes"
      />
      <DocLayout>
        <h1>Fetch Modes</h1>

        <h2>Overview</h2>
        <p>
          <code>next-hydrate</code> supports all Next.js rendering strategies with automatic mode detection.
          This guide explains each fetch mode and when to use them.
        </p>

        <h2>Server-Side Rendering (SSR)</h2>

        <h3>What is SSR?</h3>
        <p>Server-Side Rendering generates HTML for each request on the server. This ensures:</p>
        <ul>
          <li>Always up-to-date content</li>
          <li>SEO-friendly pages</li>
          <li>Dynamic personalization</li>
        </ul>

        <h3>When to Use SSR</h3>
        <ul>
          <li>User-specific content</li>
          <li>Frequently changing data</li>
          <li>Real-time information</li>
          <li>Personalized pages</li>
        </ul>

        <h3>Example</h3>
        <CodeBlock code={ssrExample} language="typescript" title="SSR Example" />

        <h2>Incremental Static Regeneration (ISR)</h2>

        <h3>What is ISR?</h3>
        <p>ISR combines the benefits of static generation with on-demand revalidation.</p>

        <h3>When to Use ISR</h3>
        <ul>
          <li>Content that updates periodically</li>
          <li>High-traffic pages with moderate data freshness requirements</li>
          <li>E-commerce product pages</li>
          <li>News articles</li>
        </ul>

        <h3>Example</h3>
        <CodeBlock code={isrExample} language="typescript" title="ISR Example" />

        <h2>Static Site Generation (SSG)</h2>

        <h3>What is SSG?</h3>
        <p>SSG generates HTML at build time, serving pre-rendered pages for maximum performance.</p>

        <h3>When to Use SSG</h3>
        <ul>
          <li>Content that rarely changes</li>
          <li>Marketing pages</li>
          <li>Documentation</li>
          <li>Blog posts</li>
        </ul>

        <h3>Example</h3>
        <CodeBlock code={ssgExample} language="typescript" title="SSG Example" />

        <h2>Client-Side Rendering (CSR)</h2>

        <h3>What is CSR?</h3>
        <p>CSR fetches data on the client after initial page load.</p>

        <h3>When to Use CSR</h3>
        <ul>
          <li>User interactions</li>
          <li>Private data</li>
          <li>Large payloads that shouldn't be hydrated</li>
          <li>Real-time updates</li>
        </ul>

        <h3>Example</h3>
        <CodeBlock code={csrExample} language="typescript" title="CSR Example" />

        <h2>Automatic Mode Detection</h2>
        <p>
          <code>next-hydrate</code> automatically detects the appropriate mode using the{' '}
          <code>detectFetchMode()</code> utility:
        </p>
        <CodeBlock code={detectExample} language="typescript" />

        <h2>Performance Considerations</h2>
        <table>
          <thead>
            <tr>
              <th>Mode</th>
              <th>Build Time</th>
              <th>Request Time</th>
              <th>Freshness</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SSG</td>
              <td>Slowest</td>
              <td>Fastest</td>
              <td>Stale</td>
              <td>Static content</td>
            </tr>
            <tr>
              <td>ISR</td>
              <td>Slow</td>
              <td>Fast</td>
              <td>Periodic</td>
              <td>Semi-dynamic</td>
            </tr>
            <tr>
              <td>SSR</td>
              <td>Fast</td>
              <td>Moderate</td>
              <td>Real-time</td>
              <td>Dynamic content</td>
            </tr>
            <tr>
              <td>CSR</td>
              <td>Fastest</td>
              <td>Slowest</td>
              <td>Real-time</td>
              <td>Client-only data</td>
            </tr>
          </tbody>
        </table>

        <h2>Next Steps</h2>
        <ul>
          <li>
            Explore <a href="/docs/hydration">Hydration concepts</a>
          </li>
          <li>
            Check <a href="/docs/best-practices">Best Practices</a>
          </li>
          <li>
            View <a href="/docs/api">API Reference</a>
          </li>
        </ul>
      </DocLayout>
    </>
  )
}

export default FetchModesPage

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
