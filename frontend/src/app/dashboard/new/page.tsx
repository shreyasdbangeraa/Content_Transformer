'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles,
  UploadCloud,
  FileText,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Layers,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Send,
  Linkedin,
  Twitter,
  Presentation,
  Video,
} from 'lucide-react'
import { api } from '@/lib/api'
import { CanonicalAnalysis, Output, Project } from '@/types'
import CanonicalViewer from '@/components/CanonicalViewer'
import FactCheckPanel from '@/components/FactCheckPanel'
import QualityRadarCard from '@/components/QualityRadarCard'
import SensitivityInspector from '@/components/SensitivityInspector'
import AIEditorModal from '@/components/AIEditorModal'
import SlideDeckPreview from '@/components/SlideDeckPreview'
import LinkedInPostCard from '@/components/LinkedInPostCard'
import InfographicCard from '@/components/InfographicCard'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import PublishModal from '@/components/PublishModal'
import ExportDropdown from '@/components/ExportDropdown'
import clsx from 'clsx'

const TEMPLATE_PRESETS: Record<string, {
  title: string
  domain: string
  audience: string
  tone: string
  language: string
  detailLevel: string
  objective: string
  formats: string[]
}> = {
  cyber_advisory: {
    title: 'Cybersecurity Threat Advisory',
    domain: 'Cybersecurity',
    audience: 'Government Cyber Regulators & IT Teams',
    tone: 'Formal & Authoritative',
    language: 'English',
    detailLevel: 'Detailed',
    objective: 'Inform, Warn & Remediate',
    formats: ['advisory', 'linkedin', 'presentation', 'infographic'],
  },
  exec_brief: {
    title: 'Executive Decision-Maker Briefing',
    domain: 'Leadership',
    audience: 'Executive Board & C-Suite',
    tone: 'Concise & Strategic',
    language: 'English',
    detailLevel: 'High-Level',
    objective: 'Executive Decision Support',
    formats: ['executive_summary', 'presentation'],
  },
  public_announcement: {
    title: 'Multilingual Public Notice',
    domain: 'Government & Public Sector',
    audience: 'General Public & Citizens',
    tone: 'Clear, Educational & Accessible',
    language: 'English',
    detailLevel: 'Medium',
    objective: 'Public Communication & Education',
    formats: ['advisory', 'linkedin', 'twitter'],
  },
  research_digest: {
    title: 'Academic Research & Technology Digest',
    domain: 'Research & Science',
    audience: 'Engineering & Research Community',
    tone: 'Technical & Objective',
    language: 'English',
    detailLevel: 'Detailed',
    objective: 'Knowledge Dissemination',
    formats: ['executive_summary', 'linkedin', 'infographic'],
  },
  social_campaign: {
    title: 'Enterprise Social Campaign',
    domain: 'Enterprise',
    audience: 'Industry Stakeholders & Clients',
    tone: 'Engaging & Professional',
    language: 'English',
    detailLevel: 'Medium',
    objective: 'Brand Engagement & Awareness',
    formats: ['linkedin', 'twitter', 'infographic'],
  },
}

const OUTPUT_OPTIONS = [
  { id: 'executive_summary', label: 'Executive Summary', desc: 'Concise 1-page briefing for decision makers', icon: FileText },
  { id: 'linkedin', label: 'LinkedIn Post', desc: 'Engaging professional post with hook & hashtags', icon: Linkedin },
  { id: 'advisory', label: 'Threat Advisory', desc: 'Structured technical advisory with IoCs & remediation', icon: ShieldCheck },
  { id: 'presentation', label: 'PPTX Presentation', desc: 'Executive 5-slide deck with speaker notes', icon: Presentation },
  { id: 'twitter', label: 'X / Twitter Thread', desc: 'Numbered social thread with char limit optimization', icon: Twitter },
  { id: 'infographic', label: 'Infographic Layout', desc: 'Visual statistics plan & FLUX.1 image prompt', icon: Layers },
  { id: 'video_package', label: 'Video Storyboard', desc: 'Scene-by-scene script, narration, and subtitle cues', icon: Video },
]

function NewTransformationStudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')

  // Wizard state: 1 = Input, 2 = AI Canonical Analysis, 3 = Config & Output Selection, 4 = Generating, 5 = Studio Workspace
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Ingest Source State
  const [projectTitle, setProjectTitle] = useState('')
  const [domain, setDomain] = useState('Enterprise')
  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'url'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [isProcessingSource, setIsProcessingSource] = useState(false)

  // Project & Canonical State
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [canonical, setCanonical] = useState<CanonicalAnalysis | null>(null)

  // Operator Configuration
  const [audience, setAudience] = useState('General Public & Stakeholders')
  const [tone, setTone] = useState('Professional & Authoritative')
  const [language, setLanguage] = useState('English')
  const [detailLevel, setDetailLevel] = useState('Detailed')
  const [objective, setObjective] = useState('Inform & Guide')
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'executive_summary',
    'linkedin',
    'advisory',
    'presentation',
    'infographic',
  ])

  // Transformation Results
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOutputs, setGeneratedOutputs] = useState<Output[]>([])
  const [activeOutputTab, setActiveOutputTab] = useState<string>('executive_summary')

  // Modals & Drawers
  const [editorModalOutput, setEditorModalOutput] = useState<Output | null>(null)
  const [publishModalOutput, setPublishModalOutput] = useState<Output | null>(null)

  // Load Template if present
  useEffect(() => {
    if (templateParam && TEMPLATE_PRESETS[templateParam]) {
      const preset = TEMPLATE_PRESETS[templateParam]
      setProjectTitle(preset.title)
      setDomain(preset.domain)
      setAudience(preset.audience)
      setTone(preset.tone)
      setLanguage(preset.language)
      setDetailLevel(preset.detailLevel)
      setObjective(preset.objective)
      setSelectedFormats(preset.formats)
    }
  }, [templateParam])

  // Handle Step 1 Source Submission
  const handleProcessSource = async () => {
    try {
      setIsProcessingSource(true)
      // 1. Create Project
      const project = await api.createProject({
        title: projectTitle.trim() || 'Untitled Transformation Project',
        domain: domain || 'Enterprise',
      })
      setActiveProject(project)

      // 2. Ingest Source based on selected tab
      let sourceRes: any
      if (inputTab === 'upload') {
        if (!selectedFile) {
          alert('Please select a PDF, DOCX, or TXT file.')
          setIsProcessingSource(false)
          return
        }
        sourceRes = await api.uploadSourceFile(project.id, selectedFile)
      } else if (inputTab === 'paste') {
        if (!pasteText.trim()) {
          alert('Please paste document text.')
          setIsProcessingSource(false)
          return
        }
        sourceRes = await api.pasteSourceText(project.id, projectTitle, pasteText)
      } else if (inputTab === 'url') {
        if (!urlInput.trim()) {
          alert('Please enter a URL.')
          setIsProcessingSource(false)
          return
        }
        sourceRes = await api.ingestUrl(project.id, urlInput)
      }

      // 3. Trigger Deep Canonical AI Analysis
      const canonicalRes = await api.analyzeSource(sourceRes.id)
      setCanonical(canonicalRes)
      setCurrentStep(2) // Move to Canonical Review
    } catch (err: any) {
      alert(`Source ingestion error: ${err.message}`)
    } finally {
      setIsProcessingSource(false)
    }
  }

  // Handle Step 3 Triggering Multi-Output Transformation
  const handleExecuteTransformation = async () => {
    if (!activeProject || !canonical) return
    try {
      setCurrentStep(4) // Generating animation
      setIsGenerating(true)

      const result = await api.createTransformation(activeProject.id, {
        canonical_id: canonical.id,
        target_audience: audience,
        tone,
        language,
        detail_level: detailLevel,
        communication_objective: objective,
        content_style: 'Corporate & Government Advisory',
        requested_formats: selectedFormats,
      })

      setGeneratedOutputs(result.outputs)
      if (result.outputs.length > 0) {
        setActiveOutputTab(result.outputs[0].format_type)
      }
      setCurrentStep(5) // Studio
    } catch (err: any) {
      alert(`Transformation failed: ${err.message}`)
      setCurrentStep(3)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleFormat = (id: string) => {
    if (selectedFormats.includes(id)) {
      if (selectedFormats.length === 1) {
        alert('Please keep at least one target output format selected.')
        return
      }
      setSelectedFormats(selectedFormats.filter((f) => f !== id))
    } else {
      setSelectedFormats([...selectedFormats, id])
    }
  }

  const activeOutput = generatedOutputs.find((o) => o.format_type === activeOutputTab) || generatedOutputs[0]

  const handleApproval = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeOutput) return
    try {
      const updated =
        action === 'APPROVE'
          ? await api.approveOutput(activeOutput.id, 'Approved by human operator')
          : await api.rejectOutput(activeOutput.id, 'Rejected by human operator')

      setGeneratedOutputs((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
      )
    } catch (err: any) {
      alert(`Approval action failed: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-16">
      {/* Wizard Step Progress Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200 uppercase tracking-wider">
            Transformation Studio
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {currentStep === 1 && 'Step 1: Ingest Source Document'}
            {currentStep === 2 && 'Step 2: Canonical Structured Knowledge Review'}
            {currentStep === 3 && 'Step 3: Target Audience & Format Controls'}
            {currentStep === 4 && 'Step 4: Executing Multi-Format Synthesis...'}
            {currentStep === 5 && 'Step 5: Output Verification, Review & Publish'}
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {[1, 2, 3, 5].map((s, idx) => (
            <div key={s} className="flex items-center gap-1.5 text-xs font-bold">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                  currentStep >= s
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {idx + 1}
              </span>
              {idx < 3 && <div className="h-0.5 w-6 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: INGEST SOURCE MATERIAL                                            */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Source Input Form Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Transformation Project Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. August Cybersecurity Incident Briefing"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
              />
            </div>

            {/* Input Type Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Source Input Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upload', label: 'Upload Document (PDF, DOCX, TXT)', icon: UploadCloud },
                  { id: 'paste', label: 'Paste Raw Text', icon: FileText },
                  { id: 'url', label: 'Scrape Public Article / URL', icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isSel = inputTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInputTab(tab.id as any)}
                      className={`flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                        isSel
                          ? 'border-sky-500 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab 1: File Upload */}
            {inputTab === 'upload' && (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center space-y-4 hover:border-sky-400 transition-colors">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-xs">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Drag & drop your source document here, or browse'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Supports PDF, Word (.docx), and Plain Text (.txt) up to 25MB
                  </p>
                </div>
                <input
                  type="file"
                  id="source-file-input"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="source-file-input"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Browse Computer
                </label>
              </div>
            )}

            {/* Tab 2: Paste Text */}
            {inputTab === 'paste' && (
              <div className="space-y-2">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste report text, advisory data, or research summary here..."
                  rows={8}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
                />
                <span className="text-[11px] text-slate-500 font-medium">
                  {pasteText.length} characters entered
                </span>
              </div>
            )}

            {/* Tab 3: URL */}
            {inputTab === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://news.example.com/cyber-advisory-2026"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
                />
                <span className="text-[11px] text-slate-500 font-medium">
                  Protected with SSRF safeguards and private IP blocking.
                </span>
              </div>
            )}

            {/* Proceed to Analysis Button */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={handleProcessSource}
                disabled={isProcessingSource}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessingSource ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Extracting & Analyzing Source...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Canonical Knowledge</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CANONICAL STRUCTURED KNOWLEDGE REVIEW                            */}
      {/* ========================================================================= */}
      {currentStep === 2 && canonical && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-sky-600" />
              Canonical Structured Knowledge Extracted
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              The AI has parsed your source into structured facts, metrics, risks, and entity references. Review before configuring multi-format generation.
            </p>
          </div>

          {/* Interactive Canonical Viewer */}
          <CanonicalViewer canonical={canonical} />

          {/* Sensitivity Warning Inspector if items detected */}
          {canonical.sensitivity?.detected_count > 0 && (
            <SensitivityInspector sensitivity={canonical.sensitivity} />
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Back to Source
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500 transition-all"
            >
              <span>Configure Target Outputs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: OPERATOR CONFIGURATION & MULTI-OUTPUT SELECTION                   */}
      {/* ========================================================================= */}
      {currentStep === 3 && canonical && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-sky-600" />
                Operator Generation Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Customize audience, tone, language, and select all communication artefacts to produce simultaneously.
              </p>
            </div>

            {/* Grid of Parameter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-semibold"
                >
                  <option value="Government Officials & Regulators">Government Officials & Regulators</option>
                  <option value="Executive Board & C-Suite">Executive Board & C-Suite</option>
                  <option value="Technical Security Engineers">Technical Security Engineers</option>
                  <option value="General Public & Media">General Public & Media</option>
                  <option value="Enterprise Customers & Partners">Enterprise Customers & Partners</option>
                </select>
              </div>

              {/* Communication Tone */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Tone & Style</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-semibold"
                >
                  <option value="Formal & Authoritative">Formal & Authoritative</option>
                  <option value="Professional & Reassuring">Professional & Reassuring</option>
                  <option value="Technical & Precise">Technical & Precise</option>
                  <option value="Urgent Advisory">Urgent Advisory</option>
                  <option value="Educational & Accessible">Educational & Accessible</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Output Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-semibold"
                >
                  <option value="English">English</option>
                  <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                  <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                  <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                  <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                </select>
              </div>

              {/* Detail Level */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Detail Level
                </label>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-semibold"
                >
                  <option value="Short & Punchy">Short & Punchy</option>
                  <option value="Medium (Standard)">Medium (Standard)</option>
                  <option value="Detailed & Comprehensive">Detailed & Comprehensive</option>
                </select>
              </div>

              {/* Objective */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Primary Objective
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-semibold"
                >
                  <option value="Inform & Remediate">Inform & Remediate (Security Event)</option>
                  <option value="Educate & Build Trust">Educate & Build Trust</option>
                  <option value="Brief Decision Makers">Brief Decision Makers</option>
                  <option value="Public Safety Warning">Public Safety Warning</option>
                </select>
              </div>
            </div>

            {/* Target Output Format Cards */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Deliverables to Generate ({selectedFormats.length} selected)
                </label>
                <span className="text-[11px] text-sky-700 font-bold">
                  Generated simultaneously from the same canonical facts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OUTPUT_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isChecked = selectedFormats.includes(opt.id)
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleFormat(opt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-3 shadow-2xs ${
                        isChecked
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 opacity-70'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                          isChecked ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                          {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug font-medium">{opt.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Back to Canonical View
              </button>
              <button
                onClick={handleExecuteTransformation}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-indigo-500 active:scale-95 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate {selectedFormats.length} Selected Artefacts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: GENERATION IN PROGRESS ANIMATION                                  */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-6 max-w-xl mx-auto shadow-sm">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-sky-100 text-sky-700 border border-sky-200">
            <Sparkles className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Synthesizing Multi-Format Deliverables...
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Transforming canonical facts into {selectedFormats.length} communication artefacts, running automated claim extraction, and computing quality indices.
            </p>
          </div>

          <div className="space-y-2 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-slate-600">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>✓ Canonical representation loaded</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>✓ Target audience constraints applied ({audience})</span>
            </div>
            <div className="flex items-center gap-2 text-sky-700 animate-pulse font-bold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Generating {selectedFormats.join(', ')}...</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: OUTPUT STUDIO WORKSPACE (VERIFICATION, EDITING & PUBLISHING)       */}
      {/* ========================================================================= */}
      {currentStep === 5 && generatedOutputs.length > 0 && (
        <div className="space-y-6">
          {/* Format Tabs Bar */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3">
            {generatedOutputs.map((o) => {
              const isActive = activeOutputTab === o.format_type
              return (
                <button
                  key={o.id}
                  onClick={() => setActiveOutputTab(o.format_type)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                      : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <span className="capitalize">{o.format_type.replace('_', ' ')}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    v{o.version}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Artefact Studio Body */}
          {activeOutput && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Content Viewer (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
                  {/* Artefact Header & Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase rounded bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 font-mono">
                          {activeOutput.format_type.toUpperCase()}
                        </span>
                        <span
                          className={clsx(
                            'text-[10px] font-bold uppercase rounded px-2 py-0.5 border font-mono',
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
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {activeOutput.title || `${activeOutput.format_type} Output`}
                      </h3>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Conversational AI Edit */}
                      <button
                        onClick={() => setEditorModalOutput(activeOutput)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                        <span>Ask AI to Edit</span>
                      </button>

                      {/* Export Dropdown */}
                      <ExportDropdown
                        outputId={activeOutput.id}
                        content={activeOutput.raw_content}
                        formatType={activeOutput.format_type}
                      />

                      {/* Publish / n8n */}
                      <button
                        onClick={() => setPublishModalOutput(activeOutput)}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-sky-500 hover:to-indigo-500 transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Publish (n8n)</span>
                      </button>
                    </div>
                  </div>

                  {/* Render based on format */}
                  {activeOutput.format_type === 'presentation' ? (
                    <SlideDeckPreview
                      outputId={activeOutput.id}
                      deckData={activeOutput.structured_data}
                    />
                  ) : activeOutput.format_type === 'linkedin' ? (
                    <LinkedInPostCard output={activeOutput} />
                  ) : activeOutput.format_type === 'infographic' ? (
                    <InfographicCard output={activeOutput} />
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                      <StructuredContentRenderer content={activeOutput.raw_content} />
                    </div>
                  )}

                  {/* Human Approval Decision Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        Human-in-the-Loop Governance
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Public publishing requires explicit operator approval sign-off.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproval('REJECT')}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproval('APPROVE')}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs transition-all"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve Output</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fact Check Inspection Panel */}
                <FactCheckPanel factCheck={activeOutput.fact_check} />
              </div>

              {/* Sidebar Metrics (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Quality Score Breakdown */}
                <QualityRadarCard qualityScore={activeOutput.quality_score} />

                {/* Canonical Context Summary */}
                {canonical && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs shadow-xs">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-sky-600" />
                      Canonical Source Summary
                    </h4>
                    <p className="text-slate-600 leading-relaxed line-clamp-4 font-medium">
                      {canonical.executive_summary}
                    </p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                      <span>{canonical.key_facts?.length || 0} Grounded Facts</span>
                      <span className="text-rose-700">CVSS 9.4 Critical</span>
                    </div>
                  </div>
                )}
              </div>
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
            if (activeProject) {
              api.getProject(activeProject.id).then((p) => {
                setGeneratedOutputs(p.outputs || [])
              })
            }
          }}
        />
      )}
    </div>
  )
}

export default function NewTransformationStudio() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500 font-medium">
          Loading Transformation Studio...
        </div>
      }
    >
      <NewTransformationStudioContent />
    </React.Suspense>
  )
}
