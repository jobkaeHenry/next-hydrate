import React from 'react'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const InstallationPage = () => {
  const { t } = useTranslation()

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
        title={t('docs.installation.seoTitle')}
        description={t('docs.installation.seoDescription')}
        pathname="/docs/installation"
      />
      <DocLayout>
        <h1>{t('docs.installation.title')}</h1>

        <h2>{t('docs.installation.prerequisites')}</h2>
        <p>{t('docs.installation.prerequisitesDescription')}</p>
        <ul>
          <li><strong>Node.js</strong> 18.0.0 {t('docs.installation.orHigher')}</li>
          <li><strong>Next.js</strong> 13.4.0 {t('docs.installation.orHigher')}</li>
          <li><strong>React</strong> 18.2.0 {t('docs.installation.orHigher')}</li>
          <li><strong>React Query</strong> v5.0.0 {t('docs.installation.orHigher')}</li>
        </ul>

        <h2>{t('docs.installation.packageInstallation')}</h2>
        <p>
          {t('docs.installation.packageDescription')}
        </p>

        <h3>npm</h3>
        <CodeBlock code={npmInstall} language="bash" />

        <h3>yarn</h3>
        <CodeBlock code={yarnInstall} language="bash" />

        <h3>pnpm</h3>
        <CodeBlock code={pnpmInstall} language="bash" />

        <h2>{t('docs.installation.peerDependencies')}</h2>
        <p>{t('docs.installation.peerDependenciesDescription')}</p>
        <CodeBlock code={peerDependencies} language="json" title="package.json" />

        <p>
          {t('docs.installation.peerDependenciesNote')}
        </p>

        <h2>{t('docs.installation.verifyInstallation')}</h2>
        <p>{t('docs.installation.verifyDescription')}</p>
        <CodeBlock code={verifyImport} language="typescript" />

        <p>
          {t('docs.installation.verifySuccess')}
        </p>

        <h2>{t('docs.installation.nextSteps')}</h2>
        <p>
          {t('docs.installation.nextStepsDescription')}
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
