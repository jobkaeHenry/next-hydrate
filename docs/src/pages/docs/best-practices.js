import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const BestPracticesPage = () => {
  const goodExample = `// ✓ Good: Paginated data
const props = await getHydrationProps({
  queryClient,
  queries: [
    {
      queryKey: ['products', { page: 1, limit: 20 }],
      queryFn: () => fetchProducts({ page: 1, limit: 20 }), // ~50KB
    },
  ],
})`

  const typeExample = `interface Post {
  id: string
  title: string
  content: string
}

const props = await getHydrationProps({
  queryClient,
  queries: [
    {
      queryKey: ['posts'],
      queryFn: async (): Promise<Post[]> => {
        const res = await fetch('/api/posts')
        return res.json()
      },
    },
  ],
})`

  return (
    <>
      <SEO
        title="Best Practices - next-hydrate"
        description="Best practices for using next-hydrate effectively in production applications"
        pathname="/docs/best-practices"
      />
      <DocLayout>
        <h1>Best Practices</h1>

        <h2>General Guidelines</h2>

        <h3>1. Choose the Right Fetch Mode</h3>
        <p>Select the appropriate rendering strategy for your use case:</p>
        <ul>
          <li><strong>SSG</strong> for static content</li>
          <li><strong>ISR</strong> for periodic updates</li>
          <li><strong>SSR</strong> for dynamic user data</li>
          <li><strong>CSR</strong> for client-only data</li>
        </ul>

        <h3>2. Optimize Payload Size</h3>
        <p>Keep hydration payloads small for better performance:</p>
        <CodeBlock code={goodExample} language="typescript" />

        <h3>3. Use Proper Query Keys</h3>
        <p>Structure query keys for effective caching using hierarchical, descriptive keys.</p>

        <h2>Performance Optimization</h2>

        <h3>1. Implement Stale Time</h3>
        <p>Prevent unnecessary refetching by setting appropriate staleTime (e.g., 5 minutes).</p>

        <h3>2. Use Query Prefetching</h3>
        <p>Prefetch data on server for better UX.</p>

        <h3>3. Implement Concurrency Control</h3>
        <p>Avoid overwhelming the server - batch or limit concurrent requests.</p>

        <h2>Type Safety</h2>

        <h3>Define Query Types</h3>
        <p>Use TypeScript for type-safe queries:</p>
        <CodeBlock code={typeExample} language="typescript" />

        <h2>Security</h2>

        <h3>1. Sanitize Data</h3>
        <p>Always sanitize data before hydration to prevent XSS attacks.</p>

        <h3>2. Validate Data</h3>
        <p>Validate server responses using schema validation (e.g., Zod).</p>

        <h3>3. Protect Sensitive Data</h3>
        <p>Never hydrate sensitive information like passwords, tokens, etc.</p>

        <h2>Next Steps</h2>
        <ul>
          <li>Review <a href="/docs/troubleshooting">Troubleshooting</a> for common issues</li>
          <li>Check <a href="/docs/api">API Reference</a> for detailed documentation</li>
          <li>Explore <a href="/docs/examples">Examples</a> for real-world usage</li>
        </ul>
      </DocLayout>
    </>
  )
}

export default BestPracticesPage

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
