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
    <div className="space-y-6">
      {/* Generated Infographic Visual Banner */}
      {imageUri && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-800">
                Synthesized Infographic Visual Asset
              </span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-sky-500 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Visual</span>
            </button>
          </div>
          <div className="p-4 bg-slate-900 flex items-center justify-center">
            <img
              src={imageUri}
              alt="Infographic Visual Asset"
              className="w-full h-auto max-h-[460px] object-contain rounded-xl shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Markdown Layout Plan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Infographic Layout & Statistics Plan
        </h4>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          <StructuredContentRenderer content={output.raw_content} />
        </div>
      </div>
    </div>
  )
}
