'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'

interface StructuredContentRendererProps {
  content: string
  className?: string
}

export default function StructuredContentRenderer({
  content,
  className,
}: StructuredContentRendererProps) {
  if (!content) return null

  return (
    <div
      className={clsx(
        'prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 font-sans',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-6 mb-3 pb-2 border-b border-slate-200"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-sm sm:text-base font-bold text-slate-900 mt-5 mb-2.5 flex items-center gap-2"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-4 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-3 mb-1.5" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            return (
              <p className="my-2.5 text-slate-700 leading-relaxed font-medium" {...props}>
                {children}
              </p>
            )
          },
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-700 font-medium" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-3 space-y-1.5 pl-4 list-disc marker:text-sky-600" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-3 space-y-1.5 pl-4 list-decimal marker:font-bold marker:text-slate-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-slate-700 leading-relaxed font-medium pl-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-3 rounded-r-xl border-l-4 border-sky-500 bg-sky-50/70 p-3.5 text-slate-800 italic font-medium"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className?.includes('language-')
            if (isInline) {
              return (
                <code
                  className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-sky-800"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <pre className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs font-mono text-slate-100">
                <code {...props}>{children}</code>
              </pre>
            )
          },
          table: ({ node, ...props }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-slate-50 font-bold text-slate-800" {...props} />,
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 text-left font-bold text-slate-700 uppercase tracking-wider text-[11px]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2 text-slate-700 border-t border-slate-100 font-medium" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-4 border-slate-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
