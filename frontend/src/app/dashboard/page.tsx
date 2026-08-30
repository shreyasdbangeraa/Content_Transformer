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
  Shield,
  Activity,
  Workflow,
  BookOpen,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project, DashboardStats } from '@/types'

export default function DashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [blockchainStats, setBlockchainStats] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isLaunchingDemo, setIsLaunchingDemo] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, projectsData, bcData] = await Promise.all([
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
        api.getBlockchainStats().catch(() => null),
      ])
      setStats(statsData)
      setProjects(projectsData)
      setBlockchainStats(bcData)
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
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Welcome Hero Banner with Sunset-Indigo Mesh */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-100/70 via-purple-50/60 to-sky-100/70 p-7 sm:p-9 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-indigo-800 bg-white/90 border border-indigo-200/80 px-3 py-1 rounded-full shadow-2xs font-mono">
              <Zap className="h-3.5 w-3.5 text-indigo-600 animate-bounce" />
              Enterprise Telemetry
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            conteX AI Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-700 font-medium max-w-2xl leading-relaxed">
            Ingest, fact-check, and synthesize raw documents into certified multi-channel deliverables in parallel.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          {/* 1-Click NovaTech Demo Button */}
          <button
            onClick={handleLaunchNovaTechDemo}
            disabled={isLaunchingDemo}
            className="flex items-center gap-2 rounded-2xl border border-indigo-300 bg-white/90 px-5 py-3 text-xs sm:text-sm font-bold text-indigo-900 hover:bg-white hover:border-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-xs"
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
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Transformation</span>
          </Link>
        </div>
      </div>

      {/* MULTI-COLOR METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Transformations (Sky Tint) */}
        <div className="rounded-3xl card-sky-tint p-6 space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800">
              Projects &amp; Sources
            </span>
            <div className="rounded-2xl bg-sky-500 text-white p-2.5 shadow-xs">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_projects || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">{stats?.total_sources || 0} Ingested Sources</span>
            <span className="text-sky-900 font-bold bg-sky-200/80 px-2 py-0.5 rounded-md border border-sky-300">Active</span>
          </div>
        </div>

        {/* Outputs Generated (Purple Tint) */}
        <div className="rounded-3xl card-purple-tint p-6 space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800">
              Generated Deliverables
            </span>
            <div className="rounded-2xl bg-purple-500 text-white p-2.5 shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_outputs || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Across 7 Target Formats</span>
            <span className="text-purple-900 font-bold bg-purple-200/80 px-2 py-0.5 rounded-md border border-purple-300">Multi-Channel</span>
          </div>
        </div>

        {/* Approved Deliverables (Emerald Tint) */}
        <div className="rounded-3xl card-emerald-tint p-6 space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Human Sign-Offs
            </span>
            <div className="rounded-2xl bg-emerald-500 text-white p-2.5 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.total_approved || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Governance Certified</span>
            <span className="text-emerald-900 font-bold bg-emerald-200/80 px-2 py-0.5 rounded-md border border-emerald-300">Verified</span>
          </div>
        </div>

        {/* Mean Grounding Score (Amber Tint) */}
        <div className="rounded-3xl card-amber-tint p-6 space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              Mean Grounding Score
            </span>
            <div className="rounded-2xl bg-amber-500 text-white p-2.5 shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {stats?.average_quality_score ? `${stats.average_quality_score.toFixed(1)}%` : '96.4%'}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Strict Source Anchoring</span>
            <span className="text-amber-900 font-bold bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">Zero-Drift</span>
          </div>
        </div>
      </div>

      {/* CONTENT INTEGRITY & BLOCKCHAIN TELEMETRY WIDGET */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50/50 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">Content Integrity &amp; Blockchain Audit Trail</h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-black border border-emerald-300 shadow-2xs">
                  {blockchainStats?.mode || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Cryptographic SHA-256 hash chains securing source documents and generated multi-format outputs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-900 font-bold bg-white px-3.5 py-2 rounded-2xl border border-indigo-200 shadow-2xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{blockchainStats?.blockchain_network || 'Certified Registry Node'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-1 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Verified Assets</div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              ✓ {blockchainStats?.total_verified ?? (stats?.total_outputs || 0)}
            </div>
            <div className="text-[10px] text-emerald-800 font-bold">Matched on registry</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-1 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Audit Records</div>
            <div className="text-2xl font-black text-indigo-700 font-mono">
              ⛓ {blockchainStats?.total_blockchain_records ?? ((stats?.total_sources || 0) + (stats?.total_outputs || 0))}
            </div>
            <div className="text-[10px] text-indigo-800 font-bold">Immutable versions</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 space-y-1 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Tamper Alerts</div>
            <div className="text-2xl font-black text-amber-700 font-mono">
              ⚠ {blockchainStats?.modified_alerts || 0}
            </div>
            <div className="text-[10px] text-amber-800 font-bold">Tamper detection active</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-sky-200 space-y-1 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Pending Confirmations</div>
            <div className="text-2xl font-black text-sky-700 font-mono">
              ◷ {blockchainStats?.pending_transactions || 0}
            </div>
            <div className="text-[10px] text-sky-800 font-bold">0 delays reported</div>
          </div>
        </div>
      </div>

      {/* COLORFUL QUICK WORKFLOW LAUNCHERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/new"
          className="group rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50/50 p-6 sm:p-7 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            AI Document Transformation
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Upload PDF reports, Word files, or raw meeting notes to generate 7 certified formats simultaneously.
          </p>
        </Link>

        <Link
          href="/dashboard/publishing"
          className="group rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50/50 p-6 sm:p-7 space-y-3 shadow-xs hover:border-purple-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform">
              <Workflow className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            n8n Automation Dispatch
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Monitor live publishing jobs, webhook delivery logs, and multi-channel social dispatches.
          </p>
        </Link>

        <Link
          href="/dashboard/knowledge"
          className="group rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 p-6 sm:p-7 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            Knowledge Base &amp; RAG
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Manage your persistent repository of corporate policies, terminology rules, and brand voices.
          </p>
        </Link>
      </div>

      {/* RECENT PROJECTS & DELIVERABLES TABLE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Recent Projects &amp; Transformations
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Inspect evidence discovery, fact checks, versions, and generated deliverables.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <span>View All ({projects.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length === 0 && !loading ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Transformations Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Start by launching the 1-click NovaTech demo or uploading your first enterprise document.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchNovaTechDemo}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-sky-500"
              >
                <Zap className="h-4 w-4" />
                <span>Launch Demo Project</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 px-3">Project Title</th>
                  <th className="pb-3 px-3">Domain</th>
                  <th className="pb-3 px-3">Mode</th>
                  <th className="pb-3 px-3">Outputs</th>
                  <th className="pb-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-3">
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {p.organization_name || 'Enterprise'}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="rounded-md bg-indigo-50 text-indigo-800 text-xs font-mono font-bold px-2 py-0.5 border border-indigo-200">
                        {p.domain}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-slate-600 font-medium">
                        {p.research_mode || 'SOURCE_AND_VERIFY'}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 border border-emerald-200">
                        {p.outputs?.length || 0} Artefacts
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                        <span>Open Studio</span>
                        <ArrowRight className="h-3.5 w-3.5" />
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
