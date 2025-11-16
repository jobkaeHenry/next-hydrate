import React, { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

const CodeBlock = ({
  code,
  language = 'javascript',
  title,
  showLineNumbers = false
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="code-block-wrapper">
      {title && (
        <div className="code-block-header">
          <span className="code-block-title">{title}</span>
          <button
            onClick={handleCopy}
            className="copy-button"
            aria-label="Copy code to clipboard"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="copy-button copy-button-inline"
          aria-label="Copy code to clipboard"
        >
          {copied ? '✓' : 'Copy'}
        </button>
      )}
      <Highlight
        theme={themes.nightOwl}
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {showLineNumbers && (
                  <span className="line-number">{i + 1}</span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

export default CodeBlock
