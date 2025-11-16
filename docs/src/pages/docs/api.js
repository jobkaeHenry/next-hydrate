import React from 'react'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import DocLayout from '../../components/DocLayout'
import CodeBlock from '../../components/CodeBlock'
import SEO from '../../components/SEO'

const ApiPage = () => {
  const { t } = useTranslation()
  const getHydrationPropsSignature = `async function getHydrationProps<TData = unknown>(
  options: HydrationOptions<TData>
): Promise<HydrationProps>`

  const hydrationPropsInterface = `interface HydrationProps {
  dehydratedState: DehydratedState | null;
  revalidate?: number;
}`

  const detectFetchModeSignature = `async function detectFetchMode(): Promise<FetchMode>`

  const queryProviderExample = `<QueryProvider>
  {children}
</QueryProvider>`

  const hydrateClientExample = `<HydrateClient state={dehydratedState}>
  {children}
</HydrateClient>`

  const withHydrationSignature = `function withHydration<P>(
  Component: ComponentType<P>
): ComponentType<HydratableComponentProps<P>>`

  const hydrationOptionsInterface = `interface HydrationOptions<TData = unknown> {
  queries: QueryConfig<TData>[];
  fetchMode?: FetchMode;
  revalidate?: number;
  concurrency?: number;
  maxPayloadKB?: number;
  devLog?: boolean;
}`

  const queryConfigInterface = `interface QueryConfig<TData = unknown> {
  key: QueryKey;
  fetchFn: () => Promise<TData>;
  hydrate?: boolean;
  pagesToHydrate?: number;
  shouldDehydrate?: (data: TData) => boolean;
}`

  return (
    <>
      <SEO
        title={t('docs.api.seoTitle')}
        description={t('docs.api.seoDescription')}
        pathname="/docs/api"
      />
      <DocLayout>
        <h1>{t('docs.api.title')}</h1>

        <h2>{t('docs.api.coreFunctions')}</h2>

        <h3>getHydrationProps()</h3>
        <p>{t('docs.api.getHydrationProps.description')}</p>
        <CodeBlock code={getHydrationPropsSignature} language="typescript" title="Function Signature" />

        <h4>{t('docs.api.parameters')}</h4>
        <table>
          <thead>
            <tr>
              <th>{t('docs.api.table.parameter')}</th>
              <th>{t('docs.api.table.type')}</th>
              <th>{t('docs.api.table.default')}</th>
              <th>{t('docs.api.table.description')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>queries</code>
              </td>
              <td>
                <code>QueryConfig&lt;TData&gt;[]</code>
              </td>
              <td>-</td>
              <td>{t('docs.api.params.queries')}</td>
            </tr>
            <tr>
              <td>
                <code>fetchMode</code>
              </td>
              <td>
                <code>FetchMode</code>
              </td>
              <td>{t('docs.api.params.fetchMode.default')}</td>
              <td>{t('docs.api.params.fetchMode.description')}</td>
            </tr>
            <tr>
              <td>
                <code>revalidate</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>undefined</code>
              </td>
              <td>{t('docs.api.params.revalidate')}</td>
            </tr>
            <tr>
              <td>
                <code>concurrency</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>6</code>
              </td>
              <td>{t('docs.api.params.concurrency')}</td>
            </tr>
            <tr>
              <td>
                <code>maxPayloadKB</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>200</code>
              </td>
              <td>{t('docs.api.params.maxPayloadKB')}</td>
            </tr>
            <tr>
              <td>
                <code>devLog</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>NODE_ENV !== "production"</code>
              </td>
              <td>{t('docs.api.params.devLog')}</td>
            </tr>
          </tbody>
        </table>

        <h4>QueryConfig</h4>
        <table>
          <thead>
            <tr>
              <th>{t('docs.api.table.property')}</th>
              <th>{t('docs.api.table.type')}</th>
              <th>{t('docs.api.table.required')}</th>
              <th>{t('docs.api.table.description')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>key</code>
              </td>
              <td>
                <code>QueryKey</code>
              </td>
              <td>{t('docs.api.yes')}</td>
              <td>{t('docs.api.queryConfig.key')}</td>
            </tr>
            <tr>
              <td>
                <code>fetchFn</code>
              </td>
              <td>
                <code>() =&gt; Promise&lt;TData&gt;</code>
              </td>
              <td>{t('docs.api.yes')}</td>
              <td>{t('docs.api.queryConfig.fetchFn')}</td>
            </tr>
            <tr>
              <td>
                <code>hydrate</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>{t('docs.api.no')}</td>
              <td>
                {t('docs.api.queryConfig.hydrate')} (<code>true</code>)
              </td>
            </tr>
            <tr>
              <td>
                <code>pagesToHydrate</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>{t('docs.api.no')}</td>
              <td>
                {t('docs.api.queryConfig.pagesToHydrate')} (<code>1</code>)
              </td>
            </tr>
            <tr>
              <td>
                <code>shouldDehydrate</code>
              </td>
              <td>
                <code>(data: TData) =&gt; boolean</code>
              </td>
              <td>{t('docs.api.no')}</td>
              <td>{t('docs.api.queryConfig.shouldDehydrate')}</td>
            </tr>
          </tbody>
        </table>

        <h4>{t('docs.api.returnValue')}</h4>
        <CodeBlock code={hydrationPropsInterface} language="typescript" />

        <h3>detectFetchMode()</h3>
        <p>{t('docs.api.detectFetchMode.description')}</p>
        <CodeBlock code={detectFetchModeSignature} language="typescript" />

        <h4>{t('docs.api.returnValues')}</h4>
        <table>
          <thead>
            <tr>
              <th>{t('docs.api.table.mode')}</th>
              <th>{t('docs.api.table.description')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>"ssr"</code>
              </td>
              <td>{t('docs.api.modes.ssr')}</td>
            </tr>
            <tr>
              <td>
                <code>"isr"</code>
              </td>
              <td>{t('docs.api.modes.isr')}</td>
            </tr>
            <tr>
              <td>
                <code>"static"</code>
              </td>
              <td>{t('docs.api.modes.static')}</td>
            </tr>
            <tr>
              <td>
                <code>"csr"</code>
              </td>
              <td>{t('docs.api.modes.csr')}</td>
            </tr>
          </tbody>
        </table>

        <h2>{t('docs.api.components')}</h2>

        <h3>QueryProvider</h3>
        <p>{t('docs.api.queryProvider.description')}</p>
        <CodeBlock code={queryProviderExample} language="tsx" title={t('docs.api.usage')} />

        <p>
          <strong>{t('docs.api.features')}:</strong>
        </p>
        <ul>
          <li>{t('docs.api.queryProvider.feature1')}</li>
          <li>{t('docs.api.queryProvider.feature2')}</li>
          <li>{t('docs.api.queryProvider.feature3')}</li>
        </ul>

        <h3>HydrateClient</h3>
        <p>{t('docs.api.hydrateClient.description')}</p>
        <CodeBlock code={hydrateClientExample} language="tsx" title={t('docs.api.usage')} />

        <p>
          <strong>{t('docs.api.props')}:</strong>
        </p>
        <ul>
          <li>
            <code>state</code>: <code>DehydratedState | null | undefined</code> - {t('docs.api.hydrateClient.stateProp')}
          </li>
          <li>
            <code>children</code>: <code>ReactNode</code> - {t('docs.api.hydrateClient.childrenProp')}
          </li>
        </ul>

        <h3>withHydration()</h3>
        <p>{t('docs.api.withHydration.description')}</p>
        <CodeBlock code={withHydrationSignature} language="typescript" />

        <h2>{t('docs.api.typeDefinitions')}</h2>

        <h3>HydrationOptions</h3>
        <CodeBlock code={hydrationOptionsInterface} language="typescript" />

        <h3>QueryConfig</h3>
        <CodeBlock code={queryConfigInterface} language="typescript" />
      </DocLayout>
    </>
  )
}

export default ApiPage

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
