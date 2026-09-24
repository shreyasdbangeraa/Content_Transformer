'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Send,
  Linkedin,
  Twitter,
  Image as ImageIcon,
  Presentation,
  Video,
  Layers,
  Check,
  RefreshCw,
  Sliders,
  Clock,
  ExternalLink,
  Edit3,
  Lock,
  FolderKanban,
  Building2,
  Link2,
  LayoutGrid,
  Share2,
  MoreVertical,
  Folder,
  Plus,
  PlayCircle,
  FileEdit,
  X,
  Database,
  Target,
  Palette,
  Compass,
  BookOpen,
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
    label: 'Exclusive Summary',
    desc: 'High-signal document summary (250–500 words) answering "What is this document about?"',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    cardBg: 'bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40',
  },
  {
    id: 'presentation',
    label: 'Interactive Slide Deck',
    desc: 'Multi-slide presentation deck with structured bullet points & speaker notes',
    icon: Presentation,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    cardBg: 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Executive Post',
    desc: 'High-engagement thought-leadership post with pillars, hook & hashtags',
    icon: Linkedin,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    cardBg: 'bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40',
  },
  {
    id: 'advisory',
    label: 'Executive Advisory',
    desc: 'Decision-support briefing with findings, implications & actionable next steps',
    icon: ShieldCheck,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    cardBg: 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40',
  },
  {
    id: 'infographic',
    label: 'Visual Infographic Asset',
    desc: 'Visual structure with metrics, data flow architecture & strategic takeaways',
    icon: LayoutGrid,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-400',
    cardBg: 'bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40',
  },
  {
    id: 'video_package',
    label: 'Video Script & Production Package',
    desc: 'Scene-by-scene script with timestamps, visual cues & narrator instructions',
    icon: Video,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    cardBg: 'bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40',
  },
  {
    id: 'twitter',
    label: 'X / Twitter Social Thread',
    desc: 'Numbered multi-tweet breakdown strictly formatted under 280 characters',
    icon: Twitter,
    color: 'text-slate-900',
    bg: 'bg-slate-100',
    border: 'border-slate-400',
    cardBg: 'bg-gradient-to-br from-slate-50 via-white to-sky-50/40',
  },
]

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    if (diffMs < 0 || isNaN(diffMs)) return 'Just now'

    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}

function NewTransformationStudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')

  // 4-Step Wizard: 1: Ingestion & Security, 2: Research & Verification, 3: Choose Format, 4: Generate
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Step 1 Form States
  const [projectTitle, setProjectTitle] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [domain, setDomain] = useState('Auto-Detect')
  const [researchMode, setResearchMode] = useState<'SOURCE_ONLY' | 'SOURCE_AND_VERIFY' | 'DEEP_RESEARCH'>('SOURCE_AND_VERIFY')
  const [inputTab, setInputTab] = useState<'upload' | 'url' | 'paste'>('upload')
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [crawlSubpages, setCrawlSubpages] = useState<boolean>(true)
  const [maxCrawlPages, setMaxCrawlPages] = useState<number>(8)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessingSource, setIsProcessingSource] = useState(false)

  // Execution & Project State
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [canonical, setCanonical] = useState<CanonicalAnalysis | null>(null)

  // Step 3: Multi-Format Configuration States
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'executive_summary',
    'presentation',
    'linkedin',
    'advisory',
    'infographic',
    'video_package',
    'twitter',
  ])
  const [audience, setAudience] = useState('Executive Board & Technical Engineers')
  const [tone, setTone] = useState('Professional & Authoritative')
  const [language, setLanguage] = useState('English')
  const [detailLevel, setDetailLevel] = useState('Detailed & Comprehensive')
  const [communicationObjective, setCommunicationObjective] = useState('Multi-channel enterprise distribution')
  const [contentStyle, setContentStyle] = useState('Corporate & Government Advisory')

  // Step 4: Generated Deliverables & Live Translations
  const [isExecutingAI, setIsExecutingAI] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [generatedOutputs, setGeneratedOutputs] = useState<Output[]>([])
  const [activeOutputTab, setActiveOutputTab] = useState<string>('executive_summary')

  // Modals
  const [publishModalOutput, setPublishModalOutput] = useState<Output | null>(null)
  const [editorModalOutput, setEditorModalOutput] = useState<Output | null>(null)
  const [manualEditorModalOutput, setManualEditorModalOutput] = useState<Output | null>(null)

  // Live Recent Pipelines Table Data
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [loadingPipelines, setLoadingPipelines] = useState<boolean>(true)

  useEffect(() => {
    api
      .listProjects()
      .then((data) => setRecentProjects(data || []))
      .catch(() => setRecentProjects([]))
      .finally(() => setLoadingPipelines(false))
  }, [])

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
        if (data.defaultObjective) setCommunicationObjective(data.defaultObjective)
        if (data.defaultContentStyle) setContentStyle(data.defaultContentStyle)
      }
    } catch {}
  }, [templateParam])

  // Handle Preset Template prefilling
  useEffect(() => {
    if (templateParam) {
      if (templateParam === 'cyber_advisory') {
        setProjectTitle('Threat Advisory & System Resilience Briefing')
        setDomain('Cybersecurity')
        setAudience('Enterprise Leadership & Technical Teams')
        setTone('Urgent & Authoritative')
        setSelectedFormats(['advisory', 'linkedin', 'presentation', 'infographic', 'video_package'])
      } else if (templateParam === 'exec_brief') {
        setProjectTitle('Enterprise Strategic & Operations Briefing')
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

      if (inputTab === 'upload' && !selectedFile) {
        alert('Please select a file to upload (PDF, DOCX, PPT, XLS, or image).')
        setIsProcessingSource(false)
        return
      }

      if (inputTab === 'url' && !urlInput.trim()) {
        alert('Please enter a valid website URL.')
        setIsProcessingSource(false)
        return
      }

      if (inputTab === 'paste' && !pasteText.trim()) {
        alert('Please paste or enter your source document text.')
        setIsProcessingSource(false)
        return
      }

      const defaultTitle =
        selectedFile?.name.replace(/\.[^/.]+$/, '') ||
        (urlInput ? urlInput.replace(/^https?:\/\//, '').split('/')[0] : 'Transformation Project')

      const proj = await api.createProject({
        title: projectTitle.trim() || defaultTitle,
        description: `Single-Truth canonical pipeline for ${organizationName || 'Enterprise'}.`,
        domain: domain,
        organization_name: organizationName || 'Enterprise',
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
          projectTitle.trim() || 'Source Document',
          pasteText
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

  // STEP 3 ACTION: Execute AI Multi-Format Generation
  const handleExecuteTransformation = async () => {
    if (!activeProject || !canonical) return
    try {
      setIsExecutingAI(true)
      setCurrentStep(4)

      const res = await api.createTransformation(activeProject.id, {
        canonical_id: canonical.id,
        target_audience: audience,
        tone: tone,
        language: language,
        detail_level: detailLevel,
        communication_objective: communicationObjective,
        content_style: contentStyle,
        research_mode: researchMode,
        requested_formats: selectedFormats,
      })

      setGeneratedOutputs(res.outputs)
      if (res.outputs.length > 0) {
        setActiveOutputTab(res.outputs[0].format_type)
      }
    } catch (err: any) {
      alert(`Transformation failed: ${err.message}`)
      setCurrentStep(3)
    } finally {
      setIsExecutingAI(false)
    }
  }

  // STEP 4 ACTION: On-Demand Deliverable Translation (e.g. Kannada, Hindi, etc.)
  const handleTranslateOutput = async (targetLang: string) => {
    if (!activeOutput || !targetLang) return
    try {
      setIsTranslating(true)
      const updated = await api.translateOutput(activeOutput.id, targetLang)
      setGeneratedOutputs((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      )
    } catch (err: any) {
      alert(`Translation failed: ${err.message}`)
    } finally {
      setIsTranslating(false)
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
          const targetPlatform =
            activeOutput.format_type === 'linkedin'
              ? 'linkedin'
              : activeOutput.format_type === 'twitter'
              ? 'twitter'
              : 'n8n'
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
            window.open(
              `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
              '_blank',
              'noopener,noreferrer'
            )
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

  // Map live recent projects for bottom table
  const pipelinesToDisplay = recentProjects.map((p) => {
    const isPdf =
      p.source_types?.includes('pdf') ||
      p.first_source_name?.toLowerCase().endsWith('.pdf')
    const isDoc =
      p.source_types?.includes('docx') ||
      p.source_types?.includes('txt') ||
      p.source_types?.includes('text_paste')
    const isWeb =
      p.source_types?.includes('url') ||
      (p.title && (p.title.startsWith('http://') || p.title.startsWith('https://')))
    const isImg = p.source_types?.includes('image')

    const iconType = isPdf ? 'pdf' : isWeb ? 'link' : isImg ? 'image' : 'doc'

    let subtitle = ''
    if (isPdf) {
      const pages = p.first_source_pages || 1
      subtitle = `PDF • ${pages} page${pages > 1 ? 's' : ''}`
    } else if (isWeb) {
      subtitle = `Web • ${p.sources_count || 1} source${(p.sources_count || 1) > 1 ? 's' : ''}`
    } else if (isDoc) {
      subtitle = `Text/Doc • ${p.sources_count || 1} source${(p.sources_count || 1) > 1 ? 's' : ''}`
    } else {
      subtitle = `Mixed • ${p.sources_count || 1} source${(p.sources_count || 1) > 1 ? 's' : ''}`
    }

    const sources: string[] = []
    if (isPdf) sources.push('pdf')
    if (isWeb) sources.push('globe')
    if (isDoc) sources.push('doc')
    if (isImg) sources.push('image')
    if (p.sources_count && p.sources_count > 1) {
      sources.push('drive')
    }
    if (sources.length === 0) sources.push('doc')

    const rawOutputs = p.output_formats || []
    const outputs = rawOutputs.map((fmt) => {
      if (fmt === 'executive_summary') return 'summary'
      if (fmt === 'video_package') return 'video'
      return fmt
    })

    const isCompleted = (p.outputs_count || 0) > 0 || p.status === 'COMPLETED'
    const status = isCompleted ? 'Completed' : 'In Progress'

    return {
      id: p.id,
      name: p.title || 'Untitled Project',
      subtitle,
      iconType,
      sources,
      outputs,
      status,
      lastUpdated: formatRelativeTime(p.updated_at || p.created_at),
      projectId: p.id,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            New Transformation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Ingest source documents, ground facts, and generate multi-format deliverables.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4-STEP WIZARD PROGRESS BAR                                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {/* Step 1 */}
          <div className="flex items-center gap-3 relative">
            <div
              className={clsx(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                currentStep === 1
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-300 text-slate-500'
              )}
            >
              {currentStep > 1 ? <Check className="h-4 w-4 stroke-[3]" /> : '1'}
            </div>
            <div className="min-w-0">
              <div
                className={clsx(
                  'text-xs sm:text-sm font-bold truncate',
                  currentStep === 1 ? 'text-blue-600' : 'text-slate-800'
                )}
              >
                Ingestion & Security
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                Add your source
              </div>
            </div>
            <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-200" />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 relative">
            <div
              className={clsx(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                currentStep === 2
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-300 text-slate-500'
              )}
            >
              {currentStep > 2 ? <Check className="h-4 w-4 stroke-[3]" /> : '2'}
            </div>
            <div className="min-w-0">
              <div
                className={clsx(
                  'text-xs sm:text-sm font-bold truncate',
                  currentStep === 2 ? 'text-blue-600' : 'text-slate-800'
                )}
              >
                Research & Verification
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                Find and validate information
              </div>
            </div>
            <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-200" />
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 relative">
            <div
              className={clsx(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                currentStep === 3
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : currentStep > 3
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-300 text-slate-500'
              )}
            >
              {currentStep > 3 ? <Check className="h-4 w-4 stroke-[3]" /> : '3'}
            </div>
            <div className="min-w-0">
              <div
                className={clsx(
                  'text-xs sm:text-sm font-bold truncate',
                  currentStep === 3 ? 'text-blue-600' : 'text-slate-800'
                )}
              >
                Choose Format
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                Select output type
              </div>
            </div>
            <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-200" />
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                currentStep >= 4
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'border border-slate-300 text-slate-500'
              )}
            >
              {currentStep > 4 ? <Check className="h-4 w-4 stroke-[3]" /> : '4'}
            </div>
            <div className="min-w-0">
              <div
                className={clsx(
                  'text-xs sm:text-sm font-bold truncate',
                  currentStep >= 4 ? 'text-blue-600' : 'text-slate-800'
                )}
              >
                Generate
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                Create your content
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STEP 1 CONTAINER: INGESTION & SECURITY                                 */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                1. Ingestion & Security
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Choose how you want to add your information.
              </p>
            </div>
          </div>

          {/* 3 Source Options Grid (Images supported directly inside Upload Document) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Upload Document */}
            <div
              onClick={() => setInputTab('upload')}
              className={clsx(
                'rounded-2xl border p-5 cursor-pointer transition-all flex items-center justify-between group shadow-2xs',
                inputTab === 'upload'
                  ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/10'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                    Upload Document
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                    PDF, DOC, DOCX, PPT, XLS, etc.
                  </div>
                </div>
              </div>
              <ArrowRight
                className={clsx(
                  'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                  inputTab === 'upload' ? 'text-blue-600' : 'text-slate-400'
                )}
              />
            </div>

            {/* Card 2: Add URL */}
            <div
              onClick={() => setInputTab('url')}
              className={clsx(
                'rounded-2xl border p-5 cursor-pointer transition-all flex items-center justify-between group shadow-2xs',
                inputTab === 'url'
                  ? 'border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-500/10'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Link2 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                    Add URL
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                    Web page or article link
                  </div>
                </div>
              </div>
              <ArrowRight
                className={clsx(
                  'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                  inputTab === 'url' ? 'text-emerald-600' : 'text-slate-400'
                )}
              />
            </div>

            {/* Card 3: Paste Text */}
            <div
              onClick={() => setInputTab('paste')}
              className={clsx(
                'rounded-2xl border p-5 cursor-pointer transition-all flex items-center justify-between group shadow-2xs',
                inputTab === 'paste'
                  ? 'border-purple-600 bg-purple-50/20 ring-2 ring-purple-500/10'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileEdit className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate group-hover:text-purple-600 transition-colors">
                    Paste Text
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                    Directly input text content
                  </div>
                </div>
              </div>
              <ArrowRight
                className={clsx(
                  'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                  inputTab === 'paste' ? 'text-purple-600' : 'text-slate-400'
                )}
              />
            </div>
          </div>

          {/* Interactive Source Input Area */}
          <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-4">
            {/* Project Title Field */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Transformation Project Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Enterprise Strategic Report 2026 / Mic on Campus"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all"
              />
            </div>

            {/* If Upload Document */}
            {inputTab === 'upload' && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 p-7 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all bg-white relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-3">
                    Drag and drop your document or image here, or click to browse
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, TXT, PPT, XLS, and image files (JPG, PNG, WEBP)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="mt-4 text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:shadow-xs cursor-pointer"
                  />
                  {selectedFile && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-semibold shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If Add URL */}
            {inputTab === 'url' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Source Web URL
                </label>
                <div className="relative">
                  <Globe className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://example.com/report-or-article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Deep crawl website subpages</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crawlSubpages}
                      onChange={(e) => setCrawlSubpages(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* If Paste Text */}
            {inputTab === 'paste' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Source Document Text / Meeting Notes
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your source text, research findings, briefing notes, or document transcript here..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Security Guarantee Card */}
          <div className="flex items-center gap-2.5 bg-slate-50/70 border border-slate-200/70 rounded-2xl px-4 py-3 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              Your data is encrypted and securely processed. We never store your information beyond the transformation process.
            </span>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleCreateProjectAndIngest}
              disabled={isProcessingSource}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm shadow-blue-500/25 disabled:opacity-50"
            >
              {isProcessingSource ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Ingesting & Verifying...</span>
                </>
              ) : (
                <>
                  <span>Next: Research & Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STEP 2: RESEARCH & VERIFICATION                                       */}
      {/* ========================================================================= */}
      {currentStep === 2 && canonical && (
        <div className="space-y-6">
          <CanonicalViewer canonical={canonical} />

          <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back: Ingestion</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 shadow-sm shadow-blue-500/25 transition-all active:scale-95"
            >
              <span>Next: Choose Format</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STEP 3: CHOOSE FORMAT & AUDIENCE                                      */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              STEP 3 • CHOOSE FORMAT & AUDIENCE
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Select Output Deliverables & Communication Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Transform your verified single source of truth into multiple calibrated formats simultaneously.
            </p>
          </div>

          {/* Format Selection Cards */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Deliverables ({selectedFormats.length} selected)
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
                      'p-5 rounded-2xl border-2 cursor-pointer select-none transition-all flex items-start gap-4 shadow-2xs',
                      opt.cardBg,
                      isChecked
                        ? `${opt.border} ring-2 ring-blue-500/10 scale-[1.01]`
                        : 'border-slate-200 hover:border-slate-300 opacity-75'
                    )}
                  >
                    <div
                      className={clsx(
                        'flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors',
                        isChecked ? clsx(opt.bg, opt.color, 'shadow-2xs') : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                        {isChecked && <CheckCircle2 className={clsx('h-4 w-4', opt.color)} />}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{opt.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Audience & Calibration Settings */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>Audience, Tone & Calibration Parameters</span>
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Customize the target audience, tone, language, detail level, communication objective, and content style.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Target Audience */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <label className="text-xs font-bold text-slate-800">
                    Target Audience
                  </label>
                </div>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="Executive Board & Technical Engineers">Executive Board & Technical Engineers</option>
                  <option value="Executive Board & C-Suite">Executive Board & C-Suite</option>
                  <option value="Government Officials & Regulators">Government Officials & Regulators</option>
                  <option value="Technical Security Engineers">Technical Security Engineers</option>
                  <option value="General Public & Media">General Public & Media</option>
                  <option value="Enterprise Customers & Partners">Enterprise Customers & Partners</option>
                </select>
                <p className="text-[11px] text-slate-400">Determines technical depth & context assumed.</p>
              </div>

              {/* 2. Tone & Style */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  <label className="text-xs font-bold text-slate-800">
                    Tone & Style
                  </label>
                </div>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="Professional & Authoritative">Professional & Authoritative</option>
                  <option value="Formal & Strategic">Formal & Strategic</option>
                  <option value="Technical & Precise">Technical & Precise</option>
                  <option value="Urgent Advisory">Urgent Advisory</option>
                  <option value="Educational & Accessible">Educational & Accessible</option>
                  <option value="Conversational & Engaging">Conversational & Engaging</option>
                </select>
                <p className="text-[11px] text-slate-400">Sets vocabulary, voice, and formality level.</p>
              </div>

              {/* 3. Language Selection (Includes Kannada) */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <label className="text-xs font-bold text-slate-800">
                    Language Selection
                  </label>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="English">English</option>
                  <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                  <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                  <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                  <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                  <option value="Malayalam (മലയാളം)">Malayalam (മലയാളം)</option>
                  <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                  <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                  <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                  <option value="Spanish (Español)">Spanish (Español)</option>
                  <option value="French (Français)">French (Français)</option>
                  <option value="German (Deutsch)">German (Deutsch)</option>
                  <option value="Japanese (日本語)">Japanese (日本語)</option>
                  <option value="Chinese (中文)">Chinese (中文)</option>
                  <option value="Arabic (العربية)">Arabic (العربية)</option>
                  <option value="Portuguese (Português)">Portuguese (Português)</option>
                </select>
                <p className="text-[11px] text-slate-400">Generates calibrated content in target language.</p>
              </div>

              {/* 4. Level of Detail */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-600" />
                  <label className="text-xs font-bold text-slate-800">
                    Level of Detail
                  </label>
                </div>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="Detailed & Comprehensive">Detailed & Comprehensive</option>
                  <option value="Balanced & Informative">Balanced & Informative</option>
                  <option value="Concise Executive Briefing">Concise Executive Briefing</option>
                  <option value="High-Level Summary">High-Level Summary</option>
                  <option value="Technical Deep-Dive">Technical Deep-Dive</option>
                </select>
                <p className="text-[11px] text-slate-400">Controls verbosity and granular facts included.</p>
              </div>

              {/* 5. Communication Objective */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-600" />
                  <label className="text-xs font-bold text-slate-800">
                    Communication Objective
                  </label>
                </div>
                <select
                  value={communicationObjective}
                  onChange={(e) => setCommunicationObjective(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="Multi-channel enterprise distribution">Multi-channel enterprise distribution</option>
                  <option value="Inform & Remediate (Security Event)">Inform & Remediate (Security Event)</option>
                  <option value="Executive Decision & Strategy">Executive Decision & Strategy</option>
                  <option value="Regulatory Compliance & Audit">Regulatory Compliance & Audit</option>
                  <option value="Public Awareness & Media Briefing">Public Awareness & Media Briefing</option>
                  <option value="Product Launch & Marketing">Product Launch & Marketing</option>
                </select>
                <p className="text-[11px] text-slate-400">Defines the primary goal & call to action.</p>
              </div>

              {/* 6. Content Style */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-pink-600" />
                  <label className="text-xs font-bold text-slate-800">
                    Content Style
                  </label>
                </div>
                <select
                  value={contentStyle}
                  onChange={(e) => setContentStyle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="Corporate & Government Advisory">Corporate & Government Advisory</option>
                  <option value="Structured & Analytical">Structured & Analytical</option>
                  <option value="Narrative & Persuasive">Narrative & Persuasive</option>
                  <option value="Action-Oriented Bulleted">Action-Oriented Bulleted</option>
                  <option value="Technical Deep-Dive">Technical Deep-Dive</option>
                  <option value="Educational & Explanatory">Educational & Explanatory</option>
                </select>
                <p className="text-[11px] text-slate-400">Dictates rhetorical structure and formatting format.</p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back: Research</span>
            </button>
            <button
              onClick={handleExecuteTransformation}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 shadow-sm shadow-blue-500/25 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Content</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. STEP 4: GENERATE & OUTPUT STUDIO                                       */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {isExecutingAI && (
            <LiveGenerationProgress
              selectedFormats={selectedFormats}
              isBackendReady={!isExecutingAI && generatedOutputs.length > 0}
              onComplete={() => {}}
            />
          )}

          {!isExecutingAI && generatedOutputs.length > 0 && (
            <div className="space-y-6">
              {/* Deliverable Tabs */}
              <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3 no-scrollbar">
                {generatedOutputs.map((o) => {
                  const isActive = activeOutputTab === o.format_type
                  return (
                    <button
                      key={o.id}
                      onClick={() => setActiveOutputTab(o.format_type)}
                      className={clsx(
                        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
                      )}
                    >
                      <span className="capitalize">{o.format_type.replace('_', ' ')}</span>
                      <span
                        className={clsx(
                          'rounded-full px-1.5 py-0.2 text-[10px]',
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase rounded-md bg-blue-50 text-blue-700 px-2.5 py-0.5">
                            {activeOutput.format_type.toUpperCase()}
                          </span>
                          <span
                            className={clsx(
                              'text-xs font-semibold uppercase rounded-md px-2.5 py-0.5 border',
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
                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                          {activeOutput.title || `${activeOutput.format_type} Output`}
                        </h3>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Translate Language Selector */}
                        <div className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-300 transition-colors">
                          <Globe className={clsx("h-3.5 w-3.5 text-blue-600", isTranslating && "animate-spin")} />
                          <select
                            disabled={isTranslating}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleTranslateOutput(e.target.value)
                                e.target.value = ''
                              }
                            }}
                            defaultValue=""
                            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled>
                              {isTranslating ? 'Translating...' : '🌐 Translate To...'}
                            </option>
                            <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                            <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                            <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                            <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                            <option value="Malayalam (മലയാളം)">Malayalam (മലയാളം)</option>
                            <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                            <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                            <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                            <option value="Spanish (Español)">Spanish (Español)</option>
                            <option value="French (Français)">French (Français)</option>
                            <option value="German (Deutsch)">German (Deutsch)</option>
                            <option value="Japanese (日本語)">Japanese (日本語)</option>
                            <option value="Chinese (中文)">Chinese (中文)</option>
                            <option value="Arabic (العربية)">Arabic (العربية)</option>
                            <option value="Portuguese (Português)">Portuguese (Português)</option>
                            <option value="English">English</option>
                          </select>
                        </div>

                        <button
                          onClick={() => setManualEditorModalOutput(activeOutput)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                          <span>Manual Edit</span>
                        </button>
                        <button
                          onClick={() => setEditorModalOutput(activeOutput)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                          <span>Ask AI to Edit</span>
                        </button>
                        <ExportDropdown
                          outputId={activeOutput.id}
                          content={activeOutput.raw_content}
                          formatType={activeOutput.format_type}
                        />
                        <button
                          onClick={() => setPublishModalOutput(activeOutput)}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Publish</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Renderer */}
                    {activeOutput.format_type === 'presentation' ? (
                      <SlideDeckPreview outputId={activeOutput.id} deckData={activeOutput.structured_data} />
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
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-2xs">
                        <StructuredContentRenderer content={activeOutput.raw_content} />
                      </div>
                    )}

                    {/* Governance Sign-Off */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          Human-in-the-Loop Governance Sign-Off
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Verify outputs before public deployment and multichannel broadcast.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval('REJECT')}
                          className="rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 shadow-2xs transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproval('APPROVE')}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve Output</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <BlockchainVerificationCard
                    output={activeOutput}
                    onContentUpdated={(newText) => {
                      setGeneratedOutputs((prev) =>
                        prev.map((o) => (o.id === activeOutput.id ? { ...o, raw_content: newText } : o))
                      )
                    }}
                  />
                  <FactCheckPanel factCheck={activeOutput.fact_check} />
                  <QualityRadarCard qualityScore={activeOutput.quality_score} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. RECENT TRANSFORMATION PIPELINES TABLE (ONLY ON STARTING STEP)          */}
      {/* ========================================================================= */}
      {currentStep === 1 && generatedOutputs.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Transformation Pipelines
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <th className="py-4 font-semibold">Name</th>
                <th className="py-4 font-semibold">Source(s)</th>
                <th className="py-4 font-semibold">Output Format</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 font-semibold">Last Updated</th>
                <th className="py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingPipelines ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Loading recent transformation pipelines...</span>
                    </div>
                  </td>
                </tr>
              ) : pipelinesToDisplay.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                    No transformation pipelines yet. Ingest your first document above.
                  </td>
                </tr>
              ) : (
                pipelinesToDisplay.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (item.projectId) router.push(`/dashboard/projects/${item.projectId}`)
                    }}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                            item.iconType === 'pdf' && 'bg-purple-50 text-purple-600',
                            item.iconType === 'globe' && 'bg-blue-50 text-blue-600',
                            item.iconType === 'doc' && 'bg-emerald-50 text-emerald-600',
                            item.iconType === 'image' && 'bg-blue-50 text-blue-600',
                            item.iconType === 'link' && 'bg-blue-50 text-blue-600'
                          )}
                        >
                          {item.iconType === 'pdf' && <FileText className="h-4 w-4" />}
                          {item.iconType === 'globe' && <Globe className="h-4 w-4" />}
                          {item.iconType === 'doc' && <FileText className="h-4 w-4" />}
                          {item.iconType === 'image' && <ImageIcon className="h-4 w-4" />}
                          {item.iconType === 'link' && <Link2 className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs sm:max-w-sm">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sources */}
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1.5">
                        {item.sources.includes('pdf') && (
                          <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-2xs" title="PDF Document">
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5V9H8c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V9h2.5c.83 0 1.5.67 1.5 1.5v3zm4-3H17v1h1.5V13H17v1.5h-1.5V9h3v1.5z" />
                            </svg>
                          </div>
                        )}
                        {item.sources.includes('drive') && (
                          <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs" title="Cloud Drive Source">
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M22.85 15l-6.56-11.5H9.72L16.29 15" />
                            </svg>
                          </div>
                        )}
                        {item.sources.includes('globe') && (
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs" title="Web Source">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.sources.includes('link') && (
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs" title="Web Link">
                            <Link2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.sources.includes('doc') && (
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs" title="Text / Document">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.sources.includes('image') && (
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs" title="Image Asset">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Output Formats */}
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1.5">
                        {item.outputs.includes('summary') && (
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs" title="Executive Summary">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('presentation') && (
                          <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs" title="Presentation">
                            <Presentation className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('linkedin') && (
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shadow-2xs" title="LinkedIn">
                            <Linkedin className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('advisory') && (
                          <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shadow-2xs" title="Executive Advisory">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('infographic') && (
                          <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs" title="Infographic">
                            <LayoutGrid className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('video') && (
                          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs" title="Video Script">
                            <PlayCircle className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('social') && (
                          <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-2xs" title="Social Media">
                            <Share2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.includes('twitter') && (
                          <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs" title="Twitter / X">
                            <Twitter className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.outputs.length === 0 && (
                          <span className="text-[11px] text-slate-400 italic">None generated</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-2">
                      <span
                        className={clsx(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                        )}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-4 px-2 text-xs text-slate-500 font-medium">
                      {item.lastUpdated}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.projectId) router.push(`/dashboard/projects/${item.projectId}`)
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Open project"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODALS                                                                 */}
      {/* ========================================================================= */}
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
