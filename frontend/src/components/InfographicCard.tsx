'use client'

import React from 'react'
import { Layers, Download, Palette, BarChart2, ShieldCheck } from 'lucide-react'
import { Output } from '@/types'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'

interface InfographicCardProps {
  output: Output
}

export default function InfographicCard({ output }: InfographicCardProps) {
  const structured = output.structured_data || {}
  const imageUri = structured.image_url || structured.image_uri
  const datapoints = structured.datapoints || []
  const palette = structured.color_palette || ['#0F172A', '#0EA5E9', '#10B981', '#F8FAFC']

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
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-bold text-slate-800">
                Synthesized High-Resolution Visual Asset
              </span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download Visual Asset</span>
            </button>
          </div>
          <div className="p-6 sm:p-8 bg-slate-950 flex items-center justify-center">
            <img
              src={imageUri}
              alt="Infographic Visual Asset"
              className="w-full h-auto max-h-[520px] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Key Datapoints Grid */}
      {datapoints.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-indigo-600" />
            <span>Infographic Metric Callout Cards</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {datapoints.map((dp: any, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs hover:border-indigo-300 transition-all"
              >
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {dp.label}
                </span>
                <div className="text-2xl font-black text-indigo-700 tracking-tight">{dp.value}</div>
                <p className="text-xs text-slate-600 font-medium">{dp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette Spec */}
      {palette.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Palette className="h-4 w-4 text-slate-500" />
            <span>Harmonized Color Palette Tokens:</span>
          </div>
          <div className="flex items-center gap-3">
            {palette.map((color: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="h-5 w-5 rounded-md border border-slate-300 shadow-2xs inline-block"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-xs text-slate-600 font-bold">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Markdown Layout Plan */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Infographic Layout & Visual Hierarchy Blueprint
        </h4>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <StructuredContentRenderer content={output.raw_content} />
        </div>
      </div>
    </div>
  )
}
