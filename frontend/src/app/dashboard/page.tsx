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
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Enterprise Transformation Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Transform raw intelligence into verified executive, technical, and social communications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Transformation</span>
          </Link>
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transformations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Projects & Sources
            </span>
            <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.total_projects || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {stats?.total_sources || 0} total ingested documents
          </span>
        </div>

        {/* Outputs Generated */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Generated Artefacts
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.total_outputs || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Across 7 format generators
          </span>
        </div>

        {/* Average Quality Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Average Quality
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {stats && stats.total_outputs > 0 ? `${stats.average_quality_score.toFixed(1)}%` : '--'}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {stats && stats.total_outputs > 0 ? 'Source-grounded & fact-checked' : 'No evaluations yet'}
          </span>
        </div>

        {/* Approved & Published */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Published via n8n
            </span>
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.total_published || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {stats?.total_approved || 0} approved for automation
          </span>
        </div>
      </div>

      {/* RECENT PROJECTS & TEMPLATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Projects (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-sky-600" />
              Recent Transformation Projects
            </h3>
            <Link
              href="/dashboard/projects"
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3 bg-white">
              <p className="text-xs text-slate-500 font-medium">No transformation projects created yet.</p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-300 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Your First Project</span>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-xs">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 hover:text-sky-700 transition-colors">
                        {p.title}
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">
                        {p.domain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                      {p.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-medium">
                      <span>{p.sources_count || 0} Source(s)</span>
                      <span>•</span>
                      <span>{p.outputs_count || 0} Artefacts Generated</span>
                      <span>•</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-sky-700 flex items-center gap-1 hover:translate-x-1 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Templates Quick Start (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Quick Start Templates
          </h3>

          <div className="space-y-3">
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
                desc: 'Concise 1-page briefing for board members, key findings, and telemetry.',
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
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 hover:border-sky-300 hover:shadow-sm cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{tmpl.title}</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                    {tmpl.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{tmpl.desc}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  {tmpl.formats.map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium"
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
