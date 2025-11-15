import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/layout'
import '../styles/global.css'

const IndexPage = () => {
  return (
    <Layout>
      <div className="hero">
        <h1 className="hero-title">next-hydrate</h1>
        <p className="hero-subtitle">
          Universal hydration utilities for Next.js App Router + React Query v5
        </p>
        <div className="hero-cta">
          <Link to="/docs/getting-started" className="btn btn-primary">
            Get Started
          </Link>
          <a
            href="https://github.com/jobkaeHenry/next-hydrate"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>🚀 Universal Support</h3>
          <p>
            Works seamlessly with SSR, ISR, SSG, and CSR. Automatically detects
            the rendering mode and optimizes hydration accordingly.
          </p>
        </div>

        <div className="feature-card">
          <h3>⚡ Performance First</h3>
          <p>
            Built-in concurrency control, payload size limits, and memory
            optimization for both server and client environments.
          </p>
        </div>

        <div className="feature-card">
          <h3>🎯 Type-Safe</h3>
          <p>
            Full TypeScript support with comprehensive type definitions and
            excellent IDE autocomplete experience.
          </p>
        </div>

        <div className="feature-card">
          <h3>🛠️ Developer Friendly</h3>
          <p>
            Simple API with powerful features. Integrated logging, error
            handling, and React Query DevTools support.
          </p>
        </div>

        <div className="feature-card">
          <h3>📦 Zero Configuration</h3>
          <p>
            Works out of the box with sensible defaults. Customize only what you
            need.
          </p>
        </div>

        <div className="feature-card">
          <h3>🔄 Smart Hydration</h3>
          <p>
            Automatic deduplication, selective hydration, and CSR fallback for
            large payloads.
          </p>
        </div>
      </div>

      <div className="quick-start">
        <h2>Quick Start</h2>
        <pre>
          <code>{`npm install @jobkaehenry/next-hydrate @tanstack/react-query`}</code>
        </pre>
        <Link to="/docs/installation" className="learn-more">
          Learn more →
        </Link>
      </div>
    </Layout>
  )
}

export default IndexPage
