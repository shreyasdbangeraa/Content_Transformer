'use client'

import React, { useState } from 'react'
import { Presentation, ChevronLeft, ChevronRight, Download, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api'

interface SlideDeckPreviewProps {
  outputId: string
  deckData: any
}

export default function SlideDeckPreview({ outputId, deckData }: SlideDeckPreviewProps) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)
  const slides = deckData?.slides || []

  if (!slides.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 shadow-xs">
        No slide deck structure found.
      </div>
    )
  }

  const curSlide = slides[currentSlideIdx] || slides[0]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <Presentation className="h-5 w-5 text-sky-600" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {deckData.deck_title || 'Executive Presentation Deck'}
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Slide {currentSlideIdx + 1} of {slides.length} • 16:9 Widescreen Layout
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getExportUrl(outputId, 'pptx')}
            download
            className="flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .PPTX</span>
          </a>
        </div>
      </div>

      {/* 16:9 Slide Canvas */}
      <div className="px-5">
        <div className="aspect-[16/9] w-full rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
          {/* Decorative Corner Accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-sky-100/60 rounded-bl-full pointer-events-none blur-xl" />

          {/* Slide Title */}
          <div>
            <span className="text-[11px] font-mono font-bold text-sky-700 uppercase tracking-widest block mb-1">
              SLIDE 0{curSlide.slide_number || currentSlideIdx + 1}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {curSlide.title}
            </h3>
            {curSlide.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">
                {curSlide.subtitle}
              </p>
            )}
          </div>

          {/* Slide Bullets */}
          <div className="my-auto space-y-3">
            {curSlide.bullets?.map((b: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-sky-600 mt-2 shrink-0 shadow-xs" />
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                  {b}
                </p>
              </div>
            ))}
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>AI Content Transformer • Executive Briefing</span>
            <span>CONFIDENTIAL / SOURCE-GROUNDED</span>
          </div>
        </div>
      </div>

      {/* Speaker Notes */}
      {curSlide.speaker_notes && (
        <div className="mx-5 p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-600 mb-1">
            <MessageSquare className="h-3.5 w-3.5 text-sky-600" />
            <span>Speaker Notes:</span>
          </div>
          <p className="text-slate-700 leading-relaxed italic text-[11px] font-medium">
            &ldquo;{curSlide.speaker_notes}&rdquo;
          </p>
        </div>
      )}

      {/* Slide Navigation Controls */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIdx === 0}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Slide</span>
        </button>

        <div className="flex gap-1.5">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlideIdx ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIdx === slides.length - 1}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
        >
          <span>Next Slide</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
