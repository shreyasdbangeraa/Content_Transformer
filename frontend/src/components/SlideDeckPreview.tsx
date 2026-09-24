'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react'
import { api } from '@/lib/api'
import FormattedText from '@/components/FormattedText'

interface SlideDeckPreviewProps {
  outputId: string
  deckData: any
}

// Semantic category classifier for slides
function getCategoryTag(title: string, idx: number, total: number): string {
  if (idx === 0) return 'STRATEGIC BRIEFING • SOURCE-GROUNDED'
  if (idx === total - 1 && total >= 3) return 'STRATEGIC CONCLUSION & NEXT STEPS'

  const tLower = (title || '').toLowerCase()
  if (['problem', 'challenge', 'gap', 'incident', 'threat', 'pain'].some(k => tLower.includes(k))) {
    return 'PROBLEM ANALYSIS & NEED'
  }
  if (['solution', 'approach', 'initiative', 'mechanism', 'strategy', 'architecture'].some(k => tLower.includes(k))) {
    return 'STRATEGIC SOLUTION & METHODOLOGY'
  }
  if (['roadmap', 'timeline', 'episode', 'phase', 'schedule', 'track'].some(k => tLower.includes(k))) {
    return 'EXECUTION ROADMAP & TRACKS'
  }
  if (['outcome', 'impact', 'result', 'metric', 'benefit', 'deliverable'].some(k => tLower.includes(k))) {
    return 'EXPECTED OUTCOMES & VALUE'
  }
  if (['support', 'resource', 'budget', 'need', 'requirement', 'ask'].some(k => tLower.includes(k))) {
    return 'RESOURCE ALLOCATION & SUPPORT'
  }
  if (['takeaway', 'conclusion', 'summary', 'closing', 'next step'].some(k => tLower.includes(k))) {
    return 'STRATEGIC CONCLUSION & NEXT STEPS'
  }
  return `SECTION 0${idx + 1} // STRATEGIC BRIEF`
}

// Extracts bold or colon-separated lead-in from bullet points
function parseBulletLead(bulletText: string) {
  const bullet = (bulletText || '').replace(/^[•\-\*]\s*/, '').trim()
  if (bullet.startsWith('**') && bullet.includes('**:')) {
    const idx = bullet.indexOf('**:')
    const lead = bullet.substring(2, idx).trim()
    const body = bullet.substring(idx + 3).trim()
    return { lead, body }
  } else if (bullet.includes(':')) {
    const parts = bullet.split(':')
    const candidate = parts[0].trim().replace(/\*/g, '')
    if (candidate.length >= 3 && candidate.length <= 45 && !candidate.includes('\n')) {
      return { lead: candidate, body: parts.slice(1).join(':').trim() }
    }
  }
  return { lead: null, body: bullet }
}

