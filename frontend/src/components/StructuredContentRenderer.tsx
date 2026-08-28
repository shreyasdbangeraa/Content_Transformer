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
        'prose prose-slate max-w-none text-[15px] sm:text-base leading-relaxed text-slate-800 font-sans',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-8 mb-4 pb-3 border-b-2 border-slate-200"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl sm:text-2xl font-bold text-slate-900 mt-7 mb-3.5 flex items-center gap-2.5"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-2.5" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-bold text-slate-700 tracking-wide mt-4 mb-2" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            return (
              <p className="my-3 text-slate-700 text-[15px] sm:text-base leading-relaxed font-normal" {...props}>
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
            <ul className="my-3.5 space-y-2 pl-5 list-disc marker:text-sky-600 marker:text-base" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-3.5 space-y-2 pl-5 list-decimal marker:font-bold marker:text-slate-700 marker:text-base" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-slate-700 text-[15px] sm:text-base leading-relaxed font-normal pl-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-4 rounded-r-2xl border-l-4 border-sky-600 bg-sky-50/80 p-4 text-[15px] sm:text-base text-slate-800 italic font-medium leading-relaxed shadow-xs"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className?.includes('language-')
            if (isInline) {
              return (
                <code
                  className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[13px] font-bold text-sky-800"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <pre className="my-4 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm font-mono text-slate-100 shadow-md">
                <code {...props}>{children}</code>
              </pre>
            )
          },
          table: ({ node, ...props }) => (
            <div className="my-5 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-slate-100/90 font-bold text-slate-900" {...props} />,
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left font-bold text-slate-800 uppercase tracking-wider text-xs" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-slate-700 border-t border-slate-100 text-[14px] leading-relaxed font-normal" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-slate-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
