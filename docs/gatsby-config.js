module.exports = {
  siteMetadata: {
    title: `next-hydrate`,
    description: `Universal hydration utilities for Next.js App Router + React Query v5`,
    author: `@jobkaehenry`,
    siteUrl: `https://next-hydrate.dev`,
    languages: {
      langs: ['en', 'ko', 'zh', 'ja', 'fr', 'es', 'ar', 'hi'],
      defaultLangKey: 'en'
    }
  },
  plugins: [
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
  ],
}
