'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  RefreshCw,
  Zap,
  Globe,
  Sliders,
  ExternalLink,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, Output } from '@/types'
import CanonicalViewer from '@/components/CanonicalViewer'
import FactCheckPanel from '@/components/FactCheckPanel'
import QualityRadarCard from '@/components/QualityRadarCard'
import SensitivityInspector from '@/components/SensitivityInspector'
import AIEditorModal from '@/components/AIEditorModal'
import ManualEditorModal from '@/components/ManualEditorModal'
import SlideDeckPreview from '@/components/SlideDeckPreview'
import LinkedInPostCard from '@/components/LinkedInPostCard'
import InfographicCard from '@/components/InfographicCard'
import VideoPackageCard from '@/components/VideoPackageCard'
import TwitterThreadCard from '@/components/TwitterThreadCard'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import PublishModal from '@/components/PublishModal'
import ExportDropdown from '@/components/ExportDropdown'
import { Edit3 } from 'lucide-react'
import clsx from 'clsx'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'outputs' | 'canonical'>('outputs')
  const [activeOutputTab, setActiveOutputTab] = useState<string>('executive_summary')

  // Modals
  const [editorOutput, setEditorOutput] = useState<Output | null>(null)
  const [manualEditorOutput, setManualEditorOutput] = useState<Output | null>(null)
  const [publishOutput, setPublishOutput] = useState<Output | null>(null)

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await api.getProject(projectId)
      setProject(data)
      if (data.outputs && data.outputs.length > 0) {
        setActiveOutputTab(data.outputs[0].format_type)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) loadProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="h-8 w-8 text-sky-600 animate-spin" />
        <p className="text-sm font-bold text-slate-600">Loading project artefacts & evidence graph...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <h3 className="text-lg font-bold text-slate-900">Project Not Found</h3>
        <p className="text-xs text-slate-500">The requested transformation project could not be found or has been archived.</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="rounded-2xl bg-sky-50 px-5 py-2.5 text-sm font-bold text-sky-700 border border-sky-200"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  const outputs = project.outputs || []
  const activeOutput = outputs.find((o) => o.format_type === activeOutputTab) || outputs[0]

  const handleApproval = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeOutput) return
    try {
      const updated =
        action === 'APPROVE'
          ? await api.approveOutput(activeOutput.id, 'Approved by human operator')
          : await api.rejectOutput(activeOutput.id, 'Rejected by human operator')

      if (action === 'APPROVE') {
        try {
          await api.publishToN8n(activeOutput.id, 'n8n')
          updated.status = 'PUBLISHED'
        } catch (publishErr) {
          console.warn('n8n auto-publish dispatch:', publishErr)
        }
      }

      setProject((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          outputs: prev.outputs?.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)),
        }
      })

      if (action === 'APPROVE') {
        alert('✅ Post Approved & Dispatched to n8n Social Media AI Publisher workflow!')
      }
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-7xl mx-auto w-full">
      {/* Top Breadcrumb & Metadata Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Projects</span>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-50 text-sky-800 text-xs font-black px-3 py-1 border border-sky-200 uppercase font-mono">
                {project.organization_name || 'Enterprise'}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 border border-slate-200">
                {project.domain}
              </span>
              <span className="rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold px-3 py-1 border border-indigo-200 font-mono">
                Mode: {project.research_mode || 'SOURCE_AND_VERIFY'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-600 font-medium">{project.description}</p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl self-start sm:self-center border border-slate-200/60 shadow-2xs">
            <button
              onClick={() => setViewMode('outputs')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                viewMode === 'outputs'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Sparkles className="h-4 w-4 text-sky-600" />
              <span>Deliverables ({outputs.length})</span>
            </button>
            <button
              onClick={() => setViewMode('canonical')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                viewMode === 'canonical'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Evidence & Canonical</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: CANONICAL ANALYSIS */}
      {viewMode === 'canonical' && project.canonical_analysis && (
        <CanonicalViewer canonical={project.canonical_analysis} />
      )}

      {/* VIEW: OUTPUTS STUDIO */}
      {viewMode === 'outputs' && (
        <>
          {outputs.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
              <p className="text-sm text-slate-600 font-medium">No outputs generated yet for this project.</p>
              <button
                onClick={() => router.push(`/dashboard/new`)}
                className="rounded-2xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-500"
              >
                Create New Transformation
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Formats Tab Strip */}
              <div className="flex overflow-x-auto gap-2.5 border-b border-slate-200 pb-4 no-scrollbar">
                {outputs.map((o) => {
                  const isActive = activeOutputTab === o.format_type
                  return (
                    <button
                      key={o.id}
                      onClick={() => setActiveOutputTab(o.format_type)}
                      className={clsx(
                        'flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold whitespace-nowrap transition-all shadow-xs',
                        isActive
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
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

              {/* Main Content & Sidebar Grid */}
              {activeOutput && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Main View (8 cols) */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xs">
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold uppercase rounded-md bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-0.5 font-mono">
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
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                            {activeOutput.title || `${activeOutput.format_type} Deliverable`}
                          </h3>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <button
                            onClick={() => setManualEditorOutput(activeOutput)}
                            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
                          >
                            <Edit3 className="h-4 w-4 text-indigo-600" />
                            <span>Manual Edit</span>
                          </button>

                          <button
                            onClick={() => setEditorOutput(activeOutput)}
                            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                          >
                            <Sparkles className="h-4 w-4 text-sky-600" />
                            <span>Ask AI to Edit</span>
                          </button>

                          <ExportDropdown
                            outputId={activeOutput.id}
                            content={activeOutput.raw_content}
                            formatType={activeOutput.format_type}
                          />

                          <button
                            onClick={() => setPublishOutput(activeOutput)}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow-md transition-all"
                          >
                            <Send className="h-4 w-4" />
                            <span>Publish (n8n)</span>
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
                        <VideoPackageCard structuredData={activeOutput.structured_data || {}} rawContent={activeOutput.raw_content} />
                      ) : activeOutput.format_type === 'twitter' ? (
                        <TwitterThreadCard structuredData={activeOutput.structured_data || {}} rawContent={activeOutput.raw_content} />
                      ) : (
                        <StructuredContentRenderer content={activeOutput.raw_content} />
                      )}

                      {/* Human-in-the-Loop Sign-Off Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/90">
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">
                            Human-in-the-Loop Governance Sign-Off
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Public publishing strictly requires explicit operator certification.
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

                    {/* Fact Check Inspection Panel */}
                    <FactCheckPanel factCheck={activeOutput.fact_check} />
                  </div>

                  {/* Right Sidebar (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    <QualityRadarCard qualityScore={activeOutput.quality_score} />

                    {project.canonical_analysis && (
                      <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-xs">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-sky-600" />
                          Canonical Source Summary
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-4">
                          {project.canonical_analysis.executive_summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {manualEditorOutput && (
        <ManualEditorModal
          output={manualEditorOutput}
          isOpen={!!manualEditorOutput}
          onClose={() => setManualEditorOutput(null)}
          onUpdated={(updated) => {
            setProject((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                outputs: prev.outputs?.map((o) => (o.id === updated.id ? updated : o)),
              }
            })
            setManualEditorOutput(null)
          }}
        />
      )}

      {editorOutput && (
        <AIEditorModal
          output={editorOutput}
          isOpen={!!editorOutput}
          onClose={() => setEditorOutput(null)}
          onUpdated={(updated) => {
            setProject((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                outputs: prev.outputs?.map((o) => (o.id === updated.id ? updated : o)),
              }
            })
            setEditorOutput(updated)
          }}
        />
      )}

      {publishOutput && (
        <PublishModal
          output={publishOutput}
          isOpen={!!publishOutput}
          onClose={() => setPublishOutput(null)}
          onPublished={() => {
            setPublishOutput(null)
            loadProject()
          }}
        />
      )}
    </div>
  )
}
