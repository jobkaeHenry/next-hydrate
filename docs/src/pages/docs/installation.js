import React from 'react'
import { graphql } from 'gatsby'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const InstallationPage = () => {
  const npmInstall = `npm install @jobkaehenry/next-hydrate @tanstack/react-query @tanstack/react-query-devtools`

  const yarnInstall = `yarn add @jobkaehenry/next-hydrate @tanstack/react-query @tanstack/react-query-devtools`

  const pnpmInstall = `pnpm add @jobkaehenry/next-hydrate @tanstack/react-query @tanstack/react-query-devtools`

  const peerDependencies = `{
  "@tanstack/react-query": "^5.0.0",
  "next": ">=13.4.0",
  "react": ">=18.2.0",
  "react-dom": ">=18.2.0"
}`

  const verifyImport = `import { getHydrationProps, QueryProvider } from '@jobkaehenry/next-hydrate';`

  return (
    <>
      <SEO
        title="Installation - next-hydrate"
        description="Install next-hydrate in your Next.js project"
        pathname="/docs/installation"
      />
      <DocLayout>
        <h1>Installation</h1>

        <h2>Prerequisites</h2>
        <p>Before installing <code>next-hydrate</code>, make sure you have the following:</p>
        <ul>
          <li><strong>Node.js</strong> 18.0.0 or higher</li>
          <li><strong>Next.js</strong> 13.4.0 or higher</li>
          <li><strong>React</strong> 18.2.0 or higher</li>
          <li><strong>React Query</strong> v5.0.0 or higher</li>
        </ul>

        <h2>Package Installation</h2>
        <p>
          Install <code>next-hydrate</code> and its peer dependencies using your preferred package manager:
        </p>

        <h3>npm</h3>
        <CodeBlock code={npmInstall} language="bash" />

        <h3>yarn</h3>
        <CodeBlock code={yarnInstall} language="bash" />

        <h3>pnpm</h3>
        <CodeBlock code={pnpmInstall} language="bash" />

        <h2>Peer Dependencies</h2>
        <p>The following packages are required as peer dependencies:</p>
        <CodeBlock code={peerDependencies} language="json" title="package.json" />

        <p>
          If you don't have these packages installed, make sure to install them before using{' '}
          <code>next-hydrate</code>.
        </p>

        <h2>Verify Installation</h2>
        <p>To verify that the installation was successful, you can import the library in your code:</p>
        <CodeBlock code={verifyImport} language="typescript" />

        <p>
          If the import works without errors, you're ready to start using <code>next-hydrate</code>!
        </p>

        <h2>Next Steps</h2>
        <p>
          Now that you have <code>next-hydrate</code> installed, proceed to the{' '}
          <a href="/docs/quick-start">Quick Start</a> guide to learn how to use it in your application.
        </p>
      </DocLayout>
    </>
  )
}

export default InstallationPage

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
