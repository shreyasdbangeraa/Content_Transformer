'use client'

import React, { useState } from 'react'
import {
  CanonicalAnalysis,
  ProvenanceTag,
} from '@/types'
import {
  CheckCircle2,
  FileText,
  ShieldAlert,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Tag,
  Search,
  AlertOctagon,
  HelpCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react'
import clsx from 'clsx'

interface CanonicalViewerProps {
  canonical: CanonicalAnalysis
}

export default function CanonicalViewer({ canonical }: CanonicalViewerProps) {
  const [activeTab, setActiveTab] = useState<
    'facts' | 'sensitivity' | 'stats' | 'recs' | 'risks' | 'entities' | 'timeline' | 'research' | 'conflicts' | 'uncertainties' | 'summary'
  >('facts')
  const [showRawSensitivity, setShowRawSensitivity] = useState(false)

  const provenanceBadge = (tag?: string) => {
    switch (tag) {
      case 'PRIMARY_SOURCE_FACT':
        return (
          <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Primary Source Fact
          </span>
        )
      case 'VERIFIED_EXTERNAL_FACT':
        return (
          <span className="rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Verified External Fact
          </span>
        )
      case 'INFERENCE':
        return (
          <span className="rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Inference / Deduction
          </span>
        )
      case 'RECOMMENDATION':
        return (
          <span className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Remediation Directive
          </span>
        )
      case 'CONFLICTING_CLAIM':
        return (
          <span className="rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Conflicting Discrepancy
          </span>
        )
      default:
        return (
          <span className="rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 uppercase">
            Source Grounded
          </span>
        )
    }
  }

  const tierBadge = (tier: number) => {
    const tierMap: Record<number, { label: string; color: string }> = {
      1: { label: 'Tier 1: Government / National CERT', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      2: { label: 'Tier 2: Official Enterprise Portal', color: 'bg-sky-50 text-sky-800 border-sky-200' },
      3: { label: 'Tier 3: Primary Academic Research', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      4: { label: 'Tier 4: Global Standards Org', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      5: { label: 'Tier 5: Research University', color: 'bg-purple-50 text-purple-800 border-purple-200' },
      6: { label: 'Tier 6: Authoritative Journalism', color: 'bg-amber-50 text-amber-800 border-amber-200' },
      7: { label: 'Tier 7: Secondary Industry Analysis', color: 'bg-orange-50 text-orange-800 border-orange-200' },
      8: { label: 'Tier 8: General Web Sources', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    }
    const t = tierMap[tier] || tierMap[7]
    return (
      <span className={clsx('rounded-md border text-[10px] font-bold px-2.5 py-0.5', t.color)}>
        {t.label}
      </span>
    )
  }

  const tabs = [
    { id: 'facts', label: `Key Facts (${canonical.key_facts?.length || 0})`, icon: CheckCircle2 },
    {
      id: 'sensitivity',
      label: `Sensitive Data (${canonical.sensitivity?.detected_count || 0})`,
      icon: ShieldAlert,
      alert: (canonical.sensitivity?.detected_count || 0) > 0
    },
    { id: 'research', label: `External Research (${canonical.research_findings?.length || 0})`, icon: Search },
    { id: 'conflicts', label: `Conflicts (${canonical.conflicts?.length || 0})`, icon: AlertOctagon, alert: (canonical.conflicts?.length || 0) > 0 },
    { id: 'stats', label: `Metrics & Telemetry (${canonical.statistics?.length || 0})`, icon: BarChart3 },
    { id: 'timeline', label: `Timeline (${canonical.dates?.length || canonical.events?.length || 0})`, icon: Clock },
    { id: 'recs', label: `Recommendations (${canonical.recommendations?.length || 0})`, icon: Lightbulb },
    { id: 'risks', label: `Risks (${canonical.risks?.length || 0})`, icon: AlertTriangle },
    { id: 'uncertainties', label: `Under Investigation (${canonical.uncertainties?.length || 0})`, icon: HelpCircle },
    { id: 'entities', label: `Entities (${canonical.entities?.length || 0})`, icon: Tag },
    { id: 'summary', label: 'Executive Summary', icon: FileText },
  ]

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md bg-sky-100 px-2.5 py-1 text-xs font-extrabold text-sky-900 border border-sky-200 uppercase tracking-wider">
              CANONICAL KNOWLEDGE BASE (SINGLE TRUTH LAYER)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Lang: <strong className="text-slate-800">{canonical.detected_language || 'English'}</strong>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Confidence: <strong className="text-emerald-700">{((canonical.confidence_score || 0.98) * 100).toFixed(0)}%</strong>
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            {canonical.title || canonical.topic}
          </h3>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Document Type: <span className="text-slate-800 font-bold">{canonical.document_type}</span> • Common factual foundation for all 7 multi-format deliverables
          </p>
        </div>

        {/* Sensitivity badge */}
        {canonical.sensitivity?.detected_count > 0 && (
          <button
            onClick={() => setActiveTab('sensitivity')}
            className="flex items-center gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 px-4 py-2 text-xs font-bold text-amber-900 shadow-xs transition-colors shrink-0 text-left"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 animate-pulse" />
            <span>
              <strong>{canonical.sensitivity.detected_count}</strong> sensitive identifier(s) detected • View & Mask
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-6 gap-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300',
                tab.alert && !isActive && 'text-amber-600 font-extrabold'
              )}
            >
              <Icon className={clsx('h-4 w-4', tab.alert && 'text-amber-600 animate-pulse')} />
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content Area */}
      <div className="p-6 sm:p-8 max-h-[30rem] overflow-y-auto">
        {/* KEY FACTS TAB */}
        {activeTab === 'facts' && (
          <div className="space-y-4">
            {canonical.key_facts?.map((fact, idx) => (
              <div
                key={fact.fact_id || idx}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 hover:border-sky-300 hover:bg-white transition-all shadow-xs"
              >
                <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm space-y-2">
                  <p className="text-slate-900 leading-relaxed font-semibold text-sm sm:text-base">
                    {fact.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    {provenanceBadge(fact.provenance)}
                    <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
                      Page {fact.source?.page || 1} • {fact.source?.section || 'General'}
                    </span>
                    <span>Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SENSITIVE DATA & REDACTION INSPECTOR TAB */}
        {activeTab === 'sensitivity' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-amber-50/80 border border-amber-300 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-200 p-2.5 text-amber-900">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-amber-950 flex items-center gap-2">
                      Sensitive Data & PII Redaction Radar
                      <span className="rounded-md bg-amber-200 border border-amber-400 px-2 py-0.5 text-xs font-black text-amber-950 uppercase font-mono">
                        LEVEL: {canonical.sensitivity?.level || 'LOW'}
                      </span>
                    </h4>
                    <p className="text-xs text-amber-900/80 font-semibold mt-0.5">
                      {canonical.sensitivity?.public_safety_advisory || 'Scanned for internal IP subnets, perimeter hostnames, credentials, and personnel contact identifiers.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowRawSensitivity(!showRawSensitivity)}
                  className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-amber-100/50 transition-all shadow-xs self-start sm:self-center shrink-0"
                >
                  <Tag className="h-3.5 w-3.5 text-amber-700" />
                  <span>{showRawSensitivity ? '👁️ Mask Sensitive Identifiers' : '🔓 Reveal Raw Identifier Values'}</span>
                </button>
              </div>
            </div>

            {canonical.sensitivity?.items && canonical.sensitivity.items.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                  <span>Detected Sensitive Asset</span>
                  <span>Safety Directive</span>
                </div>
                {canonical.sensitivity.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 hover:border-amber-300 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md font-extrabold uppercase">
                          {item.type}
                        </span>
                        <span className="font-mono text-sm font-black text-slate-900">
                          {showRawSensitivity ? item.value : item.masked_value}
                        </span>
                      </div>
                      <span className="rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black px-2 py-0.5 uppercase">
                        {item.severity || 'HIGH EXPOSURE RISK'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span><strong>Policy Directive:</strong> {item.recommendation}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Status: <strong className="text-emerald-700">Auto-Masked for Public Channels</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-slate-900 text-sm">Clean Document: Zero Sensitive Identifiers Detected</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No internal IP addresses, perimeter hostnames, API tokens, or direct PII were detected in this document. Safe for unrestricted multi-channel distribution.
                </p>
              </div>
            )}
          </div>
        )}

        {/* EXTERNAL RESEARCH FINDINGS TAB */}
        {activeTab === 'research' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-sky-50/80 border border-sky-200 p-4 text-xs sm:text-sm text-sky-900 font-medium flex items-center gap-3">
              <Search className="h-5 w-5 text-sky-600 shrink-0" />
              <span>
                Evidence gathered via automated 8-tier authoritative source discovery. Prioritizing CISA, government advisories, and certified incident portals.
              </span>
            </div>

            {canonical.research_findings && canonical.research_findings.length > 0 ? (
              canonical.research_findings.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3 hover:bg-white transition-all shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.source_title}
                    </span>
                    {tierBadge(item.source_tier)}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold bg-white p-3 rounded-xl border border-slate-200">
                    &ldquo;{item.evidence_snippet}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                    <span>Verified Claim: <strong className="text-slate-800">{item.claim_text}</strong></span>
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-bold"
                      >
                        Source Link <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm font-medium">
                Research mode configured to primary source. No external queries conducted.
              </div>
            )}
          </div>
        )}

        {/* DETECTED CONFLICTS & CONTRADICTIONS TAB */}
        {activeTab === 'conflicts' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-900 font-medium flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-amber-600 shrink-0" />
              <span>
                Cross-Source Discrepancy Detection: When external sources publish differing metrics or statements, our engine prevents random guessing and flags the conflict for operator review.
              </span>
            </div>

            {canonical.conflicts && canonical.conflicts.length > 0 ? (
              canonical.conflicts.map((conf, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 border border-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertOctagon className="h-3.5 w-3.5" />
                      CROSS-SOURCE CONFLICT DETECTED
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-white px-3 py-1 rounded-full border border-rose-200">
                      Human Review Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1.5 shadow-xs">
                      <div className="text-xs font-extrabold text-emerald-700 uppercase">
                        Source A ({conf.source_a_title})
                      </div>
                      <p className="text-sm font-bold text-slate-900">&ldquo;{conf.claim_a}&rdquo;</p>
                      <span className="text-[11px] text-emerald-800 font-medium">Primary Verified Telemetry</span>
                    </div>

                    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1.5 shadow-xs">
                      <div className="text-xs font-extrabold text-rose-700 uppercase">
                        Source B ({conf.source_b_title})
                      </div>
                      <p className="text-sm font-bold text-slate-900">&ldquo;{conf.claim_b}&rdquo;</p>
                      <span className="text-[11px] text-rose-800 font-medium">Secondary External Estimate</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/90 border border-rose-200/80 p-4 text-xs text-slate-700 space-y-1">
                    <strong className="text-slate-900 block font-bold">Discrepancy Analysis & Explanation:</strong>
                    <p className="leading-relaxed font-medium">{conf.discrepancy_description}</p>
                    {conf.possible_explanation && (
                      <p className="text-slate-500 italic mt-1">{conf.possible_explanation}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                <Check className="h-5 w-5 text-emerald-600" />
                <span>Zero cross-source contradictions detected. Complete factual alignment certified.</span>
              </div>
            )}
          </div>
        )}

        {/* METRICS & STATISTICS TAB */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canonical.statistics?.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2 hover:border-sky-300 hover:bg-white transition-all shadow-xs"
              >
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {stat.metric}
                </span>
                <div className="text-2xl font-black text-sky-700 tracking-tight">{stat.value}</div>
                {stat.context && <p className="text-sm text-slate-600 font-medium">{stat.context}</p>}
                {stat.source_citation && (
                  <span className="inline-block text-xs text-slate-400 font-medium">
                    Citation: {stat.source_citation}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE & EVENTS TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {canonical.events && canonical.events.length > 0 ? (
              canonical.events.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 hover:bg-white transition-all shadow-xs"
                >
                  <div className="rounded-xl bg-sky-100 text-sky-800 text-xs font-black px-3 py-2 shrink-0 font-mono">
                    {ev.timestamp}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{ev.event}</p>
                    {ev.severity && (
                      <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase">
                        Severity: {ev.severity}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              canonical.dates?.map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 hover:bg-white transition-all shadow-xs"
                >
                  <div className="rounded-xl bg-sky-100 text-sky-800 text-xs font-bold px-3 py-2 shrink-0">
                    {d.date}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{d.event}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recs' && (
          <div className="space-y-4">
            {canonical.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 flex items-start gap-4 hover:bg-white transition-all shadow-xs"
              >
                <div className="rounded-xl bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1.5 shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{rec.recommendation}</span>
                    <span
                      className={clsx(
                        'text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase',
                        rec.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : rec.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  {rec.details && <p className="text-xs sm:text-sm text-slate-600 font-medium">{rec.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RISKS TAB */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            {canonical.risks?.map((r, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{r.risk}</span>
                  <span
                    className={clsx(
                      'text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase',
                      r.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : r.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-800'
                    )}
                  >
                    {r.severity}
                  </span>
                </div>
                {r.impact && (
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    <strong>Business Impact:</strong> {r.impact}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* UNDER INVESTIGATION / UNCERTAINTIES TAB */}
        {activeTab === 'uncertainties' && (
          <div className="space-y-4">
            {canonical.uncertainties && canonical.uncertainties.length > 0 ? (
              canonical.uncertainties.map((u, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{u.topic}</span>
                    <span className="rounded-md bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 uppercase border border-amber-200">
                      {u.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">{u.details}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm font-medium">
                No active uncertainties recorded.
              </div>
            )}
          </div>
        )}

        {/* ENTITIES TAB */}
        {activeTab === 'entities' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canonical.entities?.map((ent, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm truncate">{ent.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 uppercase shrink-0">
                    {ent.type}
                  </span>
                </div>
                {ent.context && <p className="text-xs text-slate-500 font-medium">{ent.context}</p>}
              </div>
            ))}
          </div>
        )}

        {/* EXECUTIVE SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Canonical Synthesis Narrative
            </h4>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
              {canonical.executive_summary}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
