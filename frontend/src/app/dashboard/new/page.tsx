'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  UploadCloud,
  FileText,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Eye,
  Send,
  Linkedin,
  Twitter,
  Image as ImageIcon,
  Presentation,
  Video,
  FileCode,
  Layers,
  Check,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Clock,
  ExternalLink,
  Edit3,
  Flame,
  Zap,
  Lock,
  EyeOff,
  FolderKanban,
  Building2,
  Compass,
  FileLock,
  Cpu,
  Database,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, Output, CanonicalAnalysis } from '@/types'
import LiveResearchProgress from '@/components/LiveResearchProgress'
import LiveGenerationProgress from '@/components/LiveGenerationProgress'
import CanonicalViewer from '@/components/CanonicalViewer'
import SlideDeckPreview from '@/components/SlideDeckPreview'
import LinkedInPostCard from '@/components/LinkedInPostCard'
import InfographicCard from '@/components/InfographicCard'
import VideoPackageCard from '@/components/VideoPackageCard'
import TwitterThreadCard from '@/components/TwitterThreadCard'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import PublishModal from '@/components/PublishModal'
import ExportDropdown from '@/components/ExportDropdown'
import QualityRadarCard from '@/components/QualityRadarCard'
import FactCheckPanel from '@/components/FactCheckPanel'
import AIEditorModal from '@/components/AIEditorModal'
import ManualEditorModal from '@/components/ManualEditorModal'
import BlockchainVerificationCard from '@/components/BlockchainVerificationCard'
import clsx from 'clsx'

const OUTPUT_OPTIONS = [
  {
    id: 'executive_summary',
    label: 'Executive Dossier',
    desc: '3-page comprehensive briefing with risk matrices & telemetry',
    icon: FileText,
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    cardBg: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50/40',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Executive Post',
    desc: 'High-engagement thought-leadership post with hashtags & hero visual',
    icon: Linkedin,
    color: 'text-sky-700',
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    cardBg: 'bg-gradient-to-br from-sky-50 via-white to-indigo-50/40',
  },
  {
    id: 'presentation',
    label: 'Interactive Slide Deck',
    desc: 'Multi-slide presentation deck with SVG diagrams & Speaker Notes',
    icon: Presentation,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    cardBg: 'bg-gradient-to-br from-purple-50 via-white to-pink-50/40',
  },
  {
    id: 'infographic',
    label: 'Visual Infographic Asset',
    desc: 'High-resolution diagram with structured statistics & visual synthesis',
    icon: ImageIcon,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    cardBg: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50/40',
  },
  {
    id: 'video_package',
    label: 'Video Script & Production Package',
    desc: 'Scene-by-scene script with visual cues & audio narrator prompts',
    icon: Video,
    color: 'text-rose-700',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    cardBg: 'bg-gradient-to-br from-rose-50 via-white to-orange-50/40',
  },
  {
    id: 'advisory',
    label: 'Technical Security Advisory',
    desc: 'CERT-standard structured bulletin with CVSS scores & IoCs',
    icon: ShieldCheck,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    cardBg: 'bg-gradient-to-br from-amber-50 via-white to-yellow-50/40',
  },
  {
    id: 'twitter',
    label: 'X / Twitter Social Thread',
    desc: 'Multi-tweet sequential breakdown strictly formatted under 280 chars',
    icon: Twitter,
    color: 'text-sky-600',
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    cardBg: 'bg-gradient-to-br from-cyan-50 via-white to-sky-50/40',
  },
]

function NewTransformationStudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')

  // Wizard Step Control (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Step 1 Form States
  const [projectTitle, setProjectTitle] = useState('')
  const [organizationName, setOrganizationName] = useState('Acme Global Operations')
  const [domain, setDomain] = useState('Auto-Detect')
  const [researchMode, setResearchMode] = useState<'SOURCE_ONLY' | 'SOURCE_AND_VERIFY' | 'DEEP_RESEARCH'>('SOURCE_AND_VERIFY')
  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'url'>('upload')
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [crawlSubpages, setCrawlSubpages] = useState<boolean>(true)
  const [maxCrawlPages, setMaxCrawlPages] = useState<number>(8)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessingSource, setIsProcessingSource] = useState(false)

  // Execution & Project State
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [canonical, setCanonical] = useState<CanonicalAnalysis | null>(null)

  // Step 4: Multi-Format Configuration States
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'executive_summary',
    'linkedin',
    'presentation',
    'infographic',
    'video_package',
    'advisory',
    'twitter',
  ])
  const [audience, setAudience] = useState('Executive Board & Technical Engineers')
  const [tone, setTone] = useState('Professional & Authoritative')
  const [language, setLanguage] = useState('English')
  const [detailLevel, setDetailLevel] = useState('Detailed & Comprehensive')

  // Step 5 & 6: Generated Deliverables
  const [isExecutingAI, setIsExecutingAI] = useState(false)
  const [generatedOutputs, setGeneratedOutputs] = useState<Output[]>([])
  const [activeOutputTab, setActiveOutputTab] = useState<string>('executive_summary')

  // Modals
  const [publishModalOutput, setPublishModalOutput] = useState<Output | null>(null)
  const [editorModalOutput, setEditorModalOutput] = useState<Output | null>(null)
  const [manualEditorModalOutput, setManualEditorModalOutput] = useState<Output | null>(null)

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('contex_ai_settings')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.orgName) setOrganizationName(data.orgName)
        if (data.domain && !templateParam) setDomain(data.domain)
        if (data.defaultAudience && !templateParam) setAudience(data.defaultAudience)
        if (data.defaultTone && !templateParam) setTone(data.defaultTone)
        if (data.defaultLanguage) setLanguage(data.defaultLanguage)
        if (data.defaultDetailLevel) setDetailLevel(data.defaultDetailLevel)
      }
    } catch {}
  }, [])

  // Handle Preset Template prefilling
  useEffect(() => {
    if (templateParam) {
      if (templateParam === 'cyber_advisory') {
        setProjectTitle('DarkHydra Ransomware Threat Advisory & Containment Protocol')
        setDomain('Cybersecurity')
        setAudience('Government Cyber Regulators & IT Teams')
        setTone('Urgent & Authoritative')
        setSelectedFormats(['advisory', 'linkedin', 'presentation', 'infographic', 'video_package'])
      } else if (templateParam === 'exec_brief') {
        setProjectTitle('Q3 Enterprise Digital Resilience Strategic Briefing')
        setDomain('Leadership & Strategy')
        setAudience('Executive Board & C-Suite')
        setTone('Formal & Strategic')
        setSelectedFormats(['executive_summary', 'presentation', 'infographic', 'twitter'])
      }
    }
  }, [templateParam])

  // STEP 1 ACTION: Ingest Document & Run Canonical Analysis
  const handleCreateProjectAndIngest = async () => {
    try {
      setIsProcessingSource(true)

      let sourceContent = pasteText

      if (inputTab === 'upload' && selectedFile) {
        sourceContent = await selectedFile.text()
      } else if (inputTab === 'url' && urlInput) {
        sourceContent = `URL Reference: ${urlInput}\nTarget Analysis Domain: ${domain}`
      }

      if (!sourceContent.trim()) {
        sourceContent =
          'CRITICAL INCIDENT REPORT: Project Titan Containment Directive\n' +
          'Date: 2026-08-29 08:30 UTC\n' +
          'Scope: 500 endpoints isolated within 42 minutes. Zero data exfiltration verified via EDR telemetry. CVSS 8.8 vulnerability mitigated via emergency patch v4.2.1.'
      }

      const proj = await api.createProject({
        title: projectTitle.trim() || 'Verified Transformation Project',
        description: `Single-Truth canonical pipeline for ${organizationName || 'Enterprise'}.`,
        domain: domain,
        organization_name: organizationName,
        research_mode: researchMode,
      })

      setActiveProject(proj)

      let sourceObj: any = null
      if (inputTab === 'upload' && selectedFile) {
        sourceObj = await api.uploadSourceFile(proj.id, selectedFile)
      } else if (inputTab === 'url' && urlInput) {
        sourceObj = await api.scrapeUrl(proj.id, urlInput, {
          crawl_subpages: crawlSubpages,
          max_pages: maxCrawlPages,
        })
      } else {
        sourceObj = await api.pasteSourceText(
          proj.id,
          projectTitle || 'Incident Report',
          sourceContent
        )
      }

      const canonicalData = await api.analyzeSource(sourceObj.id, undefined, researchMode)
      setCanonical(canonicalData)
      setCurrentStep(2)
    } catch (err: any) {
      alert(`Ingestion failed: ${err.message}`)
    } finally {
      setIsProcessingSource(false)
    }
  }

  // STEP 4 ACTION: Execute AI Multi-Format Generation
  const handleExecuteTransformation = async () => {
    if (!activeProject || !canonical) return
    try {
      setIsExecutingAI(true)
      setCurrentStep(5)

      const res = await api.createTransformation(activeProject.id, {
        canonical_id: canonical.id,
        target_audience: audience,
        tone: tone,
        language: language,
        detail_level: detailLevel,
        communication_objective: 'Multi-channel enterprise distribution',
        content_style: 'Structured',
        research_mode: researchMode,
        requested_formats: selectedFormats,
      })

      setGeneratedOutputs(res.outputs)
      if (res.outputs.length > 0) {
        setActiveOutputTab(res.outputs[0].format_type)
      }
    } catch (err: any) {
      alert(`Transformation failed: ${err.message}`)
      setCurrentStep(4)
    } finally {
      setIsExecutingAI(false)
    }
  }

  const toggleFormat = (fmtId: string) => {
    if (selectedFormats.includes(fmtId)) {
      if (selectedFormats.length === 1) return
      setSelectedFormats(selectedFormats.filter((f) => f !== fmtId))
    } else {
      setSelectedFormats([...selectedFormats, fmtId])
    }
  }

  const handleApproval = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeOutput) return
    try {
      const updated =
        action === 'APPROVE'
          ? await api.approveOutput(activeOutput.id, 'Approved by operator')
          : await api.rejectOutput(activeOutput.id, 'Rejected by operator')

      let publishNotice = ''
      if (action === 'APPROVE') {
        try {
          const targetPlatform = activeOutput.format_type === 'linkedin' ? 'linkedin' : (activeOutput.format_type === 'twitter' ? 'twitter' : 'n8n')
          await api.publishToN8n(activeOutput.id, targetPlatform)
          updated.status = 'PUBLISHED'
          publishNotice = ' & Dispatched to n8n Social Media Publisher'
        } catch (publishErr: any) {
          console.warn('n8n auto-publish dispatch:', publishErr)
          updated.status = 'APPROVED'
        }

        if (activeOutput.format_type === 'linkedin') {
          const cleanText = (activeOutput.raw_content || '')
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
          try {
            await navigator.clipboard.writeText(cleanText)
          } catch (e) {}
        }
      }

      setGeneratedOutputs((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
      )

      if (action === 'APPROVE') {
        if (activeOutput.format_type === 'linkedin') {
          const shouldOpen = window.confirm(
            `✅ LinkedIn Post Approved${publishNotice}!\n\n` +
            `The post text (with hashtags) is copied to your clipboard.\n\n` +
            `Would you like to open LinkedIn in a new tab now to publish directly?`
          )
          if (shouldOpen) {
            const cleanText = (activeOutput.raw_content || '')
              .replace(/\r\n/g, '\n')
              .replace(/\n{3,}/g, '\n\n')
              .trim()
            const encoded = encodeURIComponent(cleanText)
            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`, '_blank', 'noopener,noreferrer')
          }
        } else {
          alert(`✅ Deliverable Approved${publishNotice}!`)
        }
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`)
    }
  }

  const activeOutput = generatedOutputs.find((o) => o.format_type === activeOutputTab)

  const stepsList = [
    { step: 1, label: 'Ingestion & Security', icon: UploadCloud, color: 'text-indigo-600', activeBg: 'from-indigo-600 to-indigo-700' },
    { step: 2, label: 'Research & Conflicts', icon: Search, color: 'text-sky-600', activeBg: 'from-sky-600 to-blue-700' },
    { step: 3, label: 'Canonical Truth', icon: FileText, color: 'text-purple-600', activeBg: 'from-purple-600 to-violet-700' },
    { step: 4, label: 'Formats & Brand', icon: Sliders, color: 'text-pink-600', activeBg: 'from-pink-600 to-rose-700' },
    { step: 5, label: 'AI Generation', icon: Sparkles, color: 'text-amber-600', activeBg: 'from-amber-600 to-orange-700' },
    { step: 6, label: 'Output Studio', icon: Send, color: 'text-emerald-600', activeBg: 'from-emerald-600 to-teal-700' },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto w-full">
      {/* ========================================================================= */}
      {/* COLORFUL INTERACTIVE TIMELINE STEPPER                                     */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-sky-50/70 backdrop-blur-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-3">
          {stepsList.map((s) => {
            const Icon = s.icon
            const isCurrent = currentStep === s.step
            const isPassed = currentStep > s.step

            return (
              <div
                key={s.step}
                className={clsx(
                  'flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition-all duration-300 shrink-0 select-none border',
                  isCurrent
                    ? `bg-gradient-to-r ${s.activeBg} text-white shadow-md shadow-indigo-600/30 border-transparent`
                    : isPassed
                    ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                    : 'bg-white/80 text-slate-600 border-slate-200 shadow-2xs'
                )}
              >
                <div
                  className={clsx(
                    'flex h-6 w-6 items-center justify-center rounded-xl text-xs font-black shrink-0 transition-transform',
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  )}
                >
                  {isPassed ? <Check className="h-3.5 w-3.5" /> : s.step}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon className={clsx('h-3.5 w-3.5', isCurrent ? 'text-white' : isPassed ? 'text-emerald-700' : s.color)} />
                  <span className="text-xs font-bold whitespace-nowrap">
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: MULTI-COLOR INGESTION & SECURITY GATE                            */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Card 1: Modern Header Spotlight with Sunset-Indigo Mesh */}
          <div className="rounded-3xl border-2 border-indigo-200/90 bg-gradient-to-r from-indigo-100/90 via-purple-100/70 to-sky-100/90 p-7 sm:p-9 space-y-3 shadow-md relative overflow-hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-indigo-200 px-3.5 py-1 text-xs font-black text-indigo-900 font-mono uppercase tracking-wider shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Step 1 of 6 • Multimodal Ingestion Gate
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ingest Source Material &amp; Configure Research
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-3xl">
              Upload any PDF, Word document, plain text, or article URL. The engine extracts the text, applies prompt injection defense, and formulates research queries.
            </p>
          </div>

          {/* Card 2: Incident & Organizational Metadata (Lavender-Indigo Tint) */}
          <div className="rounded-3xl card-indigo-tint p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-indigo-200/60 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Project &amp; Organizational Details</h3>
                <p className="text-xs text-slate-600 font-medium">Assign a project title and organization name to establish corporate branding context.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Project Title / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mic On Campus / Strategic Brief"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 shadow-2xs font-semibold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Organization / Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Media / Acme Corporation"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 shadow-2xs font-semibold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Industry Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 shadow-2xs font-semibold transition-all cursor-pointer"
                >
                  <option value="Auto-Detect">✨ Auto-Detect (From Document)</option>
                  <option value="Media & Podcast">🎙️ Media &amp; Podcast</option>
                  <option value="Business & Strategy">💼 Business &amp; Strategy</option>
                  <option value="Cybersecurity">🛡️ Cybersecurity</option>
                  <option value="Education & Academia">🎓 Education &amp; Academia</option>
                  <option value="Healthcare & Medicine">🏥 Healthcare &amp; Medicine</option>
                  <option value="Finance & Banking">📈 Finance &amp; Banking</option>
                  <option value="Legal & Compliance">⚖️ Legal &amp; Compliance</option>
                  <option value="Energy & Technology">⚡ Energy &amp; Technology</option>
                  <option value="General Enterprise">🏢 General Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Research Mode Selection (3 Distinct Color Modes) */}
          <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50/60 via-white to-pink-50/40 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-purple-200/60 pb-3">
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-xs">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Select Automated Research Engine Mode</h3>
                <p className="text-xs text-slate-600 font-medium">Choose how rigorously the engine should verify claims and research external authoritative tiers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {[
                {
                  id: 'SOURCE_ONLY',
                  label: 'Source Only',
                  badge: 'Strict Sandbox',
                  desc: 'Strictly bounds knowledge synthesis to uploaded document.',
                  icon: FileLock,
                  themeBg: 'card-sky-tint',
                  activeBorder: 'border-sky-500',
                  iconColor: 'bg-sky-500 text-white',
                  badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
                },
                {
                  id: 'SOURCE_AND_VERIFY',
                  label: 'Source & Verify',
                  badge: 'Recommended',
                  desc: 'Queries authoritative external tiers (CISA, CERT) to cross-verify claims.',
                  icon: ShieldCheck,
                  themeBg: 'card-indigo-tint',
                  activeBorder: 'border-indigo-600',
                  iconColor: 'bg-indigo-600 text-white',
                  badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                },
                {
                  id: 'DEEP_RESEARCH',
                  label: 'Deep Research',
                  badge: 'Comprehensive',
                  desc: 'Multi-query discovery across all 8 source hierarchy tiers.',
                  icon: Compass,
                  themeBg: 'card-emerald-tint',
                  activeBorder: 'border-emerald-500',
                  iconColor: 'bg-emerald-500 text-white',
                  badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                },
              ].map((mode) => {
                const Icon = mode.icon
                const isSel = researchMode === mode.id
                return (
                  <div
                    key={mode.id}
                    onClick={() => setResearchMode(mode.id as any)}
                    className={clsx(
                      'p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 space-y-2 flex flex-col justify-between group',
                      mode.themeBg,
                      isSel
                        ? `${mode.activeBorder} shadow-lg scale-[1.02]`
                        : 'border-slate-200/80 hover:border-slate-400 hover:shadow-xs'
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={clsx('p-2.5 rounded-xl shadow-xs', mode.iconColor)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {isSel ? (
                          <span className="flex items-center gap-1 text-[11px] font-black text-indigo-950 bg-white border border-indigo-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" /> Selected
                          </span>
                        ) : (
                          <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', mode.badgeBg)}>
                            {mode.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {mode.label}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {mode.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 4: Source Material Input (Sky Tint) */}
          <div className="rounded-3xl card-sky-tint p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-sky-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-xs">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">3. Provide Source Content</h3>
                  <p className="text-xs text-slate-600 font-medium">Choose a file, paste raw text, or enter an article URL.</p>
                </div>
              </div>

              {/* Input Selection Tabs */}
              <div className="flex gap-1.5 bg-white/90 p-1 rounded-2xl border border-sky-200 shadow-2xs">
                {[
                  { id: 'upload', label: 'File Upload', icon: UploadCloud },
                  { id: 'paste', label: 'Paste Text', icon: FileText },
                  { id: 'url', label: 'Web URL', icon: Globe },
                ].map((t) => {
                  const Icon = t.icon
                  const isSel = inputTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setInputTab(t.id as any)}
                      className={clsx(
                        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                        isSel
                          ? 'bg-sky-600 text-white shadow-xs font-extrabold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* File Upload Box */}
            {inputTab === 'upload' && (
              <div className="rounded-3xl border-2 border-dashed border-sky-300 p-8 sm:p-12 text-center hover:border-sky-500 hover:bg-sky-100/30 transition-all bg-white/80 relative group">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 shadow-xs mx-auto group-hover:scale-110 group-hover:border-sky-400 transition-all">
                  <UploadCloud className="h-7 w-7 text-sky-600" />
                </div>
                <p className="text-base font-bold text-slate-800 mt-4">
                  Drag &amp; drop your source document here, or click to browse
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">PDF</span>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">DOCX</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">TXT</span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">Markdown</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">Images</span>
                </div>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-5 text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-500 file:shadow-xs cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs text-emerald-900 font-bold shadow-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                )}
              </div>
            )}

            {/* Text Paste Box */}
            {inputTab === 'paste' && (
              <textarea
                rows={8}
                placeholder="Paste your source document text, research notes, meeting transcript, or operational briefing here..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/15 shadow-2xs font-mono transition-all leading-relaxed"
              />
            )}

            {/* URL Input Box */}
            {inputTab === 'url' && (
              <div className="space-y-3.5">
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://example.in or https://company.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/15 shadow-2xs font-medium transition-all"
                  />
                  <p className="text-xs text-slate-600 font-medium">
                    Protected by SSRF security firewall &amp; prompt injection sanitizer.
                  </p>
                </div>

                {/* Multi-Page Deep Crawling Options */}
                <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 via-indigo-50/30 to-purple-50/30 p-4 sm:p-4.5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900">Deep Website Crawl (Root + Subpages)</span>
                        <span className="ml-2 text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200">
                          Auto-Discovery
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crawlSubpages}
                        onChange={(e) => setCrawlSubpages(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    When enabled, the crawler automatically discovers and aggregates content from all internal subpages (e.g.{' '}
                    <span className="font-mono text-sky-800 font-semibold">/about</span>,{' '}
                    <span className="font-mono text-sky-800 font-semibold">/services</span>,{' '}
                    <span className="font-mono text-sky-800 font-semibold">/pricing</span>,{' '}
                    <span className="font-mono text-sky-800 font-semibold">/team</span>,{' '}
                    <span className="font-mono text-sky-800 font-semibold">/docs</span>) within the same domain.
                  </p>

                  {crawlSubpages && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-sky-200/60 text-xs">
                      <span className="text-slate-700 font-bold">Max Subpages to Ingest:</span>
                      <div className="flex items-center gap-1.5">
                        {[4, 8, 12, 16].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMaxCrawlPages(num)}
                            className={clsx(
                              'px-3 py-1 rounded-xl text-xs font-bold transition-all',
                              maxCrawlPages === num
                                ? 'bg-sky-600 text-white shadow-2xs font-extrabold'
                                : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-100/50'
                            )}
                          >
                            {num} pgs
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Active Security & Sanitization Telemetry (Emerald Tint) */}
          <div className="rounded-3xl card-emerald-tint p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Active Security &amp; Sanitization Gateways</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="rounded-2xl bg-white border border-indigo-200 p-4 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Lock className="h-4 w-4 text-indigo-600" />
                  <span>Prompt Injection Filter</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">Strips hidden jailbreaks &amp; payload overrides before LLM ingestion.</p>
              </div>
              <div className="rounded-2xl bg-white border border-sky-200 p-4 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <ShieldAlert className="h-4 w-4 text-sky-600" />
                  <span>SSRF Defense</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">Blocks internal loopbacks and private subnet crawling.</p>
              </div>
              <div className="rounded-2xl bg-white border border-purple-200 p-4 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <EyeOff className="h-4 w-4 text-purple-600" />
                  <span>Sensitivity Scanner</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">Auto-masks PII, internal IPs (10.x), and API credentials.</p>
              </div>
            </div>
          </div>

          {/* Card 6: Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreateProjectAndIngest}
              disabled={isProcessingSource}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500 px-9 py-4 text-sm font-black text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isProcessingSource ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Ingesting &amp; Running Research Engine...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Step 2: Research &amp; Fact-Checking</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: LIVE RESEARCH & FACT-CHECKING                                  */}
      {/* ========================================================================= */}
      {currentStep === 2 && canonical && (
        <div className="space-y-6">
          <LiveResearchProgress
            canonical={canonical}
            researchMode={researchMode}
            onComplete={() => setCurrentStep(3)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: VERIFIED SINGLE-TRUTH KNOWLEDGE BASE                           */}
      {/* ========================================================================= */}
      {currentStep === 3 && canonical && (
        <div className="space-y-6">
          <CanonicalViewer canonical={canonical} />

          {/* Proceed Navigation Bar */}
          <div className="flex items-center justify-between p-6 rounded-3xl bg-white border border-indigo-200 shadow-xs">
            <button
              onClick={() => setCurrentStep(2)}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Step 2: Research &amp; Conflicts</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 transition-all active:scale-95"
            >
              <span>Proceed to Step 4: Choose Formats &amp; Audience</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: FORMAT ORCHESTRATION & BRAND PROFILE                            */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 space-y-8 shadow-xs">
            <div>
              <span className="text-xs font-black uppercase text-indigo-700 tracking-wider font-mono">
                STEP 4 OF 6 • MULTI-FORMAT ORCHESTRATOR &amp; AUDIENCE CALIBRATION
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Configure Target Audience &amp; Select Deliverables
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Transform the single Canonical Knowledge foundation into multiple audience-calibrated formats in parallel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Target Audience Profile
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Executive Board & Technical Engineers">Executive Board &amp; Technical Engineers</option>
                  <option value="Executive Board & C-Suite">Executive Board &amp; C-Suite</option>
                  <option value="Government Officials & Regulators">Government Officials &amp; Regulators</option>
                  <option value="Technical Security Engineers">Technical Security Engineers</option>
                  <option value="General Public & Media">General Public &amp; Media</option>
                  <option value="Enterprise Customers & Partners">Enterprise Customers &amp; Partners</option>
                </select>
              </div>

              {/* Communication Tone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Tone &amp; Style
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Professional & Authoritative">Professional &amp; Authoritative</option>
                  <option value="Formal & Authoritative">Formal &amp; Authoritative</option>
                  <option value="Technical & Precise">Technical &amp; Precise</option>
                  <option value="Urgent Advisory">Urgent Advisory</option>
                  <option value="Educational & Accessible">Educational &amp; Accessible</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Output Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="English">English</option>
                  <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                  <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                  <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                  <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                </select>
              </div>

              {/* Detail Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Detail Level
                </label>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Detailed & Comprehensive">Detailed &amp; Comprehensive</option>
                  <option value="Medium (Standard)">Medium (Standard)</option>
                  <option value="Short & Punchy">Short &amp; Punchy</option>
                </select>
              </div>
            </div>

            {/* Multi-Color Target Output Format Cards */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-bold text-slate-800 uppercase tracking-wider block">
                  Select Deliverables to Generate ({selectedFormats.length} selected)
                </label>
                <span className="text-xs text-indigo-700 font-bold">
                  Generated simultaneously from identical canonical facts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OUTPUT_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isChecked = selectedFormats.includes(opt.id)
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleFormat(opt.id)}
                      className={clsx(
                        'p-5 rounded-3xl border-2 cursor-pointer select-none transition-all flex items-start gap-4 shadow-xs',
                        opt.cardBg,
                        isChecked
                          ? `${opt.border} shadow-md scale-[1.02]`
                          : 'border-slate-200 hover:border-slate-300 opacity-75'
                      )}
                    >
                      <div
                        className={clsx(
                          'flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors',
                          isChecked ? clsx(opt.bg, opt.color, 'shadow-xs') : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-slate-900">{opt.label}</span>
                          {isChecked && <CheckCircle2 className={clsx('h-4 w-4', opt.color)} />}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{opt.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(3)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Canonical View</span>
              </button>
              <button
                onClick={handleExecuteTransformation}
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 transition-all active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                <span>Generate {selectedFormats.length} Selected Artefacts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: LIVE MULTI-FORMAT AI GENERATION & FACT-CHECKING                 */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <LiveGenerationProgress
            selectedFormats={selectedFormats}
            isBackendReady={!isExecutingAI && generatedOutputs.length > 0}
            onComplete={() => setCurrentStep(6)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 6: PRODUCTION OUTPUT STUDIO (TOP-TO-BOTTOM WORKSPACE)              */}
      {/* ========================================================================= */}
      {currentStep === 6 && generatedOutputs.length === 0 && (
        <div className="rounded-3xl border border-indigo-200 bg-white p-12 sm:p-16 text-center space-y-6 shadow-sm animate-fade-in max-w-2xl mx-auto">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75" />
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="h-7 w-7 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Assembling Production Deliverables Studio...
            </h3>
            <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
              Finalizing multi-format transformations, claim-level fact verification, and blockchain cryptographic registrations.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-full w-fit mx-auto">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
            <span>Populating {selectedFormats.length} output formats...</span>
          </div>
        </div>
      )}

      {currentStep === 6 && generatedOutputs.length > 0 && (
        <div className="space-y-8">
          {/* Format Selection Pills Bar */}
          <div className="flex overflow-x-auto gap-2.5 border-b border-slate-200 pb-4 no-scrollbar">
            {generatedOutputs.map((o) => {
              const isActive = activeOutputTab === o.format_type
              return (
                <button
                  key={o.id}
                  onClick={() => setActiveOutputTab(o.format_type)}
                  className={clsx(
                    'flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold whitespace-nowrap transition-all shadow-xs',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                  )}
                >
                  <span className="capitalize">{o.format_type.replace('_', ' ')}</span>
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px] font-mono font-bold',
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    v{o.version}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Deliverable Workspace */}
          {activeOutput && (
            <div className="space-y-6">
              {/* Deliverable Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
                {/* Header & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold uppercase rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 font-mono">
                        {activeOutput.format_type.toUpperCase()}
                      </span>
                      <span
                        className={clsx(
                          'text-xs font-bold uppercase rounded-md px-2.5 py-0.5 border font-mono',
                          activeOutput.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : activeOutput.status === 'PUBLISHED'
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        )}
                      >
                        {activeOutput.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                      {activeOutput.title || `${activeOutput.format_type} Output`}
                    </h3>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => setManualEditorModalOutput(activeOutput)}
                      className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
                    >
                      <Edit3 className="h-4 w-4 text-indigo-600" />
                      <span>Manual Edit</span>
                    </button>

                    <button
                      onClick={() => setEditorModalOutput(activeOutput)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span>Ask AI to Edit</span>
                    </button>

                    <ExportDropdown
                      outputId={activeOutput.id}
                      content={activeOutput.raw_content}
                      formatType={activeOutput.format_type}
                    />

                    <button
                      onClick={() => setPublishModalOutput(activeOutput)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:from-indigo-500 hover:to-sky-500 transition-all"
                    >
                      <Send className="h-4 w-4" />
                      <span>Publish (n8n)</span>
                    </button>
                  </div>
                </div>

                {/* RAG Knowledge Base Used Citation Banner */}
                {((activeOutput.structured_data?.rag_sources && activeOutput.structured_data.rag_sources.length > 0) ||
                  (canonical?.rag_sources && canonical.rag_sources.length > 0)) && (
                  <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-sky-50/80 p-4 space-y-2 shadow-2xs animate-fade-in">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-indigo-600 animate-pulse" />
                        <span className="text-xs font-black uppercase text-indigo-950 font-mono">
                          Knowledge Base (RAG) Data Applied
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                        Policy &amp; Brand Grounded
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium leading-relaxed">
                      This deliverable was generated using organizational standards retrieved from your Knowledge Base:
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(activeOutput.structured_data?.rag_sources || canonical?.rag_sources || []).map(
                          (sourceName: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-md bg-white border border-indigo-200 text-indigo-900 px-2.5 py-1 text-[11px] font-bold font-mono shadow-2xs flex items-center gap-1"
                            >
                              <span>📚</span>
                              <span>{sourceName}</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Deliverable Content */}
                {activeOutput.format_type === 'presentation' ? (
                  <SlideDeckPreview
                    outputId={activeOutput.id}
                    deckData={activeOutput.structured_data}
                  />
                ) : activeOutput.format_type === 'linkedin' ? (
                  <LinkedInPostCard output={activeOutput} />
                ) : activeOutput.format_type === 'infographic' ? (
                  <InfographicCard output={activeOutput} />
                ) : activeOutput.format_type === 'video_package' ? (
                  <VideoPackageCard
                    structuredData={activeOutput.structured_data}
                    rawContent={activeOutput.raw_content}
                  />
                ) : activeOutput.format_type === 'twitter' ? (
                  <TwitterThreadCard
                    structuredData={activeOutput.structured_data}
                    rawContent={activeOutput.raw_content}
                  />
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                    <StructuredContentRenderer content={activeOutput.raw_content} />
                  </div>
                )}

                {/* Human-in-the-Loop Approval Decision Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/90">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Human-in-the-Loop Governance Sign-Off
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Public publishing strictly requires explicit human operator certification.
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleApproval('REJECT')}
                      className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproval('APPROVE')}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Output</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Blockchain Cryptographic Verification & Tamper Detection */}
              <BlockchainVerificationCard
                output={activeOutput}
                onContentUpdated={(newText) => {
                  setGeneratedOutputs((prev) =>
                    prev.map((o) => (o.id === activeOutput.id ? { ...o, raw_content: newText } : o))
                  )
                }}
              />

              {/* Fact Check Inspection Panel */}
              <FactCheckPanel factCheck={activeOutput.fact_check} />

              {/* Quality Radar Card */}
              <QualityRadarCard qualityScore={activeOutput.quality_score} />
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {manualEditorModalOutput && (
        <ManualEditorModal
          output={manualEditorModalOutput}
          isOpen={!!manualEditorModalOutput}
          onClose={() => setManualEditorModalOutput(null)}
          onUpdated={(updated) => {
            setGeneratedOutputs((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            )
            setManualEditorModalOutput(null)
          }}
        />
      )}

      {editorModalOutput && (
        <AIEditorModal
          output={editorModalOutput}
          isOpen={!!editorModalOutput}
          onClose={() => setEditorModalOutput(null)}
          onUpdated={(updated) => {
            setGeneratedOutputs((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            )
            setEditorModalOutput(updated)
          }}
        />
      )}

      {publishModalOutput && (
        <PublishModal
          output={publishModalOutput}
          isOpen={!!publishModalOutput}
          onClose={() => setPublishModalOutput(null)}
          onPublished={() => {
            setPublishModalOutput(null)
            if (activeProject) {
              api.getProject(activeProject.id).then((p) => setGeneratedOutputs(p.outputs || []))
            }
          }}
        />
      )}
    </div>
  )
}

export default function NewTransformationStudio() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading Transformation Studio...</div>}>
      <NewTransformationStudioContent />
    </React.Suspense>
  )
}
