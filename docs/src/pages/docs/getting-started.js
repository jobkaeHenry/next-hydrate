import React from 'react'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import DocLayout from '../../components/DocLayout'
import SEO from '../../components/SEO'

const GettingStartedPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <SEO
        title={t('docs.gettingStarted.seoTitle')}
        description={t('docs.gettingStarted.seoDescription')}
        pathname="/docs/getting-started"
      />
      <DocLayout>
        <h1>{t('docs.gettingStarted.title')}</h1>

        <h2>{t('docs.gettingStarted.introduction')}</h2>
        <p>
          {t('docs.gettingStarted.intro.description')}
        </p>

        <h2>{t('docs.gettingStarted.whyNextHydrate')}</h2>
        <p>
          {t('docs.gettingStarted.why.description')}
        </p>
        <ul>
          <li>
            <strong>{t('docs.gettingStarted.why.automaticDetection.title')}</strong>: {t('docs.gettingStarted.why.automaticDetection.description')}
          </li>
          <li>
            <strong>{t('docs.gettingStarted.why.performanceOptimized.title')}</strong>: {t('docs.gettingStarted.why.performanceOptimized.description')}
          </li>
          <li>
            <strong>{t('docs.gettingStarted.why.typeSafe.title')}</strong>: {t('docs.gettingStarted.why.typeSafe.description')}
          </li>
          <li>
            <strong>{t('docs.gettingStarted.why.developerFriendly.title')}</strong>: {t('docs.gettingStarted.why.developerFriendly.description')}
          </li>
        </ul>

        <h2>{t('docs.gettingStarted.keyFeatures')}</h2>

        <h3>{t('docs.gettingStarted.universalRendering.title')}</h3>
        <p>{t('docs.gettingStarted.universalRendering.description')}</p>
        <ul>
          <li>
            <strong>SSR</strong> ({t('docs.gettingStarted.universalRendering.ssr')})
          </li>
          <li>
            <strong>ISR</strong> ({t('docs.gettingStarted.universalRendering.isr')})
          </li>
          <li>
            <strong>SSG</strong> ({t('docs.gettingStarted.universalRendering.ssg')})
          </li>
          <li>
            <strong>CSR</strong> ({t('docs.gettingStarted.universalRendering.csr')})
          </li>
        </ul>

        <h3>{t('docs.gettingStarted.performanceFirst.title')}</h3>
        <ul>
          <li>{t('docs.gettingStarted.performanceFirst.concurrency')}</li>
          <li>{t('docs.gettingStarted.performanceFirst.payloadSize')}</li>
          <li>{t('docs.gettingStarted.performanceFirst.memoryEfficient')}</li>
          <li>{t('docs.gettingStarted.performanceFirst.deduplication')}</li>
        </ul>

        <h3>{t('docs.gettingStarted.developerExperience.title')}</h3>
        <ul>
          <li>{t('docs.gettingStarted.developerExperience.typescript')}</li>
          <li>{t('docs.gettingStarted.developerExperience.logging')}</li>
          <li>{t('docs.gettingStarted.developerExperience.devTools')}</li>
          <li>{t('docs.gettingStarted.developerExperience.errorHandling')}</li>
        </ul>

        <h2>{t('docs.gettingStarted.nextSteps.title')}</h2>
        <p>
          {t('docs.gettingStarted.nextSteps.description')}
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
