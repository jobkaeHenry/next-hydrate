import React from 'react'
import { graphql, Link } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import Layout from '../components/layout'
import '../styles/doc.css'

const shortcodes = {
  Link,
  a: ({ href, ...props }) => {
    if (href.startsWith('http')) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    }
    return <Link to={href} {...props} />
  },
  pre: (props) => <pre className="code-block" {...props} />,
}

const DocTemplate = ({ data, children }) => {
  const { mdx } = data
  const { frontmatter } = mdx

  return (
    <Layout>
      <div className="doc-container">
        <aside className="doc-sidebar">
          <nav>
            <h3>Getting Started</h3>
            <ul>
              <li>
                <Link to="/docs/getting-started" activeClassName="active">
                  Introduction
                </Link>
              </li>
              <li>
                <Link to="/docs/installation" activeClassName="active">
                  Installation
                </Link>
              </li>
              <li>
                <Link to="/docs/quick-start" activeClassName="active">
                  Quick Start
                </Link>
              </li>
            </ul>

            <h3>Core Concepts</h3>
            <ul>
              <li>
                <Link to="/docs/how-it-works" activeClassName="active">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/docs/fetch-modes" activeClassName="active">
                  Fetch Modes
                </Link>
              </li>
              <li>
                <Link to="/docs/hydration" activeClassName="active">
                  Hydration
                </Link>
              </li>
            </ul>

            <h3>API Reference</h3>
            <ul>
              <li>
                <Link to="/docs/api" activeClassName="active">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/docs/api/get-hydration-props" activeClassName="active">
                  getHydrationProps
                </Link>
              </li>
              <li>
                <Link to="/docs/api/detect-fetch-mode" activeClassName="active">
                  detectFetchMode
                </Link>
              </li>
              <li>
                <Link to="/docs/api/components" activeClassName="active">
                  Components
                </Link>
              </li>
            </ul>

            <h3>Guides</h3>
            <ul>
              <li>
                <Link to="/docs/examples" activeClassName="active">
                  Examples
                </Link>
              </li>
              <li>
                <Link to="/docs/best-practices" activeClassName="active">
                  Best Practices
                </Link>
              </li>
              <li>
                <Link to="/docs/troubleshooting" activeClassName="active">
                  Troubleshooting
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <article className="doc-content">
          <h1>{frontmatter.title}</h1>
          <MDXProvider components={shortcodes}>{children}</MDXProvider>
        </article>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        description
      }
    }
  }
`

export default DocTemplate
