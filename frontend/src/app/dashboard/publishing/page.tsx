'use client'

import React, { useState, useEffect } from 'react'
import {
  Workflow,
  Calendar,
  Linkedin,
  Twitter,
  Instagram,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/api'
import { PublishingJob } from '@/types'
import clsx from 'clsx'

export default function PublishingPage() {
  const [jobs, setJobs] = useState<PublishingJob[]>([])
  const [loading, setLoading] = useState(true)

  const loadJobs = async () => {
    try {
      setLoading(true)
      const data = await api.listPublishingJobs()
      setJobs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-sky-600" />
      case 'twitter':
      case 'x':
        return <Twitter className="h-5 w-5 text-sky-500" />
      case 'instagram':
        return <Instagram className="h-5 w-5 text-rose-600" />
      default:
        return <Workflow className="h-5 w-5 text-indigo-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            PUBLISHED
          </span>
        )
      case 'SCHEDULED':
        return (
          <span className="rounded-md bg-sky-100 text-sky-800 border border-sky-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <Clock className="h-3.5 w-3.5 text-sky-600" />
            SCHEDULED
          </span>
        )
      default:
        return (
          <span className="rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Workflow className="h-8 w-8 text-indigo-600" />
              n8n Automation & Social Publishing Hub
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Human-approved communication deliverables trigger certified automated n8n workflows for multi-channel distribution.
          </p>
        </div>

        <button
          onClick={loadJobs}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-center"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Job Queue</span>
        </button>
      </div>

      {/* Integration Status Banner */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white p-7 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/30 border border-indigo-400/40 text-white p-2.5 shadow-sm">
              <Zap className="h-6 w-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Social Media AI Publisher (n8n Workflow)
                </h3>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">
                Workflow ID: <code className="text-amber-300 font-mono font-bold">CwDM3Nx2ruQ7lKt0</code> • Evidence Grounding & Approval Certified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Strict Human-in-the-Loop Gating Active</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
          <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 p-4 flex items-center gap-3.5">
            <Linkedin className="h-6 w-6 text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">LinkedIn Publisher Node</div>
              <div className="text-[11px] text-indigo-200/80 font-medium">Auto-banner & hook injection</div>
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 p-4 flex items-center gap-3.5">
            <Twitter className="h-6 w-6 text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">X / Twitter Thread Node</div>
              <div className="text-[11px] text-indigo-200/80 font-medium">Sequential thread dispatcher</div>
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 p-4 flex items-center gap-3.5">
            <Instagram className="h-6 w-6 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">Instagram Carousel Node</div>
              <div className="text-[11px] text-indigo-200/80 font-medium">Visual deck staging</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Publishing Jobs Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Publishing Dispatch Queue & Audit Log
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            {jobs.length} total event(s) recorded
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm font-bold text-slate-500">
            Loading publishing queue...
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-medium space-y-2">
            <Workflow className="h-8 w-8 mx-auto text-slate-400" />
            <p>No publishing jobs executed yet.</p>
            <p className="text-xs text-slate-400">
              Approve deliverables in the studio to dispatch them directly to n8n webhooks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3 hover:bg-white hover:border-indigo-300 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-2xs">
                      {getPlatformIcon(job.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm capitalize">
                          {job.payload?.title || `Deliverable (${job.payload?.format_type || job.platform})`}
                        </span>
                        <span className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-mono font-bold px-2 py-0.5 uppercase">
                          {job.platform}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3">
                        <span>Output ID: {job.output_id.slice(0, 8)}...</span>
                        <span>•</span>
                        <span>Grounding: {job.payload?.grounding_score || 100}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    {getStatusBadge(job.status)}
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(job.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {job.response_data?.message && (
                  <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-700 font-medium">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase">n8n Execution Status:</span>
                    {job.response_data.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
