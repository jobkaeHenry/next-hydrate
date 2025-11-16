import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import SEO from '../../components/SEO'

const GettingStartedPage = () => {
  return (
    <>
      <SEO
        title="Getting Started - next-hydrate"
        description="Learn how to get started with next-hydrate"
        pathname="/docs/getting-started"
      />
      <DocLayout>
        <h1>Getting Started</h1>

        <h2>Introduction</h2>
        <p>
          <code>next-hydrate</code> is a powerful library that provides universal hydration utilities for
          Next.js App Router applications using React Query v5. It automatically handles the complexity of
          server-side rendering, incremental static regeneration, static site generation, and client-side
          rendering.
        </p>

        <h2>Why next-hydrate?</h2>
        <p>
          Managing React Query state across different Next.js rendering strategies can be challenging.{' '}
          <code>next-hydrate</code> solves this by:
        </p>
        <ul>
          <li>
            <strong>Automatic Detection</strong>: Automatically detects whether you're in SSR, ISR, SSG, or
            CSR mode
          </li>
          <li>
            <strong>Performance Optimized</strong>: Built-in concurrency control, payload size limits, and
            memory optimization
          </li>
          <li>
            <strong>Type-Safe</strong>: Full TypeScript support with comprehensive type definitions
          </li>
          <li>
            <strong>Developer Friendly</strong>: Simple API with powerful features and integrated logging
          </li>
        </ul>

        <h2>Key Features</h2>

        <h3>Universal Rendering Support</h3>
        <p>Works seamlessly across all Next.js rendering modes:</p>
        <ul>
          <li>
            <strong>SSR</strong> (Server-Side Rendering)
          </li>
          <li>
            <strong>ISR</strong> (Incremental Static Regeneration)
          </li>
          <li>
            <strong>SSG</strong> (Static Site Generation)
          </li>
          <li>
            <strong>CSR</strong> (Client-Side Rendering)
          </li>
        </ul>

        <h3>Performance First</h3>
        <ul>
          <li>Concurrency control for parallel fetches</li>
          <li>Payload size monitoring with automatic CSR fallback</li>
          <li>Memory-efficient server-side QueryClient</li>
          <li>Query deduplication</li>
        </ul>

        <h3>Developer Experience</h3>
        <ul>
          <li>TypeScript-first with excellent IDE support</li>
          <li>Integrated logging and debugging</li>
          <li>React Query DevTools support</li>
          <li>Comprehensive error handling</li>
        </ul>

        <h2>Next Steps</h2>
        <p>
          Ready to get started? Check out the <a href="/docs/installation">Installation</a> guide or jump
          straight to the <a href="/docs/quick-start">Quick Start</a> tutorial.
        </p>
      </DocLayout>
    </>
  )
}

export default GettingStartedPage

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
