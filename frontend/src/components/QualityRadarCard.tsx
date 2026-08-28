'use client'

import React from 'react'
import { QualityScore } from '@/types'
import { Award, CheckCircle, Gauge, BookOpen, Target, Sliders } from 'lucide-react'

interface QualityRadarCardProps {
  qualityScore?: QualityScore
}

export default function QualityRadarCard({ qualityScore }: QualityRadarCardProps) {
  if (!qualityScore) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-xs text-slate-500 shadow-xs">
        Quality metrics pending evaluation.
      </div>
    )
  }

  const metrics = [
    { label: 'Source Accuracy (40%)', value: qualityScore.source_accuracy, icon: CheckCircle, color: 'text-emerald-600', bar: 'bg-emerald-500' },
    { label: 'Completeness (20%)', value: qualityScore.completeness, icon: Award, color: 'text-sky-600', bar: 'bg-sky-500' },
    { label: 'Audience Fit (15%)', value: qualityScore.audience_fit, icon: Target, color: 'text-indigo-600', bar: 'bg-indigo-500' },
    { label: 'Readability (10%)', value: qualityScore.readability, icon: BookOpen, color: 'text-cyan-600', bar: 'bg-cyan-500' },
    { label: 'Tone Consistency (10%)', value: qualityScore.tone_consistency, icon: Sliders, color: 'text-purple-600', bar: 'bg-purple-500' },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
      {/* Overall Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-sky-600" />
          <h4 className="text-sm font-bold text-slate-900">AI Quality & Fidelity Score</h4>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-sky-700 font-mono">
            {qualityScore.overall_score.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500 font-bold">Overall</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
        Composite heuristic index weighting source grounding, structural completeness, and readability.
      </p>

      {/* Metric Bars */}
      <div className="space-y-3 pt-1">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                  {m.label}
                </span>
                <span className="font-mono font-bold text-slate-900">{m.value.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.bar} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
