import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const HydrationPage = () => {
  const serverCode = `// Server Component
const queryClient = getQueryClient()

const props = await getHydrationProps({
  queryClient,
  queries: [
    {
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
    },
  ],
})`

  const clientCode = `'use client'

import { HydrationBoundary } from '@tanstack/react-query'

export function UserProfile({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <UserData />
    </HydrationBoundary>
  )
}`

  return (
    <>
      <SEO
        title="Hydration - next-hydrate"
        description="Understanding hydration in next-hydrate and how to optimize it"
        pathname="/docs/hydration"
      />
      <DocLayout>
        <h1>Hydration</h1>

        <h2>What is Hydration?</h2>
        <p>
          Hydration is the process of attaching React event handlers and state to server-rendered HTML. In
          the context of React Query and Next.js:
        </p>
        <ol>
          <li><strong>Server</strong>: Queries are executed and data is fetched</li>
          <li><strong>Serialization</strong>: Query cache is converted to JSON</li>
          <li><strong>Transfer</strong>: Serialized state is sent to the client</li>
          <li><strong>Client</strong>: React Query cache is rehydrated with the server data</li>
        </ol>

        <h2>The Hydration Process</h2>

        <h3>Step 1: Server-Side Query Execution</h3>
        <CodeBlock code={serverCode} language="typescript" title="Server Component" />

        <h3>Step 2: Client Rehydration</h3>
        <CodeBlock code={clientCode} language="typescript" title="Client Component" />

        <h2>Hydration Optimization</h2>

        <h3>1. Payload Size Management</h3>
        <p>Monitor and limit hydration payload - keep under 100KB when possible.</p>

        <h3>2. Selective Hydration</h3>
        <p>Choose what to hydrate - only hydrate essential data.</p>

        <h3>3. Data Transformation</h3>
        <p>Transform data before hydration to reduce payload size.</p>

        <h2>Best Practices</h2>
        <ul>
          <li><strong>Hydrate Critical Data Only</strong>: Don't hydrate everything</li>
          <li><strong>Monitor Payload Size</strong>: Keep under 100KB when possible</li>
          <li><strong>Use Stale Time</strong>: Prevent immediate refetching</li>
          <li><strong>Transform Data</strong>: Remove unnecessary fields</li>
          <li><strong>Test Hydration</strong>: Verify server/client state matches</li>
        </ul>

        <h2>Next Steps</h2>
        <ul>
          <li>Review <a href="/docs/best-practices">Best Practices</a></li>
          <li>Check <a href="/docs/api">API Reference</a></li>
          <li>See <a href="/docs/examples">Examples</a></li>
        </ul>
      </DocLayout>
    </>
  )
}

export default HydrationPage

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
