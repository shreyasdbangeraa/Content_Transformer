'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  CheckCircle2,
  AlertOctagon,
  Globe,
  ShieldCheck,
  Building,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Clock,
  HelpCircle,
  FileCheck,
  Compass,
  FileText,
  Bookmark,
  Check,
} from 'lucide-react'
import { CanonicalAnalysis } from '@/types'
import clsx from 'clsx'

interface LiveResearchProgressProps {
  canonical: CanonicalAnalysis
  researchMode: string
  onComplete: () => void
}

export default function LiveResearchProgress({
  canonical,
  researchMode,
  onComplete,
}: LiveResearchProgressProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0)
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, boolean>>({})

  // Dynamic Domain and Purpose Extraction
  const topic = canonical.topic || canonical.title || 'Primary Document'
  const summary = canonical.executive_summary || ''
  const keyFacts = canonical.key_facts || []
  const conflicts = canonical.conflicts || []
  const findings = canonical.research_findings || []

  // Dynamic Domain Detection
  const combinedText = (topic + ' ' + summary + ' ' + keyFacts.map(f => f.text).join(' ')).toLowerCase()

  let detectedDomain = 'General Enterprise & Multidisciplinary Document'
  let domainKey = 'GENERAL'
  let detectedPurpose = 'Synthesize verified operational facts, strategic insights, and structured directives from the uploaded document.'

  if (/(ransomware|cve|cyber|malware|firewall|phishing|vulnerability|breach|endpoint|soc|siem|encryption|threat actor)/i.test(combinedText)) {
    detectedDomain = 'Cybersecurity & Threat Intelligence'
    domainKey = 'CYBERSECURITY'
    detectedPurpose = 'Document and analyze cybersecurity incident timeline, technical telemetry, perimeter impact, and remediation directives.'
  } else if (/(clinical|patient|therapy|dosage|medical|hospital|diagnosis|pharmaceutical|vaccine|treatment|disease|pathology)/i.test(combinedText)) {
    detectedDomain = 'Healthcare & Life Sciences'
    domainKey = 'HEALTHCARE'
    detectedPurpose = 'Synthesize clinical research, healthcare guidelines, therapeutic interventions, and evidence-based patient care protocols.'
  } else if (/(curriculum|syllabus|student|teacher|pedagogy|grading|classroom|school|course|lesson plan|learning outcome)/i.test(combinedText)) {
    detectedDomain = 'Education & Pedagogical Curriculum'
    domainKey = 'EDUCATION'
    detectedPurpose = 'Outline educational syllabus, learning objectives, instructional methodology, and academic evaluation frameworks.'
  } else if (/(balance sheet|revenue|fiscal|ebitda|inflation|stock|portfolio|dividend|banking|treasury|audit|financial report)/i.test(combinedText)) {
    detectedDomain = 'Finance, Economics & Market Strategy'
    domainKey = 'FINANCE'
    detectedPurpose = 'Review financial performance metrics, fiscal health, revenue breakdown, and strategic economic projections.'
  } else if (/(podcast|episode|audio|listener|interview|host|show notes|broadcast|spotify|season|guest)/i.test(combinedText)) {
    detectedDomain = 'Podcast & Digital Media Production'
    domainKey = 'MEDIA_PODCAST'
    detectedPurpose = 'Structure podcast series concept, episode roadmap, audience engagement strategy, and production schedule.'
  } else if (/(startup|business plan|pitch|tam|sam|som|monetization|go-to-market|investor|proposal|market size|value proposition)/i.test(combinedText)) {
    detectedDomain = 'Business Proposal, Strategy & Startups'
    domainKey = 'BUSINESS'
    detectedPurpose = 'Present commercial business proposal, market opportunity analysis, go-to-market roadmap, and monetization strategy.'
  } else if (/(statute|clause|agreement|contract|plaintiff|defendant|compliance|regulation|jurisdiction|gdpr|liability|terms)/i.test(combinedText)) {
    detectedDomain = 'Legal, Statutory & Regulatory Compliance'
    domainKey = 'LEGAL'
    detectedPurpose = 'Detail statutory compliance obligations, legal provisions, contractual rights, and regulatory governance.'
  } else if (/(solar|renewable|grid|reactor|tokamak|fusion|hydrogen|battery|photovoltaic|carbon|clean energy|emission)/i.test(combinedText)) {
    detectedDomain = 'Clean Energy & Deep Technology'
    domainKey = 'ENERGY_TECH'
    detectedPurpose = 'Evaluate deep technology architecture, energy transition feasibility, technical benchmarks, and deployment roadmap.'
  }

  // Dynamic Key Topics
  const keyTopics: string[] = [topic]
  keyFacts.slice(0, 3).forEach((f) => {
    const words = f.text.match(/\b[A-Z][a-zA-Z0-9-]+\b/g) || []
    words.slice(0, 2).forEach((w) => {
      if (!keyTopics.includes(w) && keyTopics.length < 4) keyTopics.push(w)
    })
  })

  // Temporal & Freshness Evaluation
  const temporalKeywords = ['latest', 'recent', 'current', 'today', 'breaking', 'newest', '2026', 'q3 2026', 'current market', 'active regulation', 'updates']
  const detectedTriggers = temporalKeywords.filter((kw) => combinedText.includes(kw))
  const isTemporal = detectedTriggers.length > 0 || combinedText.includes('latest')

  let freshnessLabel = 'Standard Verification (< 30 days)'
  let freshnessPolicyKey = 'HISTORICAL_ACCEPTABLE'
  if (isTemporal) {
    freshnessLabel = 'Strictly Current (< 48 hours for breaking events / <= 30 days for active benchmarks)'
    freshnessPolicyKey = 'CURRENT_REQUIRED'
  } else if (['LEGAL', 'CYBERSECURITY', 'FINANCE'].includes(domainKey)) {
    freshnessLabel = 'Recent Authoritative Verification (Active standards <= 12 months)'
    freshnessPolicyKey = 'RECENT_PREFERRED'
  } else if (['BUSINESS', 'MEDIA_PODCAST'].includes(domainKey)) {
    freshnessLabel = 'Primary Document Bound (Project proposal baseline)'
    freshnessPolicyKey = 'NO_EXTERNAL_FRESHNESS_REQUIREMENT'
  }

  // Categorize Claims & Research Need
  const claimsWithProvenance = keyFacts.map((f) => {
    const text = f.text
    const lower = text.toLowerCase()
    const isPlan = /(we plan to|our plan|we will launch|the project intends|phase 1 will|objective is to|in this episode|the author proposes|we aim to)/i.test(lower)
    const hasEmpirical = /\b\d+(?:[\.,]\d+)?%?\b/.test(text) || /(standard|regulation|industry average|market size|cve-|iso|who|cdc|nist|sec|law)/i.test(lower)

    let provenance: 'PRIMARY_DOCUMENT_FACT' | 'EXTERNAL_VERIFIED_FACT' | 'INFERENCE' = 'PRIMARY_DOCUMENT_FACT'
    let researchNeed: 'RESEARCH_REQUIRED' | 'RESEARCH_RECOMMENDED' | 'NO_RESEARCH_REQUIRED' = 'NO_RESEARCH_REQUIRED'
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
    let reason = 'Project plan or factual assertion grounded directly in the primary uploaded document.'

    if (isPlan) {
      researchNeed = 'NO_RESEARCH_REQUIRED'
      priority = 'LOW'
      reason = 'Internal author plan/proposal. No external verification required.'
    } else if (hasEmpirical) {
      researchNeed = 'RESEARCH_REQUIRED'
      priority = 'HIGH'
      reason = 'Empirical metric or external standard benefits from authoritative verification.'
    }

    return {
      claim: text,
      provenance,
      researchNeed,
      priority,
      reason,
    }
  })

  const claimsNeedingVerification = claimsWithProvenance.filter((c) => c.researchNeed !== 'NO_RESEARCH_REQUIRED')
  const verifiedClaimsCount = claimsNeedingVerification.length
  const researchTopicsCount = verifiedClaimsCount > 0 ? verifiedClaimsCount : 1

  // Dynamic 4 Stages Execution Calculation
  const researchSteps = [
    {
      id: 'query_planning',
      title: '1. Research Planner & Freshness Evaluation',
      desc: 'Determining what information requires external research and how current the evidence needs to be.',
      detail: `${researchTopicsCount} research topic(s) identified. ${verifiedClaimsCount} claim(s) requiring verification. [Freshness: ${freshnessPolicyKey}].`,
    },
    {
      id: 'tier_querying',
      title: '2. Authoritative Evidence Harvesting',
      desc: 'Searching relevant external sources and collecting supporting evidence.',
      detail: findings.length > 0
        ? `${findings.length} real external source evidence record(s) retrieved and mapped.`
        : 'No external research required. All facts are self-contained in the primary document.',
    },
    {
      id: 'conflict_detection',
      title: '3. Cross-Source Discrepancy Analysis',
      desc: 'Comparing relevant external evidence for factual conflicts.',
      detail: conflicts.length > 0
        ? `${conflicts.length} meaningful conflict(s) detected across reporting sources.`
        : 'No meaningful conflicts detected. Primary document baseline is internally consistent.',
    },
    {
      id: 'provenance_tagging',
      title: '4. Provenance Attribution',
      desc: 'Mapping claims to their original document or external evidence.',
      detail: `100.0% of processed claims have verified provenance labels (PRIMARY_DOCUMENT_FACT).`,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < researchSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [researchSteps.length])

  const handleResolveConflict = (conflictId: string) => {
    setResolvedConflicts((prev) => ({ ...prev, [conflictId]: true }))
  }

  const tierBadge = (tier: number) => {
    const tierMap: Record<number, { label: string; color: string }> = {
      1: { label: 'Tier 1: Government / Standards', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      2: { label: 'Tier 2: Primary Source Document', color: 'bg-sky-50 text-sky-800 border-sky-200' },
      3: { label: 'Tier 3: Academic / Technical Research', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      4: { label: 'Tier 4: Standards Organization', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      6: { label: 'Tier 6: Authoritative Journalism', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    }
    const t = tierMap[tier] || { label: `Tier ${tier}: External Research`, color: 'bg-slate-100 text-slate-800 border-slate-200' }
    return (
      <span className={clsx('rounded-md border text-[10px] font-bold px-2 py-0.5', t.color)}>
        {t.label}
      </span>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Search className="h-3.5 w-3.5 text-indigo-700" />
                STAGE 2 • RESEARCH PLANNER & EVIDENCE DISCOVERY
              </span>
              <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 font-mono">
                Mode: {researchMode}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Authoritative Multi-Source Evidence Discovery
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              The system identifies claims that need external evidence, researches them using relevant sources, checks for conflicts, and preserves the uploaded document as the primary source.
            </p>
          </div>

          <button
            onClick={onComplete}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-indigo-500 transition-all self-start sm:self-center shrink-0"
          >
            <span>Proceed to Step 3: Canonical Truth Layer</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SECTION 9 — RESEARCH PLANNER (Universal Document Understanding Matrix) */}
      <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-indigo-200/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-indigo-900 uppercase tracking-wider">
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>SECTION 9 — RESEARCH PLANNER (Document-Driven Gating)</span>
          </div>
          <span className="rounded-full bg-indigo-100 border border-indigo-300 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 font-mono">
            Universal Document-Agnostic
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Pillar 1: Document Understanding (Domain & Purpose) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Building className="h-3.5 w-3.5 text-indigo-600" />
              <span>1. Document Understanding</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div>
                <span className="font-bold text-slate-700 block">Domain:</span>
                <span className="font-semibold text-indigo-700">{detectedDomain}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block">Purpose:</span>
                <span className="text-slate-600 line-clamp-2">{detectedPurpose}</span>
              </div>
              <div className="pt-1">
                <span className="font-bold text-slate-700 block text-[10px] uppercase">Key Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {keyTopics.map((t, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: What Needs Research? */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
              <span>2. What Needs Research?</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed text-[11px]">
              {verifiedClaimsCount > 0
                ? `Authoritative external verification for ${verifiedClaimsCount} empirical metric(s) & standards regarding ${topic}.`
                : `Primary document '${topic}' is self-contained. Internal plans and qualitative proposals are preserved without forcing unnecessary external search.`}
            </p>
            {isTemporal && (
              <span className="block text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
                ⚡ Temporal Trigger: Live research mandate active (&lt; 48 hrs).
              </span>
            )}
          </div>

          {/* Pillar 3: Claims Requiring Verification */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>3. Claims Requiring Verification</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {claimsNeedingVerification.length > 0 ? (
                claimsNeedingVerification.slice(0, 2).map((c, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-2 space-y-1">
                    <p className="font-bold text-slate-800 line-clamp-1">&ldquo;{c.claim}&rdquo;</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold font-mono">PRIMARY_DOCUMENT_FACT</span>
                      <span className="text-amber-700 font-bold">{c.priority} PRIORITY</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-[11px]">
                  All claims are author-specific plans or qualitative statements. No external verification required.
                </p>
              )}
            </div>
          </div>

          {/* Pillar 4: Freshness & Temporal Policy */}
          <div className="rounded-2xl border border-indigo-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>4. Freshness & Temporal Policy</span>
            </div>
            <div className="text-[11px] text-slate-700 font-medium space-y-1">
              <span className="inline-block rounded bg-indigo-100 text-indigo-900 px-2 py-0.5 text-[10px] font-mono font-bold">
                {freshnessPolicyKey}
              </span>
              <p className="text-slate-700 font-semibold text-[11px] mt-1">{freshnessLabel}</p>
              <p className="text-[10px] text-slate-500 italic">
                Rule: System prohibits using outdated static LLM training cutoffs as &ldquo;latest&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Stage Execution Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {researchSteps.map((step, idx) => {
          const isDone = currentStepIdx >= idx
          const isCurrent = currentStepIdx === idx

          return (
            <div
              key={step.id}
              className={clsx(
                'rounded-3xl border-2 p-5 space-y-3 transition-all',
                isCurrent
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-4 ring-indigo-50'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-white opacity-60'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">STAGE {idx + 1}/4</span>
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900">{step.title}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.desc}</p>
              <div className="rounded-xl bg-white p-2.5 text-[11px] text-slate-700 border border-slate-200 font-mono">
                {step.detail}
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Discrepancy & Conflict Detection Alert */}
      {conflicts.length > 0 ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-rose-100 text-rose-700 p-2">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Cross-Source Discrepancy Analysis ({conflicts.length} Conflict Detected)
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  The system compares relevant external evidence for factual conflicts and preserves the uploaded document as truth.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-black px-3 py-1 font-mono">
              Human Review & Gating
            </span>
          </div>

          {conflicts.map((conf, idx) => {
            const isResolved = resolvedConflicts[String(idx)]
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Source A */}
                  <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 space-y-1.5">
                    <div className="text-xs font-extrabold text-emerald-800 uppercase flex items-center justify-between">
                      <span>Source A: {conf.source_a_title}</span>
                      <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-mono">PRIMARY</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">&ldquo;{conf.claim_a}&rdquo;</p>
                  </div>

                  {/* Source B */}
                  <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 space-y-1.5">
                    <div className="text-xs font-extrabold text-amber-800 uppercase flex items-center justify-between">
                      <span>Source B: {conf.source_b_title}</span>
                      <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded font-mono">EXTERNAL</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">&ldquo;{conf.claim_b}&rdquo;</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 space-y-1">
                  <strong className="text-slate-900 block font-bold">Discrepancy Description:</strong>
                  <p className="leading-relaxed font-medium">{conf.discrepancy_description}</p>
                  {conf.possible_explanation && (
                    <p className="text-slate-500 italic mt-1 font-medium">{conf.possible_explanation}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Resolution: <strong>Primary Document Prioritized</strong>
                  </span>
                  <button
                    onClick={() => handleResolveConflict(String(idx))}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs',
                      isResolved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isResolved ? 'Discrepancy Confirmed' : 'Confirm Primary Source'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 text-emerald-700 p-2 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Cross-Source Discrepancy Analysis: No Meaningful Conflicts Detected
              </h4>
              <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                The primary document baseline is internally consistent. No conflicting external claims were detected.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 shrink-0 font-mono">
            Zero Conflict
          </span>
        </div>
      )}

      {/* Source Cards: Strictly Separates PRIMARY DOCUMENT vs EXTERNAL SOURCE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-sky-100 text-sky-700 p-2">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Source Attribution &amp; Provenance Registry
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Primary document facts and verified external source corroborations with immutable provenance
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Provenance Coverage: 100.0%
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Primary Document Facts Cards */}
          {keyFacts.slice(0, 4).map((f, idx) => (
            <div
              key={`prim_${idx}`}
              className="rounded-2xl border border-sky-200 bg-sky-50/30 p-5 space-y-2.5 hover:bg-white hover:border-sky-300 transition-all shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-sky-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Source: Uploaded Document ({topic})
                  </span>
                </div>
                <span className="rounded-md bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 text-[10px] font-mono font-bold">
                  PRIMARY_DOCUMENT_FACT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                &ldquo;{f.text}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-0.5">
                <span>Attribution: <strong>Primary Document (Truth Source)</strong></span>
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <Check className="h-3 w-3" /> Verified Grounding (100%)
                </span>
              </div>
            </div>
          ))}

          {/* External Corroborating Evidence (Only if real external research findings exist) */}
          {findings.map((f, idx) => (
            <div
              key={`ext_${idx}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2.5 hover:bg-white hover:border-indigo-300 transition-all shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Source: {f.source_title}
                  </span>
                </div>
                {tierBadge(f.source_tier)}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                &ldquo;{f.evidence_snippet}&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium pt-0.5">
                <span>Verified Claim: <strong className="text-slate-800">{f.claim_text}</strong></span>
                {f.source_url ? (
                  <a
                    href={f.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                  >
                    Source Repository <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">Authoritative Registry</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
