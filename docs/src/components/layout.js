import React from 'react'
import { Link } from 'gatsby'
import '../styles/layout.css'

const Layout = ({ children }) => {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <nav className="nav-container">
          <Link to="/" className="logo">
            next-hydrate
          </Link>
          <ul className="nav-menu">
            <li>
              <Link to="/docs/getting-started" activeClassName="active">
                Docs
              </Link>
            </li>
            <li>
              <Link to="/docs/api" activeClassName="active">
                API
              </Link>
            </li>
            <li>
              <Link to="/docs/examples" activeClassName="active">
                Examples
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/jobkaeHenry/next-hydrate"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} next-hydrate. MIT License.
        </p>
        <p>
          Built with ❤️ by{' '}
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
