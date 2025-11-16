import React, { useEffect, useState, useRef } from 'react'
import Layout from './layout'
import TableOfContents from './TableOfContents'

const DocLayout = ({ children }) => {
  const [tocItems, setTocItems] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Extract headings for TOC
    const headings = contentRef.current.querySelectorAll('h2, h3')
    const items = Array.from(headings).map((heading) => {
      // Generate ID if it doesn't exist
      if (!heading.id) {
        heading.id =
          heading.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || ''
      }

      return {
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      }
    })

    setTocItems(items)
  }, [children])

  return (
    <Layout>
      <div className="doc-layout">
        <button
          className="mobile-toc-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle table of contents"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>

        <aside className={`doc-toc ${isSidebarOpen ? 'open' : ''}`}>
          <TableOfContents items={tocItems} />
        </aside>

        {isSidebarOpen && (
          <div
            className="toc-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="doc-content" ref={contentRef}>
          {children}
        </div>
      </div>
    </Layout>
  )
}

export default DocLayout
