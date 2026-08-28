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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-xs">
        No slide deck structure found.
      </div>
    )
  }

  const curSlide = slides[currentSlideIdx] || slides[0]

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-5">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          <Presentation className="h-6 w-6 text-sky-600" />
          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              {deckData.deck_title || 'Executive Presentation Deck'}
            </h4>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Slide {currentSlideIdx + 1} of {slides.length} • 16:9 Widescreen Layout
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getExportUrl(outputId, 'pptx')}
            download
            className="flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-200 px-4 py-2 text-xs sm:text-sm font-bold text-sky-700 hover:bg-sky-100 transition-all shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download .PPTX</span>
          </a>
        </div>
      </div>

      {/* 16:9 Slide Canvas */}
      <div className="px-6">
        <div className="aspect-[16/9] w-full rounded-3xl border border-slate-300 bg-white p-8 sm:p-12 flex flex-col justify-between shadow-lg relative overflow-hidden">
          {/* Decorative Corner Accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-100/60 rounded-bl-full pointer-events-none blur-2xl" />

          {/* Slide Title */}
          <div>
            <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest block mb-1.5">
              SLIDE 0{curSlide.slide_number || currentSlideIdx + 1}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {curSlide.title}
            </h3>
            {curSlide.subtitle && (
              <p className="text-sm sm:text-base text-slate-600 mt-1.5 font-semibold">
                {curSlide.subtitle}
              </p>
            )}
          </div>

          {/* Slide Bullets */}
          <div className="my-auto space-y-4 py-4">
            {curSlide.bullets?.map((b: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="h-2.5 w-2.5 rounded-full bg-sky-600 mt-2 shrink-0 shadow-xs" />
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">
                  {b}
                </p>
              </div>
            ))}
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>AI Content Transformer • Executive Briefing</span>
            <span>CONFIDENTIAL / SOURCE-GROUNDED</span>
          </div>
        </div>
      </div>

      {/* Speaker Notes */}
      {curSlide.speaker_notes && (
        <div className="mx-6 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <MessageSquare className="h-4 w-4 text-sky-600" />
            <span>Speaker Notes:</span>
          </div>
          <p className="text-slate-700 leading-relaxed italic text-xs sm:text-sm font-medium">
            &ldquo;{curSlide.speaker_notes}&rdquo;
          </p>
        </div>
      )}

      {/* Slide Navigation Controls */}
      <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50/60">
        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIdx === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Slide</span>
        </button>

        <div className="flex gap-2">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlideIdx ? 'w-8 bg-sky-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIdx === slides.length - 1}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-xs"
        >
          <span>Next Slide</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
