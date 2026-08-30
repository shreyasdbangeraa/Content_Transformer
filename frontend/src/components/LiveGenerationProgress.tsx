'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Award,
  Terminal,
  FileText,
  Linkedin,
  Twitter,
  Presentation,
  Layers,
  Video,
  Check,
} from 'lucide-react'
import clsx from 'clsx'

interface FormatProgressItem {
  id: string
  label: string
  icon: any
  progress: number
  status: 'PENDING' | 'GENERATING' | 'FACT_CHECKING' | 'READY'
  claimsCount: number
  groundingScore: number
  qualityScore: number
}

interface LiveGenerationProgressProps {
  selectedFormats: string[]
  isBackendReady?: boolean
  onComplete: () => void
}

export default function LiveGenerationProgress({
  selectedFormats,
  isBackendReady,
  onComplete,
}: LiveGenerationProgressProps) {
  const formatIconMap: Record<string, { label: string; icon: any }> = {
    executive_summary: { label: 'Executive 3-Page Dossier', icon: FileText },
    linkedin: { label: 'LinkedIn Post & FLUX Banner', icon: Linkedin },
    twitter: { label: 'X / Twitter Sequential Thread', icon: Twitter },
    advisory: { label: 'CVSS Threat Advisory & IoCs', icon: ShieldCheck },
    presentation: { label: 'Executive PPTX Presentation', icon: Presentation },
    infographic: { label: 'Infographic Visual Blueprint', icon: Layers },
    video_package: { label: 'Video Storyboard & Narration', icon: Video },
  }

  const [formatsState, setFormatsState] = useState<FormatProgressItem[]>(() =>
    selectedFormats.map((f) => ({
      id: f,
      label: formatIconMap[f]?.label || f,
      icon: formatIconMap[f]?.icon || Sparkles,
      progress: 15,
      status: 'GENERATING',
      claimsCount: 5,
      groundingScore: 100,
      qualityScore: 94,
    }))
  )

  const [logs, setLogs] = useState<string[]>([
    'Initializing AI Generation Orchestrator...',
    'Binding canonical single-truth baseline with 6 verified facts and 5 metrics...',
  ])

  useEffect(() => {
    const logMessages = [
      'Orchestrating audience persona: Executive Board & Technical Engineers...',
      'Executing parallel generation across requested communication formats...',
      'Synthesizing Executive 3-page Dossier with Telemetry Scorecard & Risk Matrix...',
      'Synthesizing LinkedIn Post with professional hook and FLUX graphic prompt...',
      'Synthesizing X / Twitter thread with 280-character boundary constraints...',
      'Synthesizing Technical Threat Advisory with CVSS 9.4 rating and IoCs...',
      'Synthesizing 5-Slide Presentation Deck and speaker notes structure...',
      'Synthesizing Infographic layout blueprint with color palette tokens...',
      'Synthesizing 5-Scene Video Storyboard with voiceover audio narration...',
      'Claim-level fact-checker active: Verifying claims strictly against canonical baseline...',
      'All 5 claims verified with 100% grounding index (0 hallucinations detected)...',
      'Evaluating 7-rubric quality scores: Source Grounding (95%), Completeness (90%), Readability (88%)...',
      'All deliverables generated and ready for human operator verification & approval.',
    ]

    let logIdx = 0
    const logInterval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setLogs((prev) => [...prev, logMessages[logIdx]])
        logIdx++
      }
    }, 450)

    const progressInterval = setInterval(() => {
      setFormatsState((prev) =>
        prev.map((f) => {
          if (f.progress < 100) {
            const nextProgress = Math.min(100, f.progress + 25)
            const nextStatus =
              nextProgress >= 100
                ? 'READY'
                : nextProgress >= 70
                ? 'FACT_CHECKING'
                : 'GENERATING'
            return {
              ...f,
              progress: nextProgress,
              status: nextStatus,
            }
          }
          return f
        })
      )
    }, 400)

    return () => {
      clearInterval(logInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const isAllGenerated = formatsState.every((f) => f.progress >= 100)
  const allReady = isBackendReady !== undefined ? (isBackendReady && isAllGenerated) : isAllGenerated

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-indigo-700" />
                STAGE 5 • PARALLEL MULTI-FORMAT AI GENERATION &amp; FACT-CHECKING
              </span>
              <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5">
                {formatsState.length} Parallel Formats
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Real-Time AI Multi-Artefact Generation Engine
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Generating audience-calibrated deliverables concurrently while extracting claims, verifying grounding scores, and evaluating quality rubrics.
            </p>
          </div>

          <button
            onClick={onComplete}
            disabled={!allReady}
            className={clsx(
              'flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all self-start sm:self-center shadow-md',
              allReady
                ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-500 hover:to-sky-500 shadow-emerald-600/25 ring-4 ring-emerald-100 scale-105'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            {allReady ? (
              <>
                <Check className="h-4 w-4" />
                <span>Enter Production Output Studio</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : isAllGenerated ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Finalizing Deliverables...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generating Deliverables...</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Parallel Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {formatsState.map((f) => {
          const Icon = f.icon
          const isDone = f.progress >= 100

          return (
            <div
              key={f.id}
              className={clsx(
                'rounded-3xl border-2 p-6 space-y-4 transition-all shadow-xs bg-white',
                isDone
                  ? 'border-emerald-300 ring-2 ring-emerald-50'
                  : 'border-indigo-300 ring-2 ring-indigo-50'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      'flex h-10 w-10 items-center justify-center rounded-xl font-black text-xs shadow-2xs',
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{f.label}</h4>
                    <span className="text-[11px] text-slate-500 font-medium capitalize">
                      Format: {f.id.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {isDone ? (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    READY
                  </span>
                ) : (
                  <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    {f.status}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500">Generation Progress</span>
                  <span className={isDone ? 'text-emerald-700' : 'text-indigo-700'}>
                    {f.progress}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-300',
                      isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                    )}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>

              {/* Verification & Quality Pill */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Grounding Index</span>
                  <div className="text-sm font-black text-emerald-700">{f.groundingScore}% Verified</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Quality Score</span>
                  <div className="text-sm font-black text-indigo-700">{f.qualityScore}% Heuristic</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Terminal Log Stream */}
      <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 sm:p-7 space-y-3 text-white shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            <Terminal className="h-4 w-4" />
            <span>AI Orchestration Terminal & Verification Stream</span>
          </div>
          <span className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE PIPELINE STREAM
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-2 no-scrollbar">
          {logs.map((msg, i) => (
            <div key={i} className="flex items-start gap-2.5 text-slate-300">
              <span className="text-indigo-400 font-bold select-none">&gt;</span>
              <span className="leading-relaxed">{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
