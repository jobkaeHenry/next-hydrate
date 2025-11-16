import React, { useState, useEffect } from 'react'

const TableOfContents = ({ items }) => {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -35% 0px',
      }
    )

    // Observe all headings
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [items])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <nav className="table-of-contents">
      <h3>On This Page</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className={`toc-level-${item.level} ${
              activeId === item.id ? 'active' : ''
            }`}
          >
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents
