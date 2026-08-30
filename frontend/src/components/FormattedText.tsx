'use client'

import React from 'react'

interface FormattedTextProps {
  text?: string | null
  className?: string
}

/**
 * Renders text with inline Markdown formatting (**bold**, *italic*, `code`)
 * as real styled JSX elements (<strong className="font-bold">, <em>, <code>)
 * without displaying unrendered raw '**' asterisks.
 */
export default function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null

  // Split by markdown bold (**...** or __...__), italic (*...* or _..._), and inline code (`...`)
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|(?<!\*)\*[^*]+\*(?!\*)|`.*?`)/g)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null

        // Bold (**text** or __text__)
        if (
          (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
          (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
        ) {
          const boldContent = part.slice(2, -2)
          return (
            <strong key={i} className="font-bold text-slate-900">
              {boldContent}
            </strong>
          )
        }

        // Italic (*text* or _text_)
        if (
          (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
          (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
        ) {
          const italicContent = part.slice(1, -1)
          return (
            <em key={i} className="italic text-slate-800 font-medium">
              {italicContent}
            </em>
          )
        }

        // Inline Code (`code`)
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          const codeContent = part.slice(1, -1)
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-sky-800 font-mono text-[12px] font-bold"
            >
              {codeContent}
            </code>
          )
        }

        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </span>
  )
}
