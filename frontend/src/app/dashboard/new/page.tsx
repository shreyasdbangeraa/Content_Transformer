'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  UploadCloud,
  FileText,
  Globe,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Send,
  Linkedin,
  Twitter,
  Presentation,
  Video,
  RefreshCw,
  Eye,
  Cpu,
  Search,
  Building2,
  Check,
  ArrowLeft,
  AlertOctagon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, CanonicalAnalysis, Output, BrandProfile } from '@/types'
import CanonicalViewer from '@/components/CanonicalViewer'
import FactCheckPanel from '@/components/FactCheckPanel'
import QualityRadarCard from '@/components/QualityRadarCard'
import SensitivityInspector from '@/components/SensitivityInspector'
import AIEditorModal from '@/components/AIEditorModal'
import SlideDeckPreview from '@/components/SlideDeckPreview'
import LinkedInPostCard from '@/components/LinkedInPostCard'
import InfographicCard from '@/components/InfographicCard'
import VideoPackageCard from '@/components/VideoPackageCard'
import TwitterThreadCard from '@/components/TwitterThreadCard'
import LiveResearchProgress from '@/components/LiveResearchProgress'
import LiveGenerationProgress from '@/components/LiveGenerationProgress'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import PublishModal from '@/components/PublishModal'
import ExportDropdown from '@/components/ExportDropdown'
import clsx from 'clsx'

const OUTPUT_OPTIONS = [
  { id: 'executive_summary', label: 'Executive Dossier', desc: 'Comprehensive 3-page briefing with telemetry & risk matrix', icon: FileText },
  { id: 'linkedin', label: 'LinkedIn Post', desc: 'Engaging professional post with visual graphic banner & CTA', icon: Linkedin },
  { id: 'twitter', label: 'X / Twitter Thread', desc: 'Numbered social thread with char limit optimization', icon: Twitter },
  { id: 'advisory', label: 'Threat Advisory', desc: 'Structured technical advisory with IoCs & mitigation directives', icon: ShieldCheck },
  { id: 'presentation', label: 'PPTX Deck', desc: 'Executive presentation slides with structured notes', icon: Presentation },
  { id: 'infographic', label: 'Infographic Visual', desc: 'Synthesized high-res visual banner & layout plan', icon: Layers },
  { id: 'video_package', label: 'Video Storyboard', desc: 'Scene-by-scene script, narration, and subtitle cues', icon: Video },
]

function NewTransformationStudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 6 Dedicated Screens in Top-to-Bottom Flow:
  // 1 = Ingestion & Security Gate
  // 2 = Live Research & Conflict Radar
  // 3 = Canonical Single-Truth Inspection
  // 4 = Format Orchestration & Brand Profile
  // 5 = Live Multi-Format AI Generation & Fact-Checking
  // 6 = Production Output Studio & Publishing
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)

  // Ingest Source State
  const [projectTitle, setProjectTitle] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [domain, setDomain] = useState('General / Cross-Domain')
  const [researchMode, setResearchMode] = useState<'SOURCE_ONLY' | 'SOURCE_AND_VERIFY' | 'DEEP_RESEARCH'>('SOURCE_AND_VERIFY')
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([])
  const [selectedBrandProfileId, setSelectedBrandProfileId] = useState<string>('')
  
  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'url'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [isProcessingSource, setIsProcessingSource] = useState(false)

  // Project & Canonical State
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [canonical, setCanonical] = useState<CanonicalAnalysis | null>(null)

  // Operator Configuration
  const [audience, setAudience] = useState('Executive Board & Technical Engineers')
  const [tone, setTone] = useState('Professional & Authoritative')
  const [language, setLanguage] = useState('English')
  const [detailLevel, setDetailLevel] = useState('Detailed & Comprehensive')
  const [objective, setObjective] = useState('Inform & Remediate (Security Event)')
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'executive_summary',
    'linkedin',
    'twitter',
    'advisory',
    'presentation',
    'infographic',
    'video_package',
  ])

  // Studio Outputs State
  const [generatedOutputs, setGeneratedOutputs] = useState<Output[]>([])
  const [activeOutputTab, setActiveOutputTab] = useState<string>('executive_summary')
  const [isTransforming, setIsTransforming] = useState(false)

  // Modals State
  const [editorModalOutput, setEditorModalOutput] = useState<Output | null>(null)
  const [publishModalOutput, setPublishModalOutput] = useState<Output | null>(null)

  // Load Brand Profiles on Mount
  useEffect(() => {
    api.listBrandProfiles()
      .then((profiles) => {
        setBrandProfiles(profiles)
        if (profiles.length > 0) {
          setSelectedBrandProfileId(profiles[0].id)
        }
      })
      .catch((err) => console.error('Failed to load brand profiles', err))
  }, [])

  const handleCreateProjectAndIngest = async () => {
    if (!projectTitle.trim()) {
      alert('Please enter a project title.')
      return
    }

    try {
      setIsProcessingSource(true)
      const project = await api.createProject({
        title: projectTitle,
        organization_name: organizationName,
        domain,
        research_mode: researchMode,
        brand_profile_id: selectedBrandProfileId || undefined,
      })
      setActiveProject(project)

      let source = null
      if (inputTab === 'upload') {
        if (!selectedFile) {
          alert('Please select a document file to upload.')
          setIsProcessingSource(false)
          return
        }
        source = await api.uploadSourceFile(project.id, selectedFile)
      } else if (inputTab === 'paste') {
        if (!pasteText.trim()) {
          alert('Please paste the source text.')
          setIsProcessingSource(false)
          return
        }
        source = await api.pasteSourceText(project.id, projectTitle, pasteText)
      } else if (inputTab === 'url') {
        if (!urlInput.trim()) {
          alert('Please enter a valid URL.')
          setIsProcessingSource(false)
          return
        }
        source = await api.ingestUrl(project.id, urlInput)
      }

      if (!source) {
        throw new Error('Failed to ingest source material')
      }

      // Trigger Canonical Synthesis & Evidence Research
      const canonicalRes = await api.analyzeSource(source.id)
      setCanonical(canonicalRes)
      setCurrentStep(2) // Move down to Screen 2: Live Research Engine & Conflict Radar
    } catch (err: any) {
      alert(`Source ingestion failed: ${err.message}`)
    } finally {
      setIsProcessingSource(false)
    }
  }

  const handleExecuteTransformation = async () => {
    if (!activeProject || !canonical) return
    if (selectedFormats.length === 0) {
      alert('Please select at least one deliverable format to generate.')
      return
    }

    try {
      setIsTransforming(true)
      setCurrentStep(5) // Move down to Screen 5: Live Parallel AI Generation & Fact-Checking

      const result = await api.createTransformation(activeProject.id, {
        canonical_id: canonical.id,
        target_audience: audience,
        tone,
        language,
        detail_level: detailLevel,
        communication_objective: objective,
        content_style: 'Corporate & Government Advisory',
        research_mode: researchMode,
        brand_profile_id: selectedBrandProfileId || undefined,
        requested_formats: selectedFormats,
      })

      setGeneratedOutputs(result.outputs)
      if (result.outputs.length > 0) {
        setActiveOutputTab(result.outputs[0].format_type)
      }
    } catch (err: any) {
      alert(`Transformation failed: ${err.message}`)
      setCurrentStep(4)
    } finally {
      setIsTransforming(false)
    }
  }

  const handleApproval = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeOutput) return
    try {
      const updated =
        action === 'APPROVE'
          ? await api.approveOutput(activeOutput.id, 'Approved by operator')
          : await api.rejectOutput(activeOutput.id, 'Rejected by operator')

      if (action === 'APPROVE') {
        try {
          await api.publishToN8n(activeOutput.id, 'n8n')
          updated.status = 'PUBLISHED'
        } catch (publishErr) {
          console.warn('n8n auto-publish dispatch:', publishErr)
        }
      }

      setGeneratedOutputs((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      )

      if (action === 'APPROVE') {
        alert('✅ Post Approved & Dispatched to n8n Social Media AI Publisher workflow!')
      }
    } catch (err: any) {
      alert(`Approval update failed: ${err.message}`)
    }
  }

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const activeOutput = generatedOutputs.find((o) => o.format_type === activeOutputTab)

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Wizard Step Progression Indicator */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto no-scrollbar gap-3">
          {[
            { step: 1, label: '1. Ingestion & Security' },
            { step: 2, label: '2. Research & Conflicts' },
            { step: 3, label: '3. Canonical Truth' },
            { step: 4, label: '4. Formats & Brand' },
            { step: 5, label: '5. AI Generation' },
            { step: 6, label: '6. Output Studio' },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-2 shrink-0">
              <div
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all shadow-xs',
                  currentStep === s.step
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {currentStep > s.step ? <Check className="h-3.5 w-3.5" /> : s.step}
              </div>
              <span
                className={clsx(
                  'text-xs font-bold whitespace-nowrap',
                  currentStep === s.step ? 'text-indigo-950 font-black' : 'text-slate-500 font-medium'
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: CLEAN TOP-TO-BOTTOM INGESTION & SECURITY GATE                   */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Card 1: Header & Instructions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-2 shadow-xs">
            <span className="text-xs font-black uppercase text-indigo-700 tracking-wider font-mono">
              STEP 1 OF 6 • MULTIMODAL INGESTION & SECURITY GATE
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Ingest Source Material & Configure Research
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Upload any PDF, Word document, plain text, or article URL. The engine will extract the text, run security sanitization, and formulate research queries.
            </p>
          </div>

          {/* Card 2: Incident & Organizational Metadata */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Project & Organizational Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Project Title / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Strategic Operations Brief / Security Advisory"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Organization / Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation / Global Operations"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Research Mode Selection */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-600" />
              <span>2. Select Automated Research Engine Mode</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'SOURCE_ONLY',
                  label: 'Source Only',
                  desc: 'Strictly bounds knowledge synthesis to uploaded document.',
                },
                {
                  id: 'SOURCE_AND_VERIFY',
                  label: 'Source & Verify (Recommended)',
                  desc: 'Queries authoritative external tiers (CISA, CERT) to cross-verify claims.',
                },
                {
                  id: 'DEEP_RESEARCH',
                  label: 'Deep Research',
                  desc: 'Multi-query discovery across all 8 source hierarchy tiers.',
                },
              ].map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => setResearchMode(mode.id as any)}
                  className={clsx(
                    'p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-1.5',
                    researchMode === mode.id
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{mode.label}</span>
                    {researchMode === mode.id && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Source Material Input */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Provide Source Content
            </h3>

            {/* Input Selection Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'upload', label: 'File Upload (PDF, DOCX, TXT)', icon: UploadCloud },
                { id: 'paste', label: 'Paste Raw Text', icon: FileText },
                { id: 'url', label: 'Web URL / Article', icon: Globe },
              ].map((t) => {
                const Icon = t.icon
                const isSel = inputTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setInputTab(t.id as any)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                      isSel
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                  </button>
                )}
              )}
            </div>

            {/* File Upload Box */}
            {inputTab === 'upload' && (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/20 transition-all bg-slate-50/50">
                <UploadCloud className="h-12 w-12 mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-800 mt-3">
                  Drag and drop your incident report here, or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Supports PDF, Word (.docx), Plain Text (.txt), Markdown (.md), and Images
                </p>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-4 text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs text-emerald-800 font-bold">
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
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-xs sm:text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-mono"
              />
            )}

            {/* URL Input Box */}
            {inputTab === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://cisa.gov/advisories/aa26-224a-darkhydra-ransomware"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
                />
                <p className="text-xs text-slate-500 font-medium">
                  Protected by SSRF security firewall & prompt injection sanitizer.
                </p>
              </div>
            )}
          </div>

          {/* Card 6: Active Security & Sanitization Telemetry */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Active Security & Sanitization Gateways</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                <strong className="text-slate-900 block font-bold">Prompt Injection Filter</strong>
                <span>Strips hidden jailbreaks & payload overrides.</span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                <strong className="text-slate-900 block font-bold">SSRF Defense</strong>
                <span>Blocks internal loopbacks and private subnets.</span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                <strong className="text-slate-900 block font-bold">Sensitivity Scanner</strong>
                <span>Scans emails, internal IPs (10.x), and credentials.</span>
              </div>
            </div>
          </div>

          {/* Card 7: Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreateProjectAndIngest}
              disabled={isProcessingSource}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-4 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 transition-all"
            >
              {isProcessingSource ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Ingesting & Running Research Engine...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Step 2: Automated Research & Evidence</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: LIVE RESEARCH ENGINE & CONFLICT RADAR                           */}
      {/* ========================================================================= */}
      {currentStep === 2 && canonical && (
        <div className="max-w-4xl mx-auto space-y-6">
          <LiveResearchProgress
            canonical={canonical}
            researchMode={researchMode}
            onComplete={() => setCurrentStep(3)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: CANONICAL SINGLE-TRUTH KNOWLEDGE BASE                           */}
      {/* ========================================================================= */}
      {currentStep === 3 && canonical && (
        <div className="max-w-4xl mx-auto space-y-6">
          <CanonicalViewer canonical={canonical} />

          {/* Proceed Navigation Bar */}
          <div className="flex items-center justify-between p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <button
              onClick={() => setCurrentStep(2)}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Research & Conflicts</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 transition-all"
            >
              <span>Proceed to Step 4: Formats & Audience Config</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: FORMAT ORCHESTRATION & BRAND PROFILE                            */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8 shadow-xs">
            <div>
              <span className="text-xs font-black uppercase text-indigo-700 tracking-wider font-mono">
                STEP 4 OF 6 • MULTI-FORMAT ORCHESTRATOR & AUDIENCE CALIBRATION
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Configure Target Audience & Select Deliverables
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
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Executive Board & Technical Engineers">Executive Board & Technical Engineers</option>
                  <option value="Executive Board & C-Suite">Executive Board & C-Suite</option>
                  <option value="Government Officials & Regulators">Government Officials & Regulators</option>
                  <option value="Technical Security Engineers">Technical Security Engineers</option>
                  <option value="General Public & Media">General Public & Media</option>
                  <option value="Enterprise Customers & Partners">Enterprise Customers & Partners</option>
                </select>
              </div>

              {/* Communication Tone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Tone & Style
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Professional & Authoritative">Professional & Authoritative</option>
                  <option value="Formal & Authoritative">Formal & Authoritative</option>
                  <option value="Technical & Precise">Technical & Precise</option>
                  <option value="Urgent Advisory">Urgent Advisory</option>
                  <option value="Educational & Accessible">Educational & Accessible</option>
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
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
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
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Detailed & Comprehensive">Detailed & Comprehensive</option>
                  <option value="Medium (Standard)">Medium (Standard)</option>
                  <option value="Short & Punchy">Short & Punchy</option>
                </select>
              </div>
            </div>

            {/* Target Output Format Cards */}
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
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/80 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 opacity-70'
                      )}
                    >
                      <div
                        className={clsx(
                          'flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors',
                          isChecked ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-slate-900">{opt.label}</span>
                          {isChecked && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
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
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 transition-all"
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
        <div className="max-w-4xl mx-auto space-y-6">
          <LiveGenerationProgress
            selectedFormats={selectedFormats}
            onComplete={() => setCurrentStep(6)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 6: PRODUCTION OUTPUT STUDIO (TOP-TO-BOTTOM WORKSPACE)              */}
      {/* ========================================================================= */}
      {currentStep === 6 && generatedOutputs.length > 0 && (
        <div className="space-y-8 max-w-5xl mx-auto">
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
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
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

          {/* Active Deliverable Workspace (Clean Top-to-Bottom Flow) */}
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

              {/* Fact Check Inspection Panel (Stacked Down) */}
              <FactCheckPanel factCheck={activeOutput.fact_check} />

              {/* Quality Radar Card (Stacked Down) */}
              <QualityRadarCard qualityScore={activeOutput.quality_score} />
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
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
