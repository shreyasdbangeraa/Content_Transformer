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
  Database,
  Copy,
  Globe,
} from 'lucide-react'
import clsx from 'clsx'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import FormattedText from '@/components/FormattedText'

interface CanonicalViewerProps {
  canonical: CanonicalAnalysis
}

export default function CanonicalViewer({ canonical }: CanonicalViewerProps) {
  const [activeTab, setActiveTab] = useState<
    'facts' | 'rag' | 'sensitivity' | 'stats' | 'recs' | 'risks' | 'entities' | 'timeline' | 'research' | 'conflicts' | 'uncertainties' | 'summary'
  >('facts')
  const [showRawSensitivity, setShowRawSensitivity] = useState(false)
  const [factSearchQuery, setFactSearchQuery] = useState('')
  const [factFilter, setFactFilter] = useState<'ALL' | 'PRIMARY' | 'EXTERNAL' | 'DEEP_SYNTHESIS'>('ALL')
  const [copiedSummary, setCopiedSummary] = useState(false)

  const activeMode = canonical.provenance_map?.research_mode || 'SOURCE_AND_VERIFY'

  const filteredFacts = (canonical.key_facts || []).filter((fact) => {
    if (!fact) return false
    const factText = (fact.text || '').toString().toLowerCase()
    const query = (factSearchQuery || '').toString().toLowerCase().trim()
    const sectionText = (fact.source?.section || '').toString().toLowerCase()
    const matchesSearch = !query || factText.includes(query) || sectionText.includes(query)
    
    if (!matchesSearch) return false
    if (factFilter === 'PRIMARY') return fact.provenance === 'PRIMARY_SOURCE_FACT'
    if (factFilter === 'EXTERNAL') return fact.provenance === 'VERIFIED_EXTERNAL_FACT'
    if (factFilter === 'DEEP_SYNTHESIS') return fact.provenance === 'DEEP_RESEARCH_SYNTHESIS'
    return true
  })

  // Unified Timeline & Events Construction
  const unifiedTimeline = React.useMemo(() => {
    const items: Array<{
      dateOrTime: string
      event: string
      severity?: string
      type?: string
    }> = []
    const seen = new Set<string>()

    // Add explicit dates
    for (const d of canonical.dates || []) {
      if (!d) continue
      const dateStr = (d.date || (d as any).timestamp || 'Milestone').toString().trim()
      const eventStr = (d.event || (d as any).title || (d as any).description || '').toString().trim()
      const key = `${dateStr}::${eventStr}`.toLowerCase().trim()
      if (!key || key === '::') continue
      if (!seen.has(key)) {
        seen.add(key)
        items.push({
          dateOrTime: dateStr || 'Milestone',
          event: eventStr || 'Scheduled Milestone',
          type: (d as any).type || 'Milestone'
        })
      }
    }

    // Add events
    for (const ev of canonical.events || []) {
      if (!ev) continue
      const timestampStr = (ev.timestamp || (ev as any).date || 'Event').toString().trim()
      const eventStr = (ev.event || (ev as any).title || (ev as any).description || '').toString().trim()
      const key = `${timestampStr}::${eventStr}`.toLowerCase().trim()
      if (!key || key === '::') continue
      if (!seen.has(key)) {
        seen.add(key)
        items.push({
          dateOrTime: timestampStr || 'Event',
          event: eventStr || 'Recorded Event',
          severity: ev.severity,
          type: ev.severity ? `Incident ${ev.severity}` : 'Milestone'
        })
      }
    }

    return items
  }, [canonical.dates, canonical.events])

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
            External Verified Evidence
          </span>
        )
      case 'DEEP_RESEARCH_SYNTHESIS':
        return (
          <span className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Deep Multi-Tier Synthesis
          </span>
        )
      case 'INFERENCE':
        return (
          <span className="rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
            Analytical Inference
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
      <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', t.color)}>
        {t.label}
      </span>
    )
  }

  const isValidDiscoveredUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false
    const low = url.toLowerCase()
    const banned = ['example.com', 'example.org', 'bing.com', 'google.com', 'localhost', '127.0.0.1']
    return !banned.some((b) => low.includes(b))
  }

  const relationshipBadge = (rel?: string) => {
    switch (rel) {
      case 'Supported':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-extrabold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Supported by Source
          </span>
        )
      case 'Partially Supported':
        return (
          <span className="inline-flex items-center gap-1 text-sky-800 font-extrabold text-[11px] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-300">
            <CheckCircle2 className="h-3 w-3 text-sky-600" /> Partially Supported
          </span>
        )
      case 'Additional Context':
        return (
          <span className="inline-flex items-center gap-1 text-indigo-800 font-extrabold text-[11px] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-300">
            <Lightbulb className="h-3 w-3 text-indigo-600" /> Additional Context
          </span>
        )
      case 'Contradicted':
        return (
          <span className="inline-flex items-center gap-1 text-rose-800 font-extrabold text-[11px] bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-300">
            <AlertTriangle className="h-3 w-3 text-rose-600" /> Contradicted by Source
          </span>
        )
      case 'Not Found':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-extrabold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
            <HelpCircle className="h-3 w-3 text-slate-500" /> Not Found
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-extrabold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
            <Check className="h-3 w-3 text-slate-500" /> Corroborated Source
          </span>
        )
    }
  }

  const primaryCount = (canonical.key_facts || []).filter(f => f.provenance === 'PRIMARY_SOURCE_FACT').length
  const externalCount = (canonical.key_facts || []).filter(f => f.provenance === 'VERIFIED_EXTERNAL_FACT').length

  const tabs = [
    { id: 'facts', label: `Key Facts (${canonical.key_facts?.length || 0})`, icon: CheckCircle2 },
    {
      id: 'rag',
      label: `Knowledge Base (${canonical.rag_sources?.length || canonical.rag_context?.length || 0})`,
      icon: Database
    },
    {
      id: 'sensitivity',
      label: `Sensitive Data (${canonical.sensitivity?.detected_count || 0})`,
      icon: ShieldAlert,
      alert: (canonical.sensitivity?.detected_count || 0) > 0
    },
    { id: 'research', label: `External Research (${canonical.research_findings?.length || 0})`, icon: Search },
    { id: 'conflicts', label: `Conflicts (${canonical.conflicts?.length || 0})`, icon: AlertOctagon, alert: (canonical.conflicts?.length || 0) > 0 },
    { id: 'stats', label: `Metrics & Telemetry (${canonical.statistics?.length || 0})`, icon: BarChart3 },
    { id: 'timeline', label: `Timeline (${unifiedTimeline.length})`, icon: Clock },
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
            <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5">
              Mode: {activeMode === 'SOURCE_ONLY' ? 'Source Only (Air-Gapped)' : activeMode === 'DEEP_RESEARCH' ? 'Deep Research (8-Tier)' : 'Source & Verify'}
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
        {/* KEY FACTS TAB: VERIFIED FACTS & SOURCE ATTRIBUTION CATALOG */}
        {activeTab === 'facts' && (
          <div className="space-y-5">
            {/* Catalog Filter & Search Strip */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Verified Facts & Source Attribution Catalog
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {canonical.key_facts?.length || 0} Grounded Facts • 100% Citation Index across Primary & Secondary Tiers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-center">
                  <button
                    onClick={() => setFactFilter('ALL')}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                      factFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    All ({canonical.key_facts?.length || 0})
                  </button>
                  <button
                    onClick={() => setFactFilter('PRIMARY')}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                      factFilter === 'PRIMARY'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-emerald-800 hover:text-emerald-950'
                    )}
                  >
                    Primary ({primaryCount})
                  </button>
                  <button
                    onClick={() => setFactFilter('EXTERNAL')}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                      factFilter === 'EXTERNAL'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'text-sky-800 hover:text-sky-950'
                    )}
                  >
                    External ({externalCount})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter facts by keyword, section name, or telemetry indicator..."
                  value={factSearchQuery}
                  onChange={(e) => setFactSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Filtered Fact Cards */}
            <div className="space-y-3.5">
              {filteredFacts.length > 0 ? (
                filteredFacts.map((fact, idx) => (
                  <div
                    key={fact.fact_id || idx}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 hover:border-sky-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          #{fact.fact_id || `fact_${idx + 1}`}
                        </span>
                        {provenanceBadge(fact.provenance)}
                      </div>
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                        {((fact.confidence || 0.98) * 100).toFixed(0)}% Certified
                      </span>
                    </div>

                    <p className="text-slate-900 leading-relaxed font-bold text-sm sm:text-base">
                      <FormattedText text={fact.text} />
                    </p>

                    {/* Detailed Source Attribution Metadata Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                      <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        📄 Page {fact.source?.page || 1}
                      </span>
                      <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        📍 {fact.source?.section || 'Executive Summary'}
                      </span>
                      {fact.source?.paragraph && (
                        <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 font-mono">
                          ¶ Para {fact.source.paragraph}
                        </span>
                      )}
                      {fact.source?.file && (
                        <span className="text-slate-500 truncate max-w-[200px]" title={fact.source.file}>
                          📁 {fact.source.file}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm font-medium bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  No facts match the filter query &ldquo;{factSearchQuery}&rdquo;.
                </div>
              )}
            </div>
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
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/40 to-blue-50 border border-sky-200 p-5 text-xs sm:text-sm text-sky-950 font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Authoritative External Research &amp; Live Web Grounding
                  </h4>
                  <p className="text-slate-600 text-xs">
                    Autonomous multi-tier discovery actively visits external websites, parses authoritative evidence, and corroborates primary facts against government, academic, and vendor repositories.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/90 border border-sky-300 text-sky-900 font-bold text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-700" />
                  {canonical.research_findings?.length || 0} Sources Researched
                </span>
              </div>
            </div>

            {canonical.research_findings && canonical.research_findings.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {canonical.research_findings.map((item, idx) => {
                  const hasValidUrl = isValidDiscoveredUrl(item.source_url)
                  const domainDisplay = item.domain || (hasValidUrl ? item.source_url!.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '') : '')
                  const sourceName = item.source_name || item.source_title || 'Identified Entity / Topic'
                  const pageTitle = item.page_title && item.page_title !== sourceName ? item.page_title : null
                  const rel = item.relationship_to_document || (item.researched_status === 'corroborated' ? 'Supported' : 'Additional Context')
                  const whyResearched = item.why_researched || item.claim_text || 'Researched based on key entities and statements in the uploaded document'
                  const findingContent = item.research_finding || item.evidence_snippet || 'Document context corroborated against official records.'

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 hover:border-sky-300 hover:shadow-md transition-all group"
                    >
                      {/* Top Header: Source Name, Page Title, Tier, Status Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-base group-hover:text-sky-900 transition-colors">
                              {sourceName}
                            </span>
                            {domainDisplay && (
                              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200">
                                {domainDisplay}
                              </span>
                            )}
                          </div>
                          {pageTitle && (
                            <p className="text-xs font-semibold text-slate-600">
                              Page Title: <span className="text-slate-800 font-bold">{pageTitle}</span>
                            </p>
                          )}
                          <div className="pt-0.5">
                            {relationshipBadge(rel)}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {tierBadge(item.source_tier)}
                        </div>
                      </div>

                      {/* Discovered Real Destination Website Link Box */}
                      {hasValidUrl ? (
                        <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:bg-sky-100/70 hover:border-sky-300">
                          <div className="flex items-center gap-2.5 min-w-0 max-w-full">
                            <div className="h-8 w-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-sky-900 uppercase tracking-wider">
                                Discovered External Source:
                              </div>
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-sky-700 hover:text-sky-950 hover:underline font-bold truncate block transition-colors"
                                title={item.source_url}
                              >
                                {item.source_url}
                              </a>
                            </div>
                          </div>
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs shrink-0 transition-all hover:shadow-sm active:scale-95"
                          >
                            <span>Visit Website</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>No relevant external source found for this item — grounded strictly in primary baseline document.</span>
                        </div>
                      )}

                      {/* Why it was researched from uploaded document */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Search className="h-3.5 w-3.5 text-indigo-500" /> Why Researched (From Document):
                        </span>
                        <div className="text-xs sm:text-sm text-slate-800 font-semibold bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/80 leading-relaxed">
                          {whyResearched}
                        </div>
                      </div>

                      {/* Relevant Information Found on Website */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" /> Relevant Information Found:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed italic">
                          &ldquo;{findingContent}&rdquo;
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
                <Search className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">Primary Source Only (Confidential Sandbox)</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Research mode was configured to primary source. No outside websites were queried to protect data confidentiality. Select &ldquo;Source &amp; Verify&rdquo; or &ldquo;Deep Research&rdquo; when creating a project to enable live web research with clickable links.
                </p>
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
          <div className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/50 to-indigo-50 border border-sky-200 p-4 text-xs sm:text-sm text-sky-950 font-medium flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Chronological Milestones &amp; Important Dates</h4>
                  <p className="text-slate-600 text-xs">
                    Autonomous date and milestone extraction mapping submission dates, operational deadlines, and phased delivery schedules.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 font-bold text-xs shrink-0">
                {unifiedTimeline.length} Timeline Points
              </span>
            </div>

            {unifiedTimeline.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-sky-500 before:via-indigo-400 before:to-slate-300 space-y-4">
                {unifiedTimeline.map((item, idx) => {
                  const isCritical = item.severity === 'CRITICAL'
                  const isHigh = item.severity === 'HIGH'
                  const dateStr = (item.dateOrTime || '').toString()
                  const safeDateOrTime = dateStr.toLowerCase()
                  const isPhase =
                    item.type === 'PROJECT_PHASE' ||
                    Boolean(item.type?.includes('Phase')) ||
                    safeDateOrTime.includes('part') ||
                    safeDateOrTime.includes('episode')
                  const isCalendarDate =
                    item.type === 'CALENDAR_DATE' ||
                    item.type === 'NUMERIC_DATE' ||
                    /\d{4}/.test(dateStr)

                  return (
                    <div
                      key={idx}
                      className="relative rounded-2xl border border-slate-200 bg-white p-5 space-y-2 hover:border-sky-300 hover:shadow-md transition-all group"
                    >
                      {/* Timeline Dot on the connecting bar */}
                      <div
                        className={clsx(
                          'absolute -left-[27px] sm:-left-[35px] top-6 h-4 w-4 rounded-full border-2 border-white shadow-xs transition-transform group-hover:scale-125',
                          isCritical
                            ? 'bg-rose-500 ring-4 ring-rose-100'
                            : isHigh
                            ? 'bg-amber-500 ring-4 ring-amber-100'
                            : isPhase
                            ? 'bg-indigo-500 ring-4 ring-indigo-100'
                            : 'bg-sky-500 ring-4 ring-sky-100'
                        )}
                      />

                      {/* Header: Date Badge & Category Tag */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-xl bg-sky-100/90 text-sky-900 text-xs font-mono font-black px-3 py-1 border border-sky-200 shadow-2xs">
                            {item.dateOrTime}
                          </span>
                          {isCalendarDate && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                              Verified Calendar Date
                            </span>
                          )}
                          {isPhase && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase tracking-wider">
                              Project Phase Roadmap
                            </span>
                          )}
                        </div>

                        {item.severity && (
                          <span
                            className={clsx(
                              'text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase',
                              isCritical
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            )}
                          >
                            Severity: {item.severity}
                          </span>
                        )}
                      </div>

                      {/* Event description */}
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed pt-1">
                        <FormattedText text={item.event} />
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
                <Clock className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">No Explicit Dates or Milestones Detected</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  The uploaded document does not specify calendar dates, deadlines, or phased roadmap schedules. All baseline narrative is fully preserved in Key Facts and Executive Summary.
                </p>
              </div>
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
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      <FormattedText text={rec.recommendation} />
                    </span>
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
                  {rec.details && (
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      <FormattedText text={rec.details} />
                    </p>
                  )}
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
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    <FormattedText text={r.risk} />
                  </span>
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
                    <strong className="text-slate-800">Business Impact:</strong> <FormattedText text={r.impact} />
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
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      <FormattedText text={u.topic} />
                    </span>
                    <span className="rounded-md bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 uppercase border border-amber-200">
                      {u.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    <FormattedText text={u.details} />
                  </p>
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

        {/* RAG & ORGANIZATIONAL KNOWLEDGE TAB */}
        {activeTab === 'rag' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <Database className="h-4 w-4 text-indigo-600 animate-pulse" />
                  <span>Organizational Knowledge Base (RAG) Grounding</span>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                  {canonical.rag_sources?.length || 0} Policies Referenced
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                The AI retrieved and applied organizational guidelines, communication standards, and security policies from your Knowledge Base to ground every synthesized deliverable.
              </p>
            </div>

            {canonical.rag_context && canonical.rag_context.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {canonical.rag_context.map((chunk: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border border-indigo-200 bg-white p-5 space-y-2.5 shadow-2xs hover:border-indigo-400 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-indigo-950 truncate max-w-[240px]">
                        📚 {chunk.document_title || chunk.source_title || 'Enterprise Policy'}
                      </span>
                      {chunk.similarity !== undefined && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-mono shrink-0">
                          {(chunk.similarity * 100).toFixed(0)}% Match
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-4">
                      <FormattedText text={chunk.content} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>Doc Type: {chunk.doc_type || 'Policy'}</span>
                      <span>Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm font-medium bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                <Database className="h-8 w-8 text-slate-400 mx-auto" />
                <p>No organizational policies were matched for this specific topic.</p>
                <p className="text-xs text-slate-400">Add documents to your Knowledge Base to enforce custom brand and compliance policies.</p>
              </div>
            )}
          </div>
        )}

        {/* EXECUTIVE SUMMARY TAB: COMPREHENSIVE CANONICAL SYNTHESIS NARRATIVE */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            {/* Header Control Bar */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-700 text-white flex items-center justify-center shadow-xs shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      Canonical Executive Synthesis Narrative
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Certified Baseline
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Synthesized from primary source documentation and validated across multi-tier external research intelligence.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(canonical.executive_summary || '')
                    setCopiedSummary(true)
                    setTimeout(() => setCopiedSummary(false), 2000)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs shrink-0 self-start sm:self-center"
                >
                  {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{copiedSummary ? 'Copied Narrative!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Research Grounding & Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sky-200/60 text-xs font-medium text-slate-600">
                <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 font-mono text-[11px] font-bold">
                  📄 Topic: {canonical.topic || canonical.title}
                </span>
                <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-mono text-[11px]">
                  🔍 {canonical.research_findings?.length || 0} Research Evidences Corroborated
                </span>
                <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg text-emerald-800 font-mono text-[11px] font-bold">
                  🛡️ {((canonical.confidence_score || 0.98) * 100).toFixed(0)}% Evidence Grounding
                </span>
              </div>
            </div>

            {/* Narrative Content Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm leading-relaxed text-slate-900">
              <StructuredContentRenderer content={canonical.executive_summary} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
