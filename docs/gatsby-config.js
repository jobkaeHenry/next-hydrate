module.exports = {
  pathPrefix: `/next-hydrate`,
  siteMetadata: {
    title: `next-hydrate - Universal Hydration for Next.js`,
    description: `Universal hydration utilities for Next.js App Router + React Query v5. Seamless SSR, ISR, SSG, and CSR support with automatic mode detection and performance optimization.`,
    author: `@jobkaehenry`,
    siteUrl: `https://jobkaehenry.github.io`,
    image: `/og-image.png`,
    twitterUsername: `@jobkaehenry`,
    keywords: `nextjs, react-query, tanstack-query, hydration, ssr, isr, ssg, server-side rendering, app router, react, typescript`,
    languages: {
      langs: ['en', 'ko', 'zh', 'ja', 'fr', 'es', 'ar', 'hi'],
      defaultLangKey: 'en'
    }
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://jobkaehenry.github.io/next-hydrate`,
        stripQueryString: true,
      },
    },
    // TODO: Re-enable gatsby-plugin-manifest after adding icon.png to src/images/
    // {
    //   resolve: `gatsby-plugin-manifest`,
    //   options: {
    //     name: `next-hydrate Documentation`,
    //     short_name: `next-hydrate`,
    //     description: `Universal hydration utilities for Next.js App Router + React Query v5`,
    //     start_url: `/`,
    //     background_color: `#ffffff`,
    //     theme_color: `#0070f3`,
    //     display: `standalone`,
    //     icon: `src/images/icon.png`,
    //   },
    // },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `locales`,
        path: `${__dirname}/locales`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        localeJsonSourceName: `locales`,
        languages: ['en', 'ko', 'zh', 'ja', 'fr', 'es', 'ar', 'hi'],
        defaultLanguage: `en`,
        redirect: true,
        generateDefaultLanguagePage: true,
        siteUrl: `https://jobkaehenry.github.io/next-hydrate`,
        i18nextOptions: {
          interpolation: {
            escapeValue: false,
          },
          keySeparator: '.',
          nsSeparator: ':',
        },
      },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
              }
            }
          }
        `,
        resolveSiteUrl: () => `https://jobkaehenry.github.io/next-hydrate`,
        resolvePages: ({
          allSitePage: { nodes: allPages },
        }) => {
          return allPages.map(page => {
            return { ...page }
          })
        },
        serialize: ({ path }) => {
          // Prioritize English pages and documentation
          let priority = 0.5
          let changefreq = 'weekly'

          if (path === '/' || path === '/en/') {
            priority = 1.0
            changefreq = 'daily'
          } else if (path.includes('/docs/')) {
            priority = 0.8
            changefreq = 'weekly'
          } else if (path.includes('/api/')) {
            priority = 0.9
            changefreq = 'weekly'
          }

          return {
            url: path,
            changefreq,
            priority,
          }
        },
      },
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://jobkaehenry.github.io/next-hydrate',
        sitemap: 'https://jobkaehenry.github.io/next-hydrate/sitemap-index.xml',
        policy: [
          {
            userAgent: '*',
            allow: '/',
            disallow: ['/404', '/dev-404-page'],
          },
          {
            userAgent: 'Googlebot',
            allow: '/',
          },
          {
            userAgent: 'Googlebot-Image',
            allow: '/',
          },
        ],
      },
    },
  ],
}
