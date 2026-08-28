'use client'

import React, { useState } from 'react'
import { Download, Copy, Check, FileText, Presentation, FileCode, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'

interface ExportDropdownProps {
  outputId: string
  content: string
  formatType: string
}

export default function ExportDropdown({ outputId, content, formatType }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportOptions = [
    { label: 'Download Word (.docx)', format: 'docx', icon: FileText, ext: 'DOCX' },
    { label: 'Download PowerPoint (.pptx)', format: 'pptx', icon: Presentation, ext: 'PPTX' },
    { label: 'Download Text (.txt)', format: 'txt', icon: FileText, ext: 'TXT' },
    { label: 'Download JSON Schema (.json)', format: 'json', icon: FileCode, ext: 'JSON' },
  ]

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          title="Copy formatted text to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Export Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-300 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 animate-fade-in space-y-0.5">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Export Formats
            </div>
            {exportOptions.map((opt) => {
              const Icon = opt.icon
              return (
                <a
                  key={opt.format}
                  href={api.getExportUrl(outputId, opt.format)}
                  download
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition-colors font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-sky-600" />
                    <span>{opt.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                    {opt.ext}
                  </span>
                </a>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