export default function SlideDeckPreview({ outputId, deckData }: SlideDeckPreviewProps) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const slides = deckData?.slides || []
  const deckTitle = deckData?.deck_title || 'Executive Strategic Presentation'

  const handlePrev = useCallback(() => {
    setCurrentSlideIdx(prev => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentSlideIdx(prev => Math.min(slides.length - 1, prev + 1))
  }, [slides.length])

  // Keyboard navigation for presentation deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, isFullscreen])

  if (!slides.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-xs">
        No slide deck structure found.
      </div>
    )
  }

  const curSlide = slides[currentSlideIdx] || slides[0]
  const totalSlides = slides.length
  const isCoverSlide = currentSlideIdx === 0
  const isClosingSlide = currentSlideIdx === totalSlides - 1 && totalSlides >= 3
  const isDarkTheme = isCoverSlide || isClosingSlide
  const categoryTag = getCategoryTag(curSlide.title, currentSlideIdx, totalSlides)

  const handleCopySlide = () => {
    const textToCopy = `SLIDE 0${currentSlideIdx + 1}: ${curSlide.title}\n${curSlide.subtitle ? curSlide.subtitle + '\n' : ''}\n${(curSlide.bullets || []).map((b: string) => `• ${b}`).join('\n')}\n\nNotes: ${curSlide.speaker_notes || 'None'}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Slide Canvas Renderer
  const renderSlideContent = (fullscreenMode = false) => {
    return (
      <div
        className={`w-full aspect-[16/9] rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden select-none ${
          isDarkTheme
            ? 'bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] border-slate-800 text-white shadow-2xl'
            : 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
        } ${fullscreenMode ? 'max-h-[85vh] p-8 sm:p-14' : 'p-6 sm:p-10'}`}
      >
        {/* Top Accent Gradient Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isDarkTheme
              ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500'
              : 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600'
          }`}
        />

        {/* Ambient Decorative Glow on Dark Slides */}
        {isDarkTheme && (
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Header Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            {/* Category Pill Tag */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase ${
                isDarkTheme
                  ? 'bg-sky-950/70 border border-sky-500/40 text-sky-400'
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isDarkTheme ? 'bg-sky-400 animate-pulse' : 'bg-blue-600'}`} />
              <span>{categoryTag}</span>
            </div>

            {/* Top Right Enterprise Stamp */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
              <span>conteX AI • Grounded Deck</span>
            </div>
          </div>

          {/* Slide Title */}
          <h3
            className={`font-extrabold tracking-tight leading-tight ${
              isCoverSlide
                ? 'text-2xl sm:text-3xl md:text-4xl text-white'
                : isDarkTheme
                ? 'text-2xl sm:text-3xl text-white'
                : 'text-2xl sm:text-3xl text-slate-900'
            }`}
          >
            <FormattedText text={curSlide.title} />
          </h3>

          {/* Subtitle */}
          {curSlide.subtitle && (
            <p
              className={`mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-medium ${
                isDarkTheme ? 'text-sky-300/90' : 'text-slate-500'
              }`}
            >
              <FormattedText text={curSlide.subtitle} />
            </p>
          )}

          {/* Divider on Light Slides */}
          {!isDarkTheme && <div className="border-b border-slate-100 my-3" />}
        </div>

        {/* Content Body: Dynamic Layout Cards */}
        <div className="my-auto py-2">
          {isCoverSlide ? (
            // Slide 1: Executive Objectives / Focus Cards
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {(curSlide.bullets || []).slice(0, 3).map((b: string, idx: number) => {
                const { lead, body } = parseBulletLead(b)
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 sm:p-4 backdrop-blur-xs hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="text-[10px] font-mono font-bold text-sky-400 mb-1.5 uppercase tracking-wider">
                      OBJECTIVE 0{idx + 1}
                    </div>
                    {lead ? (
                      <div>
                        <h5 className="font-bold text-white text-xs sm:text-sm mb-1">{lead}</h5>
                        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-medium">{body}</p>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold">
                        <FormattedText text={b} />
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : isClosingSlide ? (
            // Closing Slide: Action Plan / Timeline Cards
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {(curSlide.bullets || []).slice(0, 3).map((b: string, idx: number) => {
                const { lead, body } = parseBulletLead(b)
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 hover:border-sky-500/40 transition-all"
                  >
                    <div className="text-[10px] font-mono font-bold text-sky-400 mb-1.5 uppercase tracking-wider">
                      ACTION ITEM 0{idx + 1}
                    </div>
                    {lead ? (
                      <div>
                        <h5 className="font-bold text-white text-sm sm:text-base mb-1">{lead}</h5>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{body}</p>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-white leading-relaxed font-semibold">
                        <FormattedText text={b} />
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : curSlide.bullets?.length === 4 ? (
            // Content Slide with 4 points: 2x2 Grid of Executive Cards
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {curSlide.bullets.map((b: string, idx: number) => {
                const { lead, body } = parseBulletLead(b)
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-50/90 border border-slate-200/90 p-3.5 sm:p-4 relative overflow-hidden flex items-start gap-3 hover:bg-slate-100/80 transition-all shadow-2xs"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-sky-500" />
                    <div className="h-6 w-6 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      {lead ? (
                        <>
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{lead}</h5>
                          <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{body}</p>
                        </>
                      ) : (
                        <div className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                          <FormattedText text={b} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Content Slide with 1-3 points: Stacked Luxury Cards
            <div className="space-y-2.5 sm:space-y-3">
              {(curSlide.bullets || []).map((b: string, idx: number) => {
                const { lead, body } = parseBulletLead(b)
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-50/90 border border-slate-200/90 p-3 sm:p-4 relative overflow-hidden flex items-start gap-3.5 hover:bg-slate-100/80 transition-all shadow-2xs"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-sky-500" />
                    <div className="h-7 w-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      0{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      {lead ? (
                        <div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{lead}</span>
                          <span className="text-slate-400 mx-2">—</span>
                          <span className="text-xs sm:text-sm text-slate-600 font-medium">{body}</span>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                          <FormattedText text={b} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div
          className={`flex items-center justify-between pt-3 border-t text-[10px] sm:text-xs font-semibold tracking-wider uppercase ${
            isDarkTheme ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>conteX AI Executive Deck</span>
            <span>•</span>
            <span>CONFIDENTIAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={isDarkTheme ? 'text-sky-400 font-bold' : 'text-blue-600 font-bold'}>
              SLIDE 0{currentSlideIdx + 1} / 0{totalSlides}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4">
      {/* Top Header & Actions Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs">
            <Presentation className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                {deckTitle}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                16:9 HD
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Slide {currentSlideIdx + 1} of {totalSlides} • {categoryTag}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Copy Slide Text Button */}
          <button
            onClick={handleCopySlide}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Copy current slide text"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Present Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* Download PPTX Button */}
          <a
            href={api.getExportUrl(outputId, 'pptx')}
            download
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:from-sky-600 hover:to-blue-700 transition-all shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download .PPTX</span>
          </a>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="px-4 sm:px-6">{renderSlideContent(false)}</div>

      {/* Slide Thumbnails Quick Navigation Carousel */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {slides.map((s: any, idx: number) => {
            const isActive = idx === currentSlideIdx
            const isThumbDark = idx === 0 || (idx === totalSlides - 1 && totalSlides >= 3)
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlideIdx(idx)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border shrink-0 ${
                  isActive
                    ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-400/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div
                  className={`h-5 w-6 rounded text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                    isThumbDark ? 'bg-slate-900 text-sky-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  0{idx + 1}
                </div>
                <div className="max-w-[120px] truncate text-xs font-semibold">
                  {s.title || `Slide ${idx + 1}`}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Speaker Notes Toggle & Card */}
      {curSlide.speaker_notes && (
        <div className="mx-4 sm:mx-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 overflow-hidden">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-sky-600" />
                <span>Presenter Script & Speaker Notes</span>
              </div>
              <span className="text-[11px] text-sky-600 font-semibold">
                {showNotes ? 'Hide Notes' : 'Show Notes'}
              </span>
            </button>
            {showNotes && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-200/60">
                <p className="text-slate-700 leading-relaxed italic text-xs sm:text-sm font-medium">
                  &ldquo;<FormattedText text={curSlide.speaker_notes} />&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50/60">
        <button
          onClick={handlePrev}
          disabled={currentSlideIdx === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Slide</span>
        </button>

        {/* Slide Dots Indicator */}
        <div className="flex items-center gap-1.5">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlideIdx ? 'w-7 bg-sky-600 shadow-2xs' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIdx === slides.length - 1}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
        >
          <span>Next Slide</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Fullscreen Presentation Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          {/* Fullscreen Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Presentation className="h-5 w-5 text-sky-400" />
              <span className="font-bold text-sm sm:text-base">{deckTitle}</span>
              <span className="text-xs text-slate-400">
                ({currentSlideIdx + 1} / {totalSlides})
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Exit (ESC)</span>
            </button>
          </div>

          {/* Fullscreen Slide Container */}
          <div className="flex-1 flex items-center justify-center my-4 max-w-6xl mx-auto w-full">
            {renderSlideContent(true)}
          </div>

          {/* Fullscreen Controls Bottom Bar */}
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full pt-3 border-t border-white/10 text-white">
            <button
              onClick={handlePrev}
              disabled={currentSlideIdx === 0}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 px-4 py-2 text-xs font-bold transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous (←)</span>
            </button>

            <div className="flex gap-2">
              {slides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIdx(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentSlideIdx ? 'w-8 bg-sky-400' : 'w-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentSlideIdx === slides.length - 1}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 px-4 py-2 text-xs font-bold transition-colors"
            >
              <span>Next (→ / Space)</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
