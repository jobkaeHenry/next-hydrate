import React from 'react'
import { Link } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import '../styles/layout.css'

const Layout = ({ children }) => {
  const { t } = useTranslation()

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <nav className="nav-container">
          <Link to="/" className="logo">
            {t('site.title')}
          </Link>
          <ul className="nav-menu">
            <li>
              <Link to="/docs/getting-started" activeClassName="active">
                {t('nav.docs')}
              </Link>
            </li>
            <li>
              <Link to="/docs/api" activeClassName="active">
                {t('nav.api')}
              </Link>
            </li>
            <li>
              <Link to="/docs/examples" activeClassName="active">
                {t('nav.examples')}
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/jobkaeHenry/next-hydrate"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('nav.github')}
              </a>
            </li>
            <li>
              <LanguageSwitcher />
            </li>
          </ul>
        </nav>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} {t('footer.copyright')}
        </p>
        <p>
          {t('footer.builtWith')}{' '}
          <a
            href="https://github.com/jobkaeHenry"
            target="_blank"
            rel="noopener noreferrer"
          >
            jobkaehenry
          </a>
        </p>
      </footer>
    </div>
  )
}

export default Layout
