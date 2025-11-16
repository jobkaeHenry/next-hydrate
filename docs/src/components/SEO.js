import React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
import { useI18next } from 'gatsby-plugin-react-i18next'

const SEO = ({
  title,
  description,
  image,
  article = false,
  pathname,
  keywords,
  author,
  lang,
  meta = []
}) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            siteUrl
            image
            twitterUsername
            keywords
          }
        }
      }
    `
  )

  const { language } = useI18next()
  const currentLang = lang || language || 'en'

  const metaDescription = description || site.siteMetadata.description
  const metaTitle = title || site.siteMetadata.title
  const metaImage = image || site.siteMetadata.image
  const metaKeywords = keywords || site.siteMetadata.keywords
  const metaAuthor = author || site.siteMetadata.author
  const siteUrl = site.siteMetadata.siteUrl
  const url = pathname ? `${siteUrl}${pathname}` : siteUrl

  // Structured Data for Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'next-hydrate',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://github.com/jobkaeHenry/next-hydrate',
      'https://www.npmjs.com/package/@jobkaehenry/next-hydrate',
    ],
  }

  // Structured Data for SoftwareApplication
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'next-hydrate',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: metaDescription,
    url: siteUrl,
    author: {
      '@type': 'Person',
      name: 'jobkaehenry',
    },
    programmingLanguage: 'TypeScript',
    keywords: metaKeywords,
  }

  // Structured Data for WebSite
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: metaTitle,
    description: metaDescription,
    inLanguage: currentLang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  // Breadcrumb for documentation
  const breadcrumbSchema = pathname && pathname.includes('/docs/') ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Documentation',
        item: `${siteUrl}/docs`,
      },
    ],
  } : null

  return (
    <Helmet
      htmlAttributes={{
        lang: currentLang,
      }}
      title={metaTitle}
      titleTemplate={title ? `%s | next-hydrate` : null}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          name: `keywords`,
          content: metaKeywords,
        },
        {
          name: `author`,
          content: metaAuthor,
        },
        // Open Graph
        {
          property: `og:title`,
          content: metaTitle,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: article ? `article` : `website`,
        },
        {
          property: `og:url`,
          content: url,
        },
        {
          property: `og:image`,
          content: `${siteUrl}${metaImage}`,
        },
        {
          property: `og:image:width`,
          content: `1200`,
        },
        {
          property: `og:image:height`,
          content: `630`,
        },
        {
          property: `og:site_name`,
          content: `next-hydrate`,
        },
        {
          property: `og:locale`,
          content: currentLang === 'en' ? 'en_US' : currentLang,
        },
        // Twitter Card
        {
          name: `twitter:card`,
          content: `summary_large_image`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.twitterUsername,
        },
        {
          name: `twitter:title`,
          content: metaTitle,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        {
          name: `twitter:image`,
          content: `${siteUrl}${metaImage}`,
        },
        // Additional meta tags
        {
          name: `viewport`,
          content: `width=device-width, initial-scale=1, shrink-to-fit=no`,
        },
        {
          name: `theme-color`,
          content: `#00a5ba`,
        },
        {
          name: `robots`,
          content: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`,
        },
        {
          name: `googlebot`,
          content: `index, follow`,
        },
        // Canonical
        {
          rel: `canonical`,
          href: url,
        },
      ].concat(meta)}
    >
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Alternate language versions */}
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en${pathname || ''}`} />
      <link rel="alternate" hrefLang="ko" href={`${siteUrl}/ko${pathname || ''}`} />
      <link rel="alternate" hrefLang="zh" href={`${siteUrl}/zh${pathname || ''}`} />
      <link rel="alternate" hrefLang="ja" href={`${siteUrl}/ja${pathname || ''}`} />
      <link rel="alternate" hrefLang="fr" href={`${siteUrl}/fr${pathname || ''}`} />
      <link rel="alternate" hrefLang="es" href={`${siteUrl}/es${pathname || ''}`} />
      <link rel="alternate" hrefLang="ar" href={`${siteUrl}/ar${pathname || ''}`} />
      <link rel="alternate" hrefLang="hi" href={`${siteUrl}/hi${pathname || ''}`} />
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/en${pathname || ''}`} />
    </Helmet>
  )
}

export default SEO
