'use client'

import React from 'react'
import { Layers, Sparkles, Download, ShieldCheck } from 'lucide-react'
import { Output } from '@/types'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'

interface InfographicCardProps {
  output: Output
}

export default function InfographicCard({ output }: InfographicCardProps) {
  const structured = output.structured_data || {}
  const imageUri = structured.image_url || structured.image_uri
  const statHighlights = structured.stat_highlights || []

  const handleDownload = () => {
    if (!imageUri) return
    const a = document.createElement('a')
    a.href = imageUri
    a.download = `infographic-${output.id.slice(0, 8)}.svg`
    a.click()
  }

  return (
    <div className="space-y-8">
      {/* Generated Infographic Visual Banner */}
      {imageUri && (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-sky-600" />
              <span className="text-sm font-bold text-slate-800">
                Synthesized Infographic Visual Asset
              </span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-sky-500 transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download Visual</span>
            </button>
          </div>
          <div className="p-6 sm:p-8 bg-slate-900 flex items-center justify-center">
            <img
              src={imageUri}
              alt="Infographic Visual Asset"
              className="w-full h-auto max-h-[520px] object-contain rounded-2xl shadow-xl"
            />
          </div>
        </div>
      )}

      {/* Markdown Layout Plan */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Infographic Layout & Visual Elements Plan
        </h4>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <StructuredContentRenderer content={output.raw_content} />
        </div>
      </div>
    </div>
  )
}
