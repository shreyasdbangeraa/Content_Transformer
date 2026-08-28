'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  FolderKanban,
  FileText,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowLeft,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, Output } from '@/types'
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

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeOutputTab, setActiveOutputTab] = useState<string>('executive_summary')
  const [viewMode, setViewMode] = useState<'outputs' | 'canonical'>('outputs')

  const [editorOutput, setEditorOutput] = useState<Output | null>(null)
  const [publishOutput, setPublishOutput] = useState<Output | null>(null)

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await api.getProject(projectId)
      setProject(data)
      if (data.outputs && data.outputs.length > 0) {
        setActiveOutputTab(data.outputs[0].format_type)
      }
    } catch (err: any) {
      alert(`Failed to load project: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) loadProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading Project Studio...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-xs text-slate-500">Project not found.</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="rounded-lg bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 border border-sky-200"
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

      setProject((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          outputs: prev.outputs?.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)),
        }
      })
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="rounded-xl p-2 border border-slate-300 bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 text-[10px] font-bold uppercase font-mono">
                {project.domain}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {project.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{project.title}</h1>
          </div>
        </div>

        {/* View Mode Toggle: Outputs Studio vs Canonical Model */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs shadow-2xs">
          <button
            onClick={() => setViewMode('outputs')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl font-bold transition-all',
              viewMode === 'outputs'
                ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Artefact Studio ({outputs.length})
          </button>
          <button
            onClick={() => setViewMode('canonical')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl font-bold transition-all',
              viewMode === 'canonical'
                ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Canonical Knowledge
          </button>
        </div>
      </div>

      {/* VIEW 1: CANONICAL KNOWLEDGE */}
      {viewMode === 'canonical' && project.canonical_analysis && (
        <div className="space-y-6">
          <CanonicalViewer canonical={project.canonical_analysis} />
          {project.canonical_analysis.sensitivity?.detected_count > 0 && (
            <SensitivityInspector sensitivity={project.canonical_analysis.sensitivity} />
          )}
        </div>
      )}

      {/* VIEW 2: OUTPUTS STUDIO */}
      {viewMode === 'outputs' && (
        <div className="space-y-6">
          {outputs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3 bg-white">
              <Layers className="h-8 w-8 mx-auto text-slate-400" />
              <p className="text-xs text-slate-500 font-medium">No generated artefacts found for this project.</p>
            </div>
          ) : (
            <>
              {/* Output Format Switcher Tabs */}
              <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3">
                {outputs.map((o) => {
                  const isActive = activeOutputTab === o.format_type
                  return (
                    <button
                      key={o.id}
                      onClick={() => setActiveOutputTab(o.format_type)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-xs'
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

              {/* Main Content & Sidebar Grid */}
              {activeOutput && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Main View (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
                      {/* Top Bar */}
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
                            {activeOutput.title || `${activeOutput.format_type} Deliverable`}
                          </h3>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setEditorOutput(activeOutput)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                            <span>Ask AI to Edit</span>
                          </button>

                          <ExportDropdown
                            outputId={activeOutput.id}
                            content={activeOutput.raw_content}
                            formatType={activeOutput.format_type}
                          />

                          <button
                            onClick={() => setPublishOutput(activeOutput)}
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-sky-500 hover:to-indigo-500 transition-all"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Publish (n8n)</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Renderer */}
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

                      {/* Human Approval Sign-off */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 block">
                            Human Review & Decision
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Required to authorize public publishing.
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

                    {/* Fact Check Details */}
                    <FactCheckPanel factCheck={activeOutput.fact_check} />
                  </div>

                  {/* Right Sidebar (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    <QualityRadarCard qualityScore={activeOutput.quality_score} />

                    {/* Ingested Source Overview */}
                    {project.sources && project.sources.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs shadow-xs">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-sky-600" />
                          Source Document
                        </h4>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                          <div className="font-bold text-slate-900">
                            {project.sources[0].filename}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span>{project.sources[0].file_type.toUpperCase()}</span>
                            <span>•</span>
                            <span>{project.sources[0].page_count} Pages</span>
                            <span>•</span>
                            <span>{project.sources[0].char_count} Chars</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MODALS */}
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
          onPublished={() => loadProject()}
        />
      )}
    </div>
  )
}
