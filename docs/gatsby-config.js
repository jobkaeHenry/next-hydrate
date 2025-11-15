module.exports = {
  siteMetadata: {
    title: `next-hydrate - Universal Hydration for Next.js`,
    description: `Universal hydration utilities for Next.js App Router + React Query v5. Seamless SSR, ISR, SSG, and CSR support with automatic mode detection and performance optimization.`,
    author: `@jobkaehenry`,
    siteUrl: `https://next-hydrate.dev`,
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
        siteUrl: `https://next-hydrate.dev`,
        stripQueryString: true,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `next-hydrate Documentation`,
        short_name: `next-hydrate`,
        description: `Universal hydration utilities for Next.js App Router + React Query v5`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#0070f3`,
        display: `standalone`,
        icon: `src/images/icon.png`,
        icons: [
          {
            src: `icons/icon-48x48.png`,
            sizes: `48x48`,
            type: `image/png`,
          },
          {
            src: `icons/icon-72x72.png`,
            sizes: `72x72`,
            type: `image/png`,
          },
          {
            src: `icons/icon-96x96.png`,
            sizes: `96x96`,
            type: `image/png`,
          },
          {
            src: `icons/icon-144x144.png`,
            sizes: `144x144`,
            type: `image/png`,
          },
          {
            src: `icons/icon-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `icons/icon-256x256.png`,
            sizes: `256x256`,
            type: `image/png`,
          },
          {
            src: `icons/icon-384x384.png`,
            sizes: `384x384`,
            type: `image/png`,
          },
          {
            src: `icons/icon-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
      },
    },
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
        siteUrl: `https://next-hydrate.dev`,
        i18nextOptions: {
          interpolation: {
            escapeValue: false,
          },
          keySeparator: false,
          nsSeparator: false,
        },
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
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
        resolveSiteUrl: () => `https://next-hydrate.dev`,
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
        host: 'https://next-hydrate.dev',
        sitemap: 'https://next-hydrate.dev/sitemap-index.xml',
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
