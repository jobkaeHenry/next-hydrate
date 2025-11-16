import React from 'react'
import { graphql } from 'gatsby'
import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import Layout from '../components/layout'
import '../styles/global.css'

const NotFoundPage = () => {
  const { t } = useTranslation()

  const seo = {
    title: '404: Page Not Found - next-hydrate',
    description: 'The page you are looking for could not be found.',
    pathname: '/404',
  }

  return (
    <Layout seo={seo}>
      <div className="hero" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '6rem', marginBottom: '1rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#666' }}>
          {t('notFound.title', 'Page Not Found')}
        </h2>
        <p className="hero-subtitle" style={{ marginBottom: '2rem' }}>
          {t('notFound.description', 'The page you are looking for does not exist or has been moved.')}
        </p>
        <div className="hero-cta">
          <Link to="/" className="btn btn-primary">
            {t('notFound.backHome', 'Back to Home')}
          </Link>
          <Link to="/docs/getting-started" className="btn btn-secondary">
            {t('notFound.viewDocs', 'View Documentation')}
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default NotFoundPage

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
