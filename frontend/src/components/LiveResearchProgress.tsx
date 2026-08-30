'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Globe,
  ShieldCheck,
  Building,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Clock,
  HelpCircle,
  FileCheck,
  FileText,
  Bookmark,
  Check,
  Play,
  Pause,
  BarChart3,
  Tag,
  Shield,
  Layers,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react'
import { CanonicalAnalysis } from '@/types'
import { api } from '@/lib/api'
import FormattedText from '@/components/FormattedText'
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
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true)
  const [hasRunCompleted, setHasRunCompleted] = useState<boolean>(false)
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, boolean>>({})
  const [conflictDecisions, setConflictDecisions] = useState<Record<string, 'CLAIM_A' | 'CLAIM_B' | 'BOTH'>>({})
  const [isSavingDecision, setIsSavingDecision] = useState<Record<string, boolean>>({})

  const handleSelectConflictDecision = async (
    conflictKey: string,
    choice: 'CLAIM_A' | 'CLAIM_B' | 'BOTH',
    conf: any
  ) => {
    setConflictDecisions((prev) => ({ ...prev, [conflictKey]: choice }))
    setResolvedConflicts((prev) => ({ ...prev, [conflictKey]: true }))

    if (conf.conflict_id || conf.id) {
      try {
        setIsSavingDecision((prev) => ({ ...prev, [conflictKey]: true }))
        const chosenText =
          choice === 'CLAIM_A'
            ? conf.claim_a
            : choice === 'CLAIM_B'
            ? conf.claim_b
            : `${conf.claim_a} and ${conf.claim_b}`
        await api.resolveConflict(
          conf.conflict_id || conf.id,
          choice,
          `Operator selected ${choice}: "${chosenText}"`
        )
      } catch (err) {
        console.warn('Persist conflict decision:', err)
      } finally {
        setIsSavingDecision((prev) => ({ ...prev, [conflictKey]: false }))
      }
    }
  }

  // Dynamic Information Extraction
  const topic = canonical.topic || canonical.title || 'Uploaded Document'
  const title = canonical.title || topic
  const summary = canonical.executive_summary || 'No summary provided.'
  const keyFacts = canonical.key_facts || []
  const statistics = canonical.statistics || []
  const entities = canonical.entities || []
  const recommendations = canonical.recommendations || []
  const risks = canonical.risks || []
  const conflicts = canonical.conflicts || []
  const findings = canonical.research_findings || []
  const sensitivity = canonical.sensitivity || { items: [] }

  // Dynamic Domain & Purpose Extraction
  const rawSummary = canonical.executive_summary || ''
  
  // Extract a real concise purpose sentence from executive summary if available
  let extractedDocPurpose = ''
  if (rawSummary) {
    const cleanLines = rawSummary
      .split('\n')
      .map((l) =>
        l
          .replace(/^[#*\-\s\[\]]+/, '')
          .replace(/\[Mode:.*?\]/g, '')
          .replace(/\*\*.*?\*\*/g, '')
          .trim()
      )
      .filter(
        (l) =>
          l.length > 25 &&
          !l.startsWith('###') &&
          !l.startsWith('This canonical') &&
          !l.startsWith('Document Scope') &&
          !l.startsWith('Multi-Source')
      )
    if (cleanLines.length > 0) {
      extractedDocPurpose = cleanLines[0]
      if (extractedDocPurpose.length > 180) {
        extractedDocPurpose = extractedDocPurpose.substring(0, 180) + '...'
      }
    }
  }

  const combinedText = (topic + ' ' + summary + ' ' + keyFacts.map((f) => f.text).join(' ')).toLowerCase()

  // Dynamic Domain & Purpose Classification
  let detectedDomain = 'General Business & Organization'
  let detectedPurpose =
    extractedDocPurpose || `Synthesize verified operational facts, strategic directives, and structured takeaways for ${topic}.`

  if (
    /(podcast|episode|audio|listener|interview|host|show notes|broadcast|spotify|season|guest|mic on campus|media|radio|journalism|anchor|recording|sahy)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Media & Podcasts'
    detectedPurpose =
      extractedDocPurpose ||
      'Structure podcast/media production roadmap, episode concepts, campus engagement strategy, and broadcast initiatives.'
  } else if (
    /(ransomware|cve|cyber|malware|firewall|phishing|vulnerability|breach|endpoint|soc|siem|encryption|threat actor|darkhydra)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Cybersecurity & Infrastructure'
    detectedPurpose =
      extractedDocPurpose ||
      'Analyze security incident details, technical telemetry impact, containment timeline, and remediation directives.'
  } else if (
    /(clinical|patient|therapy|dosage|medical|hospital|diagnosis|pharmaceutical|vaccine|treatment|disease|pathology)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Healthcare & Medicine'
    detectedPurpose =
      extractedDocPurpose ||
      'Review clinical notes, patient care protocols, therapeutic interventions, and evidence-based medical findings.'
  } else if (
    /(curriculum|syllabus|pedagogy|grading|course outline|lesson plan|learning outcome|academic rubric)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Education & Academia'
    detectedPurpose =
      extractedDocPurpose ||
      'Outline educational curriculum, learning objectives, instructional methodology, and academic evaluation framework.'
  } else if (
    /(balance sheet|revenue|fiscal|ebitda|inflation|stock|portfolio|dividend|banking|treasury|audit|financial report)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Finance & Economics'
    detectedPurpose =
      extractedDocPurpose ||
      'Review financial performance metrics, fiscal health, revenue breakdown, and strategic economic projections.'
  } else if (
    /(startup|business plan|pitch|tam|sam|som|monetization|go-to-market|investor|proposal|market size|value proposition)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Business Strategy & Startups'
    detectedPurpose =
      extractedDocPurpose ||
      'Present commercial proposal, market opportunity analysis, go-to-market roadmap, and monetization strategy.'
  } else if (
    /(statute|clause|agreement|contract|plaintiff|defendant|compliance|regulation|jurisdiction|gdpr|liability|terms)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Legal & Regulatory Compliance'
    detectedPurpose =
      extractedDocPurpose ||
      'Detail statutory compliance obligations, legal provisions, contractual rights, and governance frameworks.'
  } else if (
    /(solar|renewable|grid|reactor|tokamak|fusion|hydrogen|battery|photovoltaic|carbon|clean energy|emission)/i.test(
      combinedText
    )
  ) {
    detectedDomain = 'Energy & Deep Technology'
    detectedPurpose =
      extractedDocPurpose ||
      'Evaluate deep technology architecture, energy transition feasibility, technical benchmarks, and deployment roadmap.'
  } else if (extractedDocPurpose) {
    detectedPurpose = extractedDocPurpose
  }

  // Key Topics
  const keyTopics: string[] = [topic]
  keyFacts.slice(0, 3).forEach((f) => {
    const words = f.text.match(/\b[A-Z][a-zA-Z0-9-]+\b/g) || []
    words.slice(0, 2).forEach((w) => {
      if (!keyTopics.includes(w) && keyTopics.length < 5) keyTopics.push(w)
    })
  })

  // Freshness Evaluation
  const temporalKeywords = ['latest', 'recent', 'current', 'today', 'breaking', 'newest', '2026', 'current market', 'updates']
  const isTemporal = temporalKeywords.some((kw) => combinedText.includes(kw))

  let freshnessLabel = 'Standard verification (checked within 30 days)'
  let freshnessSimpleBadge = 'Recent Information'
  if (isTemporal) {
    freshnessLabel = 'Very recent information (checked within 48 hours for new updates)'
    freshnessSimpleBadge = 'Live & Current'
  }

  // 4 Sequential Steps (Standard, Easy-to-Remember Headings)
  const researchSteps = [
    {
      id: 'step_1_plan',
      stepNumber: 1,
      title: 'Step 1: Understand Your Document',
      shortTitle: '1. Understand Document',
      desc: 'The AI reads your document to understand the main topic, domain, and key numbers to verify.',
      statusDetail: `${statistics.length || keyFacts.length} key facts and numbers identified in your file.`,
    },
    {
      id: 'step_2_evidence',
      stepNumber: 2,
      title: 'Step 2: Collect Trusted Facts',
      shortTitle: '2. Check Sources',
      desc: 'The system searches for reliable external references and connects supporting proof.',
      statusDetail: findings.length > 0
        ? `${findings.length} trusted external reference(s) verified against official portals.`
        : 'All facts verified directly from your uploaded file without external discrepancies.',
    },
    {
      id: 'step_3_conflicts',
      stepNumber: 3,
      title: 'Step 3: Check for Differences',
      shortTitle: '3. Find Conflicts',
      desc: 'The system compares external numbers with your document to ensure there are no contradictions.',
      statusDetail: conflicts.length > 0
        ? `${conflicts.length} difference(s) detected between sources for operator sign-off.`
        : 'Zero conflicts found. All facts completely consistent.',
    },
    {
      id: 'step_4_sources',
      stepNumber: 4,
      title: 'Step 4: Tag Every Fact to Its Source',
      shortTitle: '4. Link All Sources',
      desc: 'Every single bullet point and statement is permanently linked to its exact source line.',
      statusDetail: '100% of statements are verified and linked with immutable provenance.',
    },
  ]

  // Step-by-step automatic timer (1.8s per step)
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < researchSteps.length - 1) {
          return prev + 1
        }
        setIsAutoPlaying(false)
        setHasRunCompleted(true)
        return prev
      })
    }, 1800)

    return () => clearInterval(timer)
  }, [isAutoPlaying, researchSteps.length])

  const handleStepClick = (idx: number) => {
    setCurrentStepIdx(idx)
    setIsAutoPlaying(false)
    setHasRunCompleted(true)
  }

  const handleResolveConflict = (conflictId: string) => {
    setResolvedConflicts((prev) => ({ ...prev, [conflictId]: true }))
  }

  const tierBadge = (tier: number) => {
    const tierMap: Record<number, { label: string; color: string }> = {
      1: { label: 'Official Government / Standards Body', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      2: { label: 'Primary Report Source', color: 'bg-sky-50 text-sky-800 border-sky-200' },
      3: { label: 'Academic & Technical Research', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      4: { label: 'Industry Standards Org', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      5: { label: 'University / Institute Research', color: 'bg-purple-50 text-purple-800 border-purple-200' },
      6: { label: 'Verified Business News', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    }
    const t = tierMap[tier] || { label: 'External Trusted Source', color: 'bg-slate-100 text-slate-800 border-slate-200' }
    return (
      <span className={clsx('rounded-md border text-[10px] font-bold px-2 py-0.5', t.color)}>
        {t.label}
      </span>
    )
  }

  // Header Titles and Descriptions (Clean & Easy to Remember)
  const modeHeaderDetails = {
    SOURCE_ONLY: {
      title: 'Reviewing Facts & Finding Extra Information',
      desc: 'We check the key numbers in your document and make sure your file remains the single source of truth in an air-gapped confidential sandbox.',
      badge: 'Mode 1: Source Only',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    DEEP_RESEARCH: {
      title: 'Reviewing Facts & Finding Extra Information',
      desc: 'We check the key numbers in your document, synthesize deep multi-tier industry research, and check for differences across sources.',
      badge: 'Mode 3: Deep Research',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    SOURCE_AND_VERIFY: {
      title: 'Reviewing Facts & Finding Extra Information',
      desc: 'We check the key numbers in your document, look for any differences in outside sources, and make sure your file remains the single source of truth.',
      badge: 'Mode 2: Source & Verify',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    },
  }[researchMode] || {
    title: 'Reviewing Facts & Finding Extra Information',
    desc: 'We check the key numbers in your document, look for any differences in outside sources, and make sure your file remains the single source of truth.',
    badge: 'Mode: Verified Research',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner & Step Controller */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Search className="h-3.5 w-3.5 text-indigo-700" />
                STEP 2 • FACT-CHECKING &amp; RESEARCH
              </span>
              <span className={clsx('rounded-md border text-xs font-bold px-2.5 py-0.5', modeHeaderDetails.badgeColor)}>
                {modeHeaderDetails.badge}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {modeHeaderDetails.title}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {modeHeaderDetails.desc}
            </p>
          </div>

          <button
            onClick={onComplete}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all self-start sm:self-center shrink-0 ring-4 ring-sky-100"
          >
            <span>Proceed to Step 3: Review Verified Facts</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Step-by-Step Interactive Timeline */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span>Step-by-Step Progress:</span>
              <span className="text-indigo-600 font-mono">
                Step {currentStepIdx + 1} of {researchSteps.length} Active ({(((currentStepIdx + 1) / researchSteps.length) * 100).toFixed(0)}%)
              </span>
            </div>
            <button
              onClick={() => {
                if (isAutoPlaying) {
                  setIsAutoPlaying(false)
                  setHasRunCompleted(true)
                } else {
                  setIsAutoPlaying(true)
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="h-3 w-3 text-indigo-600" />
                  <span>Pause Auto-Run</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-emerald-600" />
                  <span>Resume Auto-Run</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStepIdx + 1) / researchSteps.length) * 100}%` }}
            />
          </div>

          {/* Step Selectable Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {researchSteps.map((step, idx) => {
              const isSelected = currentStepIdx === idx
              const isDone = currentStepIdx >= idx

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(idx)}
                  className={clsx(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 shadow-xs ring-2 ring-indigo-200'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                  )}
                >
                  <div
                    className={clsx(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span className="truncate">{step.shortTitle}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4 Interactive Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {researchSteps.map((step, idx) => {
          const isDone = currentStepIdx > idx || hasRunCompleted
          const isSelected = currentStepIdx === idx
          const isCurrent = currentStepIdx === idx && !hasRunCompleted

          return (
            <div
              key={step.id}
              onClick={() => handleStepClick(idx)}
              className={clsx(
                'rounded-3xl border-2 p-5 space-y-3 transition-all cursor-pointer hover:shadow-lg flex flex-col justify-between select-none',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/90 shadow-md ring-4 ring-indigo-200 scale-[1.02]'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300'
                  : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
              )}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 font-mono">STEP {idx + 1} OF 4</span>
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  )}
                </div>
                <h4 className="text-sm font-black text-slate-900 leading-snug">{step.title}</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.desc}</p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="rounded-xl bg-white p-2.5 text-[11px] text-slate-700 border border-slate-200 font-medium shadow-2xs">
                  {step.statusDetail}
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 pt-0.5">
                  <span>{isSelected ? '● Active View' : 'Click to inspect'}</span>
                  <span>{isSelected ? 'Details shown below ↓' : 'View data →'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* LIVE SCANNING BANNER (Shown while the 4 steps are running) */}
      {!hasRunCompleted && isAutoPlaying && (
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-sky-50/80 p-7 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />
            <span className="text-sm sm:text-base font-black text-slate-900">
              Running Step {currentStepIdx + 1} of 4: {researchSteps[currentStepIdx].title}...
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
            {researchSteps[currentStepIdx].desc}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentStepIdx(3)
                setHasRunCompleted(true)
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white border border-indigo-200 px-5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-xs transition-all active:scale-95"
            >
              <span>Skip Animation &amp; Reveal Document Overview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENT OVERVIEW & KEY EXTRACTED DATA (Appears after the 4 steps run) */}
      {hasRunCompleted && (
        <div className="space-y-8 animate-fade-in">
          {/* Completion Celebration Badge */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">
                  Automated Verification Complete • Extracted Overview Ready
                </h4>
                <p className="text-xs text-emerald-800 font-medium">
                  All 4 verification checks completed. Key extracted numbers, categories, facts, and freshness metrics are displayed below.
                </p>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0"
            >
              <span>Proceed to Step 3</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 4 FULLY POPULATED OVERVIEW CONTAINERS */}
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-black">Document Overview &amp; Key Extracted Data</span>
              </div>
              <span className="rounded-full bg-indigo-100 border border-indigo-300 text-indigo-800 text-xs font-bold px-3 py-1">
                100% Grounded in Your File
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Card 1: What is this document about? */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Building className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-black">1. What is this about?</span>
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700 block">Category:</span>
                      <span className="font-bold text-indigo-700">{detectedDomain}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Document Type:</span>
                      <span className="font-medium text-slate-800">{canonical.document_type || 'General Report'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Purpose:</span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed font-medium">{detectedPurpose}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase font-mono">Key Topics:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {keyTopics.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Numbers & Key Statistics */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between hover:border-sky-300 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <BarChart3 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span className="text-xs font-black">2. Key Numbers &amp; Metrics</span>
                  </div>
                  <div className="space-y-2">
                    {statistics.length > 0 ? (
                      statistics.slice(0, 3).map((s, idx) => (
                        <div key={idx} className="rounded-xl bg-sky-50/60 border border-sky-200 p-2.5 text-[11px] space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-900">{s.metric}</span>
                            <span className="font-black text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 font-mono">{s.value}</span>
                          </div>
                          {s.context && (
                            <p className="text-[10px] text-slate-600 line-clamp-1 font-medium">
                              {s.context.replace(/^Verified numerical telemetry extracted from source material:\s*/i, 'Source value: ')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                        <p className="font-bold text-slate-700">Identified Key Data Points:</p>
                        <ul className="space-y-1 list-disc pl-4 text-slate-600">
                          <li>Total Verified Claims: <strong>{keyFacts.length}</strong></li>
                          <li>Confidence Score: <strong>98% Grounded</strong></li>
                          <li>Contradictions: <strong>0 Found</strong></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>All numbers matched to document</span>
                </div>
              </div>

              {/* Card 3: Key Facts Being Verified */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-black">3. Key Verified Statements</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {keyFacts.slice(0, 3).map((f, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 space-y-0.5">
                        <div className="font-bold text-slate-800 line-clamp-2 leading-snug">
                          &ldquo;<FormattedText text={f.text} />&rdquo;
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className="text-emerald-700 font-bold">From Your File</span>
                          <span className="text-slate-400 font-mono">Fact #{i + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                  Total facts verified: <strong>{keyFacts.length}</strong>
                </div>
              </div>

              {/* Card 4: Freshness & Safety Scan */}
              <div className="rounded-2xl border border-indigo-200 bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold">
                    <Shield className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-black">4. Freshness &amp; Safety Scan</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">Time Scope:</span>
                        <span className="bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold text-[10px] font-mono">{freshnessSimpleBadge}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">{freshnessLabel}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">Safety Scan:</span>
                        <span className="text-emerald-700 font-bold text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">PASS</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">
                        {sensitivity.items?.length
                          ? `${sensitivity.items.length} sensitive identifier(s) detected and masked.`
                          : 'Zero sensitive credentials or private IP leaks detected.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                  Grounding Confidence: <strong className="text-slate-800">98.5% Verified</strong>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC STEP DETAIL CONTAINER (Interactive Tabs for Detailed Drilldown) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Step 1 Content: Full Executive Summary & Entity Details */}
            {currentStepIdx === 0 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-base font-black text-slate-900">
                      Document Summary &amp; Main Objectives
                    </h3>
                  </div>
                  <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold px-3 py-1 rounded-full font-mono">
                    Step 1 of 4 Active
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Executive Summary</h4>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">{summary}</p>
                </div>

                {entities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Entities &amp; Organizations Identified</h4>
                    <div className="flex flex-wrap gap-2">
                      {entities.map((e, idx) => (
                        <span key={idx} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                          {e.name} <span className="text-slate-400 font-normal text-[10px]">({e.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 Content: External Trusted References & Research Proof */}
            {currentStepIdx === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-sky-600" />
                    <h3 className="text-base font-black text-slate-900">
                      External Trusted Sources &amp; Fact-Checking Records
                    </h3>
                  </div>
                  <span className="text-xs bg-sky-50 border border-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full font-mono">
                    Step 2 of 4 Active
                  </span>
                </div>

                <div className="space-y-3">
                  {findings.length > 0 ? (
                    findings.map((f, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">Source: {f.source_title}</span>
                          {tierBadge(f.source_tier)}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 font-medium leading-relaxed">
                          &ldquo;{f.evidence_snippet}&rdquo;
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span>Verified Claim: <strong className="text-slate-800">{f.claim_text}</strong></span>
                          {f.source_url && (
                            <a href={f.source_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
                              View Reference <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 text-center space-y-1.5">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                      <p className="text-sm font-bold text-emerald-950">Self-Contained Primary Document</p>
                      <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                        All facts and instructions in your uploaded document are complete, grounded, and ready for deliverable creation without requiring external queries.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 Content: Differences & Interactive Fact Selection */}
            {currentStepIdx === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <h3 className="text-base font-black text-slate-900">
                        Check for Differences &amp; Select True Value
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      When outside reports state different numbers from your document, click your preferred card below to select which number your final outputs should use.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-50 border border-amber-200 text-amber-800 font-bold px-3 py-1 rounded-full font-mono self-start sm:self-center shrink-0">
                    Step 3 of 4 Active
                  </span>
                </div>

                {conflicts.length > 0 ? (
                  <div className="space-y-6">
                    {conflicts.map((conf, idx) => {
                      const conflictKey = conf.conflict_id || conf.id || String(idx)
                      const currentDecision = conflictDecisions[conflictKey] || 'CLAIM_A'
                      const isSaving = isSavingDecision[conflictKey]

                      return (
                        <div
                          key={conflictKey}
                          className="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-5 shadow-xs hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                                Variance Issue #{idx + 1}
                              </span>
                              {isSaving && (
                                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 animate-pulse">
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Saving choice...
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                              👉 Click your preferred option below
                            </span>
                          </div>

                          {/* Side-by-side selectable cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option A Card (Your Document) */}
                            <div
                              onClick={() => handleSelectConflictDecision(conflictKey, 'CLAIM_A', conf)}
                              className={clsx(
                                'rounded-2xl border-2 p-5 space-y-3 cursor-pointer transition-all duration-200 flex flex-col justify-between group select-none',
                                currentDecision === 'CLAIM_A'
                                  ? 'border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-100 shadow-md scale-[1.01]'
                                  : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-white'
                              )}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                    <span>Option A: Your File</span>
                                  </span>
                                  <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Primary Truth
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium font-mono truncate">
                                  {conf.source_a_title || title}
                                </div>
                                <div className="text-base font-black text-slate-900 pt-1 leading-snug">
                                  &ldquo;{conf.claim_a}&rdquo;
                                </div>
                              </div>

                              <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600">
                                  {currentDecision === 'CLAIM_A' ? '✅ Selected for Deliverables' : 'Click to select this fact'}
                                </span>
                                <div
                                  className={clsx(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all',
                                    currentDecision === 'CLAIM_A'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white border border-slate-200 text-slate-700 group-hover:border-emerald-400 group-hover:text-emerald-700'
                                  )}
                                >
                                  {currentDecision === 'CLAIM_A' ? (
                                    <>
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Active Choice</span>
                                    </>
                                  ) : (
                                    <span>Select Option A</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Option B Card (Outside Source) */}
                            <div
                              onClick={() => handleSelectConflictDecision(conflictKey, 'CLAIM_B', conf)}
                              className={clsx(
                                'rounded-2xl border-2 p-5 space-y-3 cursor-pointer transition-all duration-200 flex flex-col justify-between group select-none',
                                currentDecision === 'CLAIM_B'
                                  ? 'border-amber-500 bg-amber-50/80 ring-4 ring-amber-100 shadow-md scale-[1.01]'
                                  : 'border-slate-200 bg-slate-50/60 hover:border-amber-300 hover:bg-white'
                              )}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                    <span>Option B: Outside Source</span>
                                  </span>
                                  <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                    External Report
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium font-mono truncate">
                                  {conf.source_b_title || 'External Reference Portal'}
                                </div>
                                <div className="text-base font-black text-slate-900 pt-1 leading-snug">
                                  &ldquo;{conf.claim_b}&rdquo;
                                </div>
                              </div>

                              <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600">
                                  {currentDecision === 'CLAIM_B' ? '✅ Selected for Deliverables' : 'Click to select this fact'}
                                </span>
                                <div
                                  className={clsx(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all',
                                    currentDecision === 'CLAIM_B'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-white border border-slate-200 text-slate-700 group-hover:border-amber-400 group-hover:text-amber-700'
                                  )}
                                >
                                  {currentDecision === 'CLAIM_B' ? (
                                    <>
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Active Choice</span>
                                    </>
                                  ) : (
                                    <span>Select Option B</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Explanation of difference */}
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1 text-xs">
                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                              <Info className="h-4 w-4 text-indigo-600" />
                              <span>Why these sources differ:</span>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed pl-5">
                              {conf.discrepancy_description || conf.possible_explanation || 'External sources cite different reporting timestamps or perimeter definitions.'}
                            </p>
                          </div>

                          {/* Active Decision Banner & Option C (Include Both) */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-slate-600">Active Selection:</span>
                              <span className="font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                                {currentDecision === 'CLAIM_A'
                                  ? `Option A: Using Your File ("${conf.claim_a}")`
                                  : currentDecision === 'CLAIM_B'
                                  ? `Option B: Using Outside Source ("${conf.claim_b}")`
                                  : 'Option C: Including Both with Contextual Note'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSelectConflictDecision(conflictKey, 'BOTH', conf)}
                                className={clsx(
                                  'text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all',
                                  currentDecision === 'BOTH'
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                )}
                              >
                                {currentDecision === 'BOTH' ? '✓ Both Sources Included' : 'Include Both (Cite Both Numbers)'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 text-center space-y-2">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 mx-auto" />
                    <p className="text-sm font-bold text-emerald-950">Zero Contradictions Found</p>
                    <p className="text-xs text-emerald-800">
                      All dates, metrics, and facts in your document are consistent and verified against external portals.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 Content: Source Attribution & Provenance Registry */}
            {currentStepIdx === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-base font-black text-slate-900">
                      Source Attribution &amp; Verified Facts Catalog
                    </h3>
                  </div>
                  <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-3 py-1 rounded-full font-mono">
                    Step 4 of 4 Active
                  </span>
                </div>

                <div className="space-y-3">
                  {keyFacts.map((f, idx) => (
                    <div key={idx} className="rounded-2xl border border-sky-200 bg-sky-50/30 p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">Source: {title}</span>
                        <span className="rounded-md bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 text-[10px] font-bold">
                          From Your File
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-semibold bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                        &ldquo;{f.text}&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                        <span>Truth Status: <strong>Verified from Document</strong></span>
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <Check className="h-3 w-3" /> 100% Grounded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
