const path = require('path')

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const docTemplate = path.resolve(`./src/templates/doc-template.js`)

  result.data.allMdx.nodes.forEach((node) => {
    createPage({
      path: node.frontmatter.slug,
      component: `${docTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
      },
    })
  })
}
