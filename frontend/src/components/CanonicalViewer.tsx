'use client'

import React, { useState } from 'react'
import {
  CanonicalAnalysis,
} from '@/types'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import {
  CheckCircle2,
  FileText,
  ShieldAlert,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Tag,
} from 'lucide-react'
import clsx from 'clsx'

interface CanonicalViewerProps {
  canonical: CanonicalAnalysis
}

export default function CanonicalViewer({ canonical }: CanonicalViewerProps) {
  const [activeTab, setActiveTab] = useState<'facts' | 'entities' | 'stats' | 'risks' | 'recs' | 'summary'>('facts')

  const tabs = [
    { id: 'facts', label: `Key Facts (${canonical.key_facts?.length || 0})`, icon: CheckCircle2 },
    { id: 'stats', label: `Metrics & Telemetry (${canonical.statistics?.length || 0})`, icon: BarChart3 },
    { id: 'recs', label: `Recommendations (${canonical.recommendations?.length || 0})`, icon: Lightbulb },
    { id: 'risks', label: `Risks (${canonical.risks?.length || 0})`, icon: AlertTriangle },
    { id: 'entities', label: `Entities (${canonical.entities?.length || 0})`, icon: Tag },
    { id: 'summary', label: 'Executive Summary', icon: FileText },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800 border border-sky-200">
              CANONICAL KNOWLEDGE REPRESENTATION
            </span>
            <span className="text-xs text-slate-500">
              Lang: <strong className="text-slate-800">{canonical.detected_language || 'English'}</strong>
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            {canonical.title || canonical.topic}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Document Type: <span className="text-slate-800 font-semibold">{canonical.document_type}</span> • Structured facts ready for multi-format transformation
          </p>
        </div>

        {/* Sensitivity badge */}
        {canonical.sensitivity?.detected_count > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>{canonical.sensitivity.detected_count}</strong> sensitive item(s) scanned
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-5 max-h-96 overflow-y-auto">
        {/* KEY FACTS */}
        {activeTab === 'facts' && (
          <div className="space-y-3">
            {canonical.key_facts?.map((fact, idx) => (
              <div
                key={fact.fact_id || idx}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 hover:border-sky-300 hover:bg-white transition-all shadow-2xs"
              >
                <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="text-slate-800 leading-relaxed font-semibold">{fact.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-semibold">
                      Page {fact.source?.page || 1} • {fact.source?.section || 'General'}
                    </span>
                    <span>Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* METRICS & STATISTICS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {canonical.statistics?.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-1 hover:border-sky-300 hover:bg-white transition-all shadow-2xs"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {stat.metric}
                </span>
                <div className="text-xl font-black text-sky-700 tracking-tight">{stat.value}</div>
                {stat.context && <p className="text-xs text-slate-600">{stat.context}</p>}
                {stat.source_citation && (
                  <span className="inline-block text-[10px] text-slate-400 mt-1">
                    Citation: {stat.source_citation}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {activeTab === 'recs' && (
          <div className="space-y-3">
            {canonical.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 flex items-start gap-3 hover:bg-white transition-all"
              >
                <div className="rounded-lg bg-sky-100 text-sky-800 text-xs font-bold px-2 py-1 shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rec.recommendation}</span>
                    <span
                      className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase',
                        rec.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      )}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  {rec.details && <p className="text-slate-600 mt-1">{rec.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RISKS */}
        {activeTab === 'risks' && (
          <div className="space-y-3">
            {canonical.risks?.map((risk, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 flex items-start gap-3"
              >
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{risk.risk}</span>
                    <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                      {risk.severity}
                    </span>
                  </div>
                  {risk.impact && <p className="text-slate-600 mt-1">{risk.impact}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ENTITIES */}
        {activeTab === 'entities' && (
          <div className="flex flex-wrap gap-2">
            {canonical.entities?.map((ent, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs flex items-center gap-2"
              >
                <Tag className="h-3 w-3 text-sky-600" />
                <span className="font-bold text-slate-800">{ent.name}</span>
                <span className="text-[10px] rounded bg-white text-slate-500 px-1.5 py-0.5 font-mono border border-slate-200">
                  {ent.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* EXECUTIVE SUMMARY */}
        {activeTab === 'summary' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <StructuredContentRenderer content={canonical.executive_summary} />
          </div>
        )}
      </div>
    </div>
  )
}
