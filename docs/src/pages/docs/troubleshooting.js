import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const TroubleshootingPage = () => {
  const hydrationFix = `// ✗ Bad: Non-serializable Date object
const data = { createdAt: new Date() }

// ✓ Good: ISO string
const data = { createdAt: new Date().toISOString() }`

  const queryKeyMatch = `// Server
const props = await getHydrationProps({
  queryClient,
  queries: [
    {
      queryKey: ['posts'], // Must match client
      queryFn: fetchPosts,
    },
  ],
})

// Client
const { data } = useQuery({
  queryKey: ['posts'], // Must match server
  queryFn: fetchPosts,
})`

  const payloadFix = `// ✗ Bad: Large payload
const props = await getHydrationProps({
  queryClient,
  queries: [
    {
      queryKey: ['all-data'],
      queryFn: () => fetchAllData(), // 5MB
    },
  ],
})

// ✓ Good: Paginated data
const props = await getHydrationProps({
  queryClient,
  queries: [
    {
      queryKey: ['data', { page: 1, limit: 20 }],
      queryFn: () => fetchData({ page: 1, limit: 20 }), // 50KB
    },
  ],
})`

  return (
    <>
      <SEO
        title="Troubleshooting - next-hydrate"
        description="Common issues and solutions when using next-hydrate"
        pathname="/docs/troubleshooting"
      />
      <DocLayout>
        <h1>Troubleshooting</h1>

        <h2>Common Issues</h2>

        <h3>Hydration Mismatch Errors</h3>
        <p><strong>Symptom</strong>: Error message about server and client HTML not matching</p>
        <p><strong>Cause</strong>: Server-rendered content doesn't match client-rendered content</p>
        <p><strong>Solution</strong>: Ensure data is serializable</p>
        <CodeBlock code={hydrationFix} language="typescript" />

        <h3>Queries Not Hydrating</h3>
        <p><strong>Symptom</strong>: Data fetched on server but not available on client</p>
        <p><strong>Cause</strong>: Missing HydrationBoundary or incorrect setup</p>
        <p><strong>Solution</strong>: Ensure query keys match between server and client</p>
        <CodeBlock code={queryKeyMatch} language="typescript" />

        <h3>Performance Issues</h3>
        <p><strong>Symptom</strong>: Slow page loads or high memory usage</p>
        <p><strong>Cause</strong>: Large hydration payload or too many queries</p>
        <p><strong>Solution</strong>: Reduce payload size</p>
        <CodeBlock code={payloadFix} language="typescript" />

        <h3>Query Refetching Too Often</h3>
        <p><strong>Symptom</strong>: Queries refetch immediately after hydration</p>
        <p><strong>Cause</strong>: Incorrect staleTime or cacheTime configuration</p>
        <p><strong>Solution</strong>: Set appropriate staleTime (e.g., 60 seconds)</p>

        <h3>TypeScript Errors</h3>
        <p><strong>Symptom</strong>: Type errors with query results</p>
        <p><strong>Cause</strong>: Missing or incorrect type annotations</p>
        <p><strong>Solution</strong>: Define proper types for queries</p>

        <h2>Debugging Tips</h2>

        <h3>1. Enable Logging</h3>
        <p>Set <code>devLog: true</code> in getHydrationProps to see detailed logs</p>

        <h3>2. Use React Query DevTools</h3>
        <p>Install and use React Query DevTools to inspect query state</p>

        <h3>3. Check Network Tab</h3>
        <p>Monitor network requests in browser DevTools to verify data flow</p>

        <h2>Getting Help</h2>
        <p>If you're still experiencing issues:</p>
        <ul>
          <li>Check the <a href="/docs/api">API Reference</a> for detailed documentation</li>
          <li>Review <a href="/docs/examples">Examples</a> for working code</li>
          <li>Visit <a href="https://github.com/jobkaeHenry/next-hydrate/issues">GitHub Issues</a></li>
        </ul>

        <h2>Reporting Bugs</h2>
        <p>When reporting issues, please include:</p>
        <ul>
          <li>next-hydrate version</li>
          <li>Next.js version</li>
          <li>React Query version</li>
          <li>Minimal reproduction example</li>
          <li>Error messages and stack traces</li>
        </ul>
      </DocLayout>
    </>
  )
}

export default TroubleshootingPage

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
