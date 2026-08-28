'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FolderKanban,
  FileText,
  Layers,
  ShieldCheck,
  Plus,
  ArrowRight,
  Send,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, DashboardStats } from '@/types'

export default function DashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, projectsData] = await Promise.all([
        api.getStats().catch(() => ({
          total_projects: 0,
          total_sources: 0,
          total_outputs: 0,
          total_approved: 0,
          total_published: 0,
          average_quality_score: 0,
          publishing_jobs_count: 0,
        })),
        api.listProjects().catch(() => []),
      ])
      setStats(statsData)
      setProjects(projectsData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-10 animate-fade-in pb-16 max-w-7xl mx-auto w-full">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transformation Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Transform unstructured reports and raw data into certified executive, technical, and social communications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-indigo-500 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Transformation</span>
          </Link>
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Transformations */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Projects & Sources
            </span>
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 border border-sky-100">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_projects || 0}
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium block">
            {stats?.total_sources || 0} total ingested documents
          </span>
        </div>

        {/* Outputs Generated */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Generated Artefacts
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 border border-indigo-100">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_outputs || 0}
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium block">
            Across 7 format generators
          </span>
        </div>

        {/* Average Quality Score */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Quality
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">
            {stats && stats.total_outputs > 0 ? `${stats.average_quality_score.toFixed(1)}%` : '--'}
          </div>
          <span className="text-xs sm:text-sm text-emerald-700 font-semibold block">
            {stats && stats.total_outputs > 0 ? 'Source-grounded & fact-checked' : 'No evaluations yet'}
          </span>
        </div>

        {/* Approved & Published */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-xs hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Published via n8n
            </span>
            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600 border border-cyan-100">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_published || 0}
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium block">
            {stats?.total_approved || 0} approved for automation
          </span>
        </div>
      </div>

      {/* RECENT PROJECTS & TEMPLATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Projects (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <FolderKanban className="h-5 w-5 text-sky-600" />
              Recent Transformation Projects
            </h3>
            <Link
              href="/dashboard/projects"
              className="text-sm font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500 font-medium">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4 bg-white">
              <p className="text-base text-slate-600 font-medium">No transformation projects created yet.</p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-300 px-5 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Project</span>
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-xs">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  className="p-5 sm:p-6 flex items-center justify-between gap-5 hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900 hover:text-sky-700 transition-colors">
                        {p.title}
                      </h4>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-bold font-mono border border-slate-200">
                        {p.domain}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1 font-medium">
                      {p.description || 'Verified canonical transformation project.'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-medium flex-wrap">
                      <span>{p.sources_count || 0} Source Document(s)</span>
                      <span>•</span>
                      <span>{p.outputs_count || 0} Artefacts Generated</span>
                      <span>•</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-sky-700 flex items-center gap-1 hover:translate-x-1 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Templates Quick Start (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Quick Start Presets
          </h3>

          <div className="space-y-3.5">
            {[
              {
                id: 'cyber_advisory',
                title: 'Cybersecurity Threat Advisory',
                desc: 'Severity scoring, IoCs, affected systems, and mandatory mitigation steps.',
                tag: 'Security',
                formats: ['Advisory', 'LinkedIn', 'PPTX'],
              },
              {
                id: 'exec_brief',
                title: 'Executive Decision Brief',
                desc: 'In-depth 3-page briefing for board members, key findings, and risk matrix.',
                tag: 'Leadership',
                formats: ['Exec Brief', 'PPTX'],
              },
              {
                id: 'public_announcement',
                title: 'Government Public Notice',
                desc: 'Formal regulatory communication with Kannada and Hindi translations.',
                tag: 'Government',
                formats: ['Advisory', 'Social', 'FAQ'],
              },
              {
                id: 'social_campaign',
                title: 'Enterprise Social Campaign',
                desc: 'LinkedIn thought leadership post, CTA, and X/Twitter thread.',
                tag: 'Social',
                formats: ['LinkedIn', 'Twitter'],
              },
            ].map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/dashboard/new?template=${tmpl.id}`)}
                className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2.5 hover:border-sky-300 hover:shadow-md cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-slate-900">{tmpl.title}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-mono font-bold border border-indigo-100">
                    {tmpl.tag}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">{tmpl.desc}</p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {tmpl.formats.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
