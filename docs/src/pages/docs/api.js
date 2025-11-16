import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const ApiPage = () => {
  const getHydrationPropsSignature = `async function getHydrationProps<TData = unknown>(
  options: HydrationOptions<TData>
): Promise<HydrationProps>`

  const hydrationPropsInterface = `interface HydrationProps {
  dehydratedState: DehydratedState | null;
  revalidate?: number;
}`

  const detectFetchModeSignature = `async function detectFetchMode(): Promise<FetchMode>`

  const queryProviderExample = `<QueryProvider>
  {children}
</QueryProvider>`

  const hydrateClientExample = `<HydrateClient state={dehydratedState}>
  {children}
</HydrateClient>`

  const withHydrationSignature = `function withHydration<P>(
  Component: ComponentType<P>
): ComponentType<HydratableComponentProps<P>>`

  const hydrationOptionsInterface = `interface HydrationOptions<TData = unknown> {
  queries: QueryConfig<TData>[];
  fetchMode?: FetchMode;
  revalidate?: number;
  concurrency?: number;
  maxPayloadKB?: number;
  devLog?: boolean;
}`

  const queryConfigInterface = `interface QueryConfig<TData = unknown> {
  key: QueryKey;
  fetchFn: () => Promise<TData>;
  hydrate?: boolean;
  pagesToHydrate?: number;
  shouldDehydrate?: (data: TData) => boolean;
}`

  return (
    <>
      <SEO
        title="API Reference - next-hydrate"
        description="Complete API reference for next-hydrate"
        pathname="/docs/api"
      />
      <DocLayout>
        <h1>API Reference</h1>

        <h2>Core Functions</h2>

        <h3>getHydrationProps()</h3>
        <p>Prefetches queries on the server and returns dehydrated state for client hydration.</p>
        <CodeBlock code={getHydrationPropsSignature} language="typescript" title="Function Signature" />

        <h4>Parameters</h4>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>queries</code>
              </td>
              <td>
                <code>QueryConfig&lt;TData&gt;[]</code>
              </td>
              <td>-</td>
              <td>Array of query configurations to prefetch</td>
            </tr>
            <tr>
              <td>
                <code>fetchMode</code>
              </td>
              <td>
                <code>FetchMode</code>
              </td>
              <td>auto-detected</td>
              <td>Override automatic fetch mode detection</td>
            </tr>
            <tr>
              <td>
                <code>revalidate</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>undefined</code>
              </td>
              <td>ISR revalidation time in seconds</td>
            </tr>
            <tr>
              <td>
                <code>concurrency</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>6</code>
              </td>
              <td>Maximum number of parallel fetches</td>
            </tr>
            <tr>
              <td>
                <code>maxPayloadKB</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>200</code>
              </td>
              <td>Maximum payload size before CSR fallback</td>
            </tr>
            <tr>
              <td>
                <code>devLog</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>NODE_ENV !== "production"</code>
              </td>
              <td>Enable development logging</td>
            </tr>
          </tbody>
        </table>

        <h4>QueryConfig</h4>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>key</code>
              </td>
              <td>
                <code>QueryKey</code>
              </td>
              <td>Yes</td>
              <td>React Query cache key</td>
            </tr>
            <tr>
              <td>
                <code>fetchFn</code>
              </td>
              <td>
                <code>() =&gt; Promise&lt;TData&gt;</code>
              </td>
              <td>Yes</td>
              <td>Async function to fetch data</td>
            </tr>
            <tr>
              <td>
                <code>hydrate</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>No</td>
              <td>
                Whether to include in hydration (default: <code>true</code>)
              </td>
            </tr>
            <tr>
              <td>
                <code>pagesToHydrate</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>No</td>
              <td>
                Number of pages for infinite queries (default: <code>1</code>)
              </td>
            </tr>
            <tr>
              <td>
                <code>shouldDehydrate</code>
              </td>
              <td>
                <code>(data: TData) =&gt; boolean</code>
              </td>
              <td>No</td>
              <td>Custom dehydration logic</td>
            </tr>
          </tbody>
        </table>

        <h4>Return Value</h4>
        <CodeBlock code={hydrationPropsInterface} language="typescript" />

        <h3>detectFetchMode()</h3>
        <p>Automatically detects the current rendering mode.</p>
        <CodeBlock code={detectFetchModeSignature} language="typescript" />

        <h4>Return Values</h4>
        <table>
          <thead>
            <tr>
              <th>Mode</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>"ssr"</code>
              </td>
              <td>Server-side rendering (default)</td>
            </tr>
            <tr>
              <td>
                <code>"isr"</code>
              </td>
              <td>Incremental static regeneration</td>
            </tr>
            <tr>
              <td>
                <code>"static"</code>
              </td>
              <td>Static site generation (build time)</td>
            </tr>
            <tr>
              <td>
                <code>"csr"</code>
              </td>
              <td>Client-side rendering</td>
            </tr>
          </tbody>
        </table>

        <h2>Components</h2>

        <h3>QueryProvider</h3>
        <p>Root provider component that sets up React Query client.</p>
        <CodeBlock code={queryProviderExample} language="tsx" title="Usage" />

        <p>
          <strong>Features:</strong>
        </p>
        <ul>
          <li>Creates singleton QueryClient instance</li>
          <li>Enables React Query DevTools in development</li>
          <li>Configures optimal defaults for hydration</li>
        </ul>

        <h3>HydrateClient</h3>
        <p>Client component for hydrating queries.</p>
        <CodeBlock code={hydrateClientExample} language="tsx" title="Usage" />

        <p>
          <strong>Props:</strong>
        </p>
        <ul>
          <li>
            <code>state</code>: <code>DehydratedState | null | undefined</code> - Dehydrated state from
            server
          </li>
          <li>
            <code>children</code>: <code>ReactNode</code> - Child components to hydrate
          </li>
        </ul>

        <h3>withHydration()</h3>
        <p>Higher-order component for automatic hydration.</p>
        <CodeBlock code={withHydrationSignature} language="typescript" />

        <h2>Type Definitions</h2>

        <h3>HydrationOptions</h3>
        <CodeBlock code={hydrationOptionsInterface} language="typescript" />

        <h3>QueryConfig</h3>
        <CodeBlock code={queryConfigInterface} language="typescript" />
      </DocLayout>
    </>
  )
}

export default ApiPage

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
