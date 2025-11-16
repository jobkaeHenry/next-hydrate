import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const HowItWorksPage = () => {
  const queriesExample = `const props = await getHydrationProps({
  queryClient,
  queries: [...], // Automatically throttled
})`

  const dataFlow = `Server Component → getHydrationProps() → Execute Queries → Dehydrate State
                                                               ↓
Client Component ← Rehydrate State ← Parse Dehydrated State ←`

  return (
    <>
      <SEO
        title="How It Works - next-hydrate"
        description="Understanding the internals of next-hydrate and how it manages hydration"
        pathname="/docs/how-it-works"
      />
      <DocLayout>
        <h1>How It Works</h1>

        <h2>Overview</h2>
        <p>
          <code>next-hydrate</code> provides a sophisticated hydration system that seamlessly integrates
          with Next.js App Router and React Query v5. This guide explains the core concepts and internal
          mechanisms.
        </p>

        <h2>Architecture</h2>

        <h3>Fetch Mode Detection</h3>
        <p>The library automatically detects the rendering mode by analyzing the Next.js environment:</p>
        <ul>
          <li>
            <strong>SSR Mode</strong>: Detected when running in a server component without static
            generation
          </li>
          <li>
            <strong>ISR Mode</strong>: Identified by the presence of <code>revalidate</code>{' '}
            configuration
          </li>
          <li>
            <strong>SSG Mode</strong>: Detected during build-time static generation
          </li>
          <li>
            <strong>CSR Mode</strong>: Fallback mode for client-side only rendering
          </li>
        </ul>

        <h3>QueryClient Management</h3>
        <p>Server-side QueryClient instances are created per request to ensure:</p>
        <ul>
          <li>Data isolation between requests</li>
          <li>Memory efficiency</li>
          <li>Automatic cleanup after hydration</li>
          <li>Thread-safe operations</li>
        </ul>

        <h3>Hydration Process</h3>
        <ol>
          <li>
            <strong>Server-Side Data Fetching</strong>: Queries are executed on the server using{' '}
            <code>getHydrationProps()</code>
          </li>
          <li>
            <strong>State Serialization</strong>: Query cache is dehydrated into JSON-serializable format
          </li>
          <li>
            <strong>Client Hydration</strong>: Dehydrated state is rehydrated on the client
          </li>
          <li>
            <strong>Query Synchronization</strong>: Client queries sync with server state seamlessly
          </li>
        </ol>

        <h2>Performance Optimizations</h2>

        <h3>Concurrency Control</h3>
        <p>Limits parallel server-side fetches to prevent resource exhaustion:</p>
        <CodeBlock code={queriesExample} language="typescript" />

        <h3>Payload Size Monitoring</h3>
        <p>Automatically falls back to CSR when server payload exceeds limits:</p>
        <ul>
          <li>Prevents hydration performance issues</li>
          <li>Maintains fast page loads</li>
          <li>Graceful degradation</li>
        </ul>

        <h3>Memory Management</h3>
        <ul>
          <li>Automatic QueryClient disposal after hydration</li>
          <li>Query deduplication</li>
          <li>Efficient cache serialization</li>
        </ul>

        <h2>Data Flow</h2>
        <CodeBlock code={dataFlow} language="text" />

        <h2>Error Handling</h2>
        <p>The library provides comprehensive error handling:</p>
        <ul>
          <li>Query failures don't break hydration</li>
          <li>Integrated logging for debugging</li>
          <li>Graceful fallbacks to CSR</li>
        </ul>

        <h2>Next Steps</h2>
        <ul>
          <li>
            Learn about different <a href="/docs/fetch-modes">Fetch Modes</a>
          </li>
          <li>
            Explore the <a href="/docs/api">API Reference</a>
          </li>
          <li>
            See <a href="/docs/examples">Examples</a> in action
          </li>
        </ul>
      </DocLayout>
    </>
  )
}

export default HowItWorksPage

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
