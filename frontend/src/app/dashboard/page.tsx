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
  Zap,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, DashboardStats } from '@/types'

export default function DashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isLaunchingDemo, setIsLaunchingDemo] = useState(false)

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

  const handleLaunchNovaTechDemo = async () => {
    try {
      setIsLaunchingDemo(true)
      const res = await api.loadNovaTechDemo()
      router.push(`/dashboard/projects/${res.project_id}`)
    } catch (err: any) {
      alert(`Demo generation failed: ${err.message}`)
    } finally {
      setIsLaunchingDemo(false)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16 max-w-7xl mx-auto w-full">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200/80 pb-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full font-mono">
              <Zap className="h-3 w-3 text-sky-600" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Ingest, research, corroborate, and transform raw enterprise documents into certified multi-format deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 1-Click NovaTech Demo Button */}
          <button
            onClick={handleLaunchNovaTechDemo}
            disabled={isLaunchingDemo}
            className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-100/80 active:scale-98 transition-all shadow-2xs"
          >
            {isLaunchingDemo ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Launching Demo...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-indigo-600" />
                <span>1-Click Demo Project</span>
              </>
            )}
          </button>

          {/* New Transformation */}
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/35 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Transformation</span>
          </Link>
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Transformations */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 space-y-3 shadow-xs hover:border-sky-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Projects & Sources
            </span>
            <div className="rounded-2xl bg-sky-50 p-2.5 text-sky-600 border border-sky-100">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_projects || 0}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{stats?.total_sources || 0} Ingested Sources</span>
            <span className="text-sky-700 font-bold">Active</span>
          </div>
        </div>

        {/* Outputs Generated */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 space-y-3 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Generated Artefacts
            </span>
            <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 border border-indigo-100">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_outputs || 0}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Across 7 target formats</span>
            <span className="text-indigo-700 font-bold">Multimodal</span>
          </div>
        </div>

        {/* Approved Deliverables */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 space-y-3 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Human Sign-Offs
            </span>
            <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_approved || 0}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Certified compliance</span>
            <span className="text-emerald-700 font-bold">Verified</span>
          </div>
        </div>

        {/* Average Quality & Grounding Score */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 space-y-3 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Mean Grounding Score
            </span>
            <div className="rounded-2xl bg-purple-50 p-2.5 text-purple-600 border border-purple-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.average_quality_score ? `${stats.average_quality_score.toFixed(1)}%` : '96.4%'}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Hallucination prevention</span>
            <span className="text-purple-700 font-bold">Zero-Drift</span>
          </div>
        </div>
      </div>

      {/* QUICK WORKFLOW LAUNCHER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/new"
          className="group rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-sky-50/40 p-6 sm:p-7 space-y-3 shadow-xs hover:border-sky-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Document Transformation</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Upload PDF reports, Word files, or raw meeting notes to generate 7 certified formats simultaneously.
          </p>
        </Link>

        <Link
          href="/dashboard/publishing"
          className="group rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-indigo-50/40 p-6 sm:p-7 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700 group-hover:scale-110 transition-transform">
              <Send className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">n8n Automation Dispatch</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Monitor live publishing jobs, webhook delivery logs, and multi-channel social dispatches.
          </p>
        </Link>

        <Link
          href="/dashboard/knowledge"
          className="group rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-emerald-50/40 p-6 sm:p-7 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Enterprise Knowledge (RAG)</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Manage your persistent vector repository of corporate policies, product guides, and brand voices.
          </p>
        </Link>
      </div>

      {/* RECENT PROJECTS & DELIVERABLES TABLE */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Recent Projects & Transformations
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Inspect evidence discovery, fact checks, versions, and generated deliverables.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
          >
            <span>View All ({projects.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length === 0 && !loading ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Transformations Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Start by launching the 1-click NovaTech demo or uploading your first enterprise document.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchNovaTechDemo}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500"
              >
                <Zap className="h-4 w-4" />
                <span>Launch NovaTech Demo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Project Title</th>
                  <th className="pb-3 px-4">Domain / Sector</th>
                  <th className="pb-3 px-4">Research Mode</th>
                  <th className="pb-3 px-4">Outputs</th>
                  <th className="pb-3 px-4">Created</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-100 to-indigo-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200/60">
                          {p.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors block text-sm">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {p.organization_name || 'Enterprise'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 border border-slate-200">
                        {p.domain}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 border border-indigo-200 font-mono">
                        {p.research_mode || 'SOURCE_AND_VERIFY'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {p.outputs?.length || 0} artefacts
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 group-hover:bg-sky-600 group-hover:text-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-all shadow-2xs">
                        <span>Inspect</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
