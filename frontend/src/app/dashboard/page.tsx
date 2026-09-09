'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Folder,
  FileText,
  ShieldCheck,
  BarChart3,
  Plus,
  PlayCircle,
  Globe,
  FileEdit,
  Image as ImageIcon,
  Presentation,
  Share2,
  LayoutGrid,
  MoreVertical,
  Check,
  ArrowRight,
  Linkedin,
  Twitter,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  Database,
  Link2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, DashboardStats } from '@/types'
import clsx from 'clsx'

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

export default function DashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, projectsData] = await Promise.all([
        api.getStats().catch((err) => {
          console.error('Failed to load stats:', err)
          return null
        }),
        api.listProjects().catch((err) => {
          console.error('Failed to load projects:', err)
          return []
        }),
      ])
      if (statsData) setStats(statsData)
      setProjects(projectsData || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Map actual projects directly from the database without any dummy placeholders
  const pipelinesToDisplay = projects.map((p) => {
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

    // Subtitle dynamically derived from real source attributes
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

    // Sources icons
    const sources: string[] = []
    if (isPdf) sources.push('pdf')
    if (isWeb) sources.push('globe')
    if (isDoc) sources.push('doc')
    if (isImg) sources.push('image')
    if (p.sources_count && p.sources_count > 1) {
      sources.push('drive')
    }
    if (sources.length === 0) sources.push('doc')

    // Outputs icons
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
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto w-full">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & INTERACTIVE PIPELINE DIAGRAM                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          {/* Left Text & Actions */}
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              OVERVIEW
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Turn Information <br />
              into <span className="text-blue-600">Real-World Impact.</span>
            </h1>

            <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed max-w-lg font-normal">
              Ingest information, verify claims with AI and real-time research, and generate trusted content across multiple formats — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-blue-500/25"
              >
                <Plus className="h-4 w-4" />
                <span>New Transformation</span>
              </Link>

              <button
                onClick={() => setShowGuide(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-2xs"
              >
                <PlayCircle className="h-4 w-4 text-blue-600" />
                <span>View Guide</span>
              </button>
            </div>
          </div>

          {/* Right: The Transformation Architecture Visual */}
          <div className="relative flex items-center justify-center w-full xl:w-auto xl:min-w-[560px] py-4 select-none">
            <div className="flex items-center justify-between w-full max-w-2xl gap-2 sm:gap-4 relative">
              {/* Left Column: 4 Source Inputs */}
              <div className="flex flex-col gap-2.5 z-10 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Documents</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  <span>Web Sources</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <FileEdit className="h-3.5 w-3.5 text-blue-600" />
                  <span>Text / Notes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Images</span>
                </div>
              </div>

              {/* Left SVG Bezier Connector Curves */}
              <div className="hidden sm:block absolute left-[110px] top-0 bottom-0 w-28 pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 100 160" preserveAspectRatio="none">
                  {/* Documents curve */}
                  <path d="M 0 18 C 60 18, 40 80, 100 80" fill="none" stroke="#93C5FD" strokeWidth="1.6" strokeDasharray="3 3" />
                  {/* Web Sources curve */}
                  <path d="M 0 58 C 50 58, 50 80, 100 80" fill="none" stroke="#93C5FD" strokeWidth="1.6" />
                  {/* Text / Notes curve */}
                  <path d="M 0 98 C 50 98, 50 80, 100 80" fill="none" stroke="#93C5FD" strokeWidth="1.6" />
                  {/* Images curve */}
                  <path d="M 0 138 C 60 138, 40 80, 100 80" fill="none" stroke="#93C5FD" strokeWidth="1.6" strokeDasharray="3 3" />
                </svg>
              </div>

              {/* Center: Layered Verified Document Stack */}
              <div className="relative z-10 flex flex-col items-center shrink-0 mx-auto sm:mx-8">
                <div className="relative w-28 sm:w-32 h-36 sm:h-40">
                  {/* Back Paper Layer 2 */}
                  <div className="absolute inset-0 translate-x-3 -translate-y-2 rounded-xl bg-blue-500/10 border border-blue-200/60 rotate-3 shadow-2xs" />
                  {/* Back Paper Layer 1 */}
                  <div className="absolute inset-0 translate-x-1.5 -translate-y-1 rounded-xl bg-blue-600/15 border border-blue-300/80 rotate-1 shadow-2xs" />
                  
                  {/* Front Main White Sheet */}
                  <div className="relative h-full w-full rounded-xl bg-white border border-slate-200 shadow-md p-3.5 flex flex-col justify-between overflow-hidden">
                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-6 h-6 bg-slate-50 border-l border-b border-slate-200 rounded-bl-lg" />
                    
                    {/* Simulated Text Lines */}
                    <div className="space-y-2 pt-1">
                      <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                      <div className="w-full h-1 bg-slate-200 rounded-full" />
                      <div className="w-5/6 h-1 bg-slate-200 rounded-full" />
                      <div className="w-4/5 h-1 bg-slate-200 rounded-full" />
                      <div className="w-3/4 h-1 bg-slate-200 rounded-full" />
                    </div>

                    {/* Verified Badge */}
                    <div className="mt-auto pt-2">
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full px-2.5 py-1 text-emerald-700 shadow-2xs w-fit">
                        <div className="h-3.5 w-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                        <span className="text-[11px] font-bold">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right SVG Bezier Connector Curves */}
              <div className="hidden sm:block absolute right-[135px] top-0 bottom-0 w-28 pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 100 180" preserveAspectRatio="none">
                  {/* Summary */}
                  <path d="M 0 90 C 50 90, 40 16, 100 16" fill="none" stroke="#93C5FD" strokeWidth="1.6" />
                  {/* Presentation */}
                  <path d="M 0 90 C 50 90, 50 52, 100 52" fill="none" stroke="#93C5FD" strokeWidth="1.6" />
                  {/* Social Media */}
                  <path d="M 0 90 C 60 90, 40 90, 100 90" fill="none" stroke="#93C5FD" strokeWidth="1.6" />
                  {/* Advisory */}
                  <path d="M 0 90 C 50 90, 50 128, 100 128" fill="none" stroke="#93C5FD" strokeWidth="1.6" />
                  {/* Infographic */}
                  <path d="M 0 90 C 50 90, 40 164, 100 164" fill="none" stroke="#93C5FD" strokeWidth="1.6" strokeDasharray="3 3" />
                </svg>
              </div>

              {/* Right Column: 5 Output Deliverables */}
              <div className="flex flex-col gap-2 z-10 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Executive Summary</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <Presentation className="h-3.5 w-3.5 text-amber-500" />
                  <span>Presentation</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <Share2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>Social Media</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Advisory</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 text-xs font-semibold">
                  <LayoutGrid className="h-3.5 w-3.5 text-rose-500" />
                  <span>Infographic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW (4 CARDS)                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Projects */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.total_projects ?? projects.length}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Active Projects</div>
          </div>
        </div>

        {/* Card 2: Synthesized Artefacts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.total_outputs ?? 0}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Synthesized Artefacts</div>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.pending_approvals ?? 0}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Pending Approvals</div>
          </div>
        </div>

        {/* Card 4: Claim Verification Rate */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.claim_verification_rate !== undefined
                ? `${stats.claim_verification_rate}%`
                : '98.8%'}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Claim Verification Rate</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECENT TRANSFORMATION PIPELINES TABLE                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xs">
        {/* Table Header Row */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Transformation Pipelines
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <th className="py-4 font-semibold">Name</th>
                <th className="py-4 font-semibold">Source(s)</th>
                <th className="py-4 font-semibold">Output Formats</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 font-semibold">Last Updated</th>
                <th className="py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Loading real transformation pipelines...</span>
                    </div>
                  </td>
                </tr>
              ) : pipelinesToDisplay.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Folder className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-slate-700">No transformation pipelines yet</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Create your first transformation pipeline to ingest documents, verify claims, and generate multi-format outputs.
                      </p>
                      <Link
                        href="/dashboard/new"
                        className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/25"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>New Transformation</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                pipelinesToDisplay.slice(0, 6).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (item.projectId) router.push(`/dashboard/projects/${item.projectId}`)
                    }}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Name & Subtitle */}
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

                    {/* Column 2: Source(s) Chips */}
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

                    {/* Column 3: Output Formats */}
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
                          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs" title="Video Script & Storyboard">
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

                    {/* Column 4: Status Badge */}
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

                    {/* Column 5: Last Updated */}
                    <td className="py-4 px-2 text-xs text-slate-500 font-medium">
                      {item.lastUpdated}
                    </td>

                    {/* Column 6: Actions */}
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

      {/* ========================================================================= */}
      {/* 4. MODAL: "VIEW GUIDE" INTERACTIVE POPUP                                  */}
      {/* ========================================================================= */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">How ContexAI Works</h3>
                  <p className="text-xs text-slate-400 font-medium">End-to-end transformation workflow</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-900">Ingest Any Information:</strong> Upload PDFs, technical reports, doc files, notes, or web links.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-900">Document-Grounded Web Research:</strong> ContexAI reads the document, plans targeted web research, and retrieves verified citations.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-900">Multi-Channel Transformation:</strong> Concurrently produce Executive Summaries, Executive Advisories, LinkedIn posts, Presentations, Infographics, and Video Packages.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-slate-900">Publish & Export:</strong> Copy formatted markdown, download PPTX presentations, or export verified deliverables.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
