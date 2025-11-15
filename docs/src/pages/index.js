import React from 'react'
import { graphql } from 'gatsby'
import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import Layout from '../components/layout'
import '../styles/global.css'

const IndexPage = () => {
  const { t } = useTranslation()

  const seo = {
    title: 'next-hydrate - Universal Hydration for Next.js App Router',
    description: 'Universal hydration utilities for Next.js App Router + React Query v5. Seamless SSR, ISR, SSG, and CSR support with automatic mode detection and performance optimization.',
    keywords: 'nextjs, next.js, app router, react-query, tanstack-query, hydration, ssr, isr, ssg, server-side rendering, react, typescript',
    pathname: '/',
  }

  return (
    <Layout seo={seo}>
      <div className="hero">
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-subtitle">
          {t('hero.subtitle')}
        </p>
        <div className="hero-cta">
          <Link to="/docs/getting-started" className="btn btn-primary">
            {t('hero.getStarted')}
          </Link>
          <a
            href="https://github.com/jobkaeHenry/next-hydrate"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('hero.viewOnGithub')}
          </a>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>{t('features.universal.title')}</h3>
          <p>{t('features.universal.description')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('features.performance.title')}</h3>
          <p>{t('features.performance.description')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('features.typeSafe.title')}</h3>
          <p>{t('features.typeSafe.description')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('features.devFriendly.title')}</h3>
          <p>{t('features.devFriendly.description')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('features.zeroConfig.title')}</h3>
          <p>{t('features.zeroConfig.description')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('features.smartHydration.title')}</h3>
          <p>{t('features.smartHydration.description')}</p>
        </div>
      </div>

      <div className="quick-start">
        <h2>{t('quickStart.title')}</h2>
        <pre>
          <code>{t('quickStart.install')}</code>
        </pre>
        <Link to="/docs/installation" className="learn-more">
          {t('quickStart.learnMore')}
        </Link>
      </div>
    </Layout>
  )
}

export default IndexPage

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
