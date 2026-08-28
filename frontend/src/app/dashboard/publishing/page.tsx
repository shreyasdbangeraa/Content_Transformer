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
} from 'lucide-react'
import { api } from '@/lib/api'
import { PublishingJob } from '@/types'

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

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <Workflow className="h-8 w-8 text-sky-600" />
            n8n Automation & Social Publishing Hub
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Approved communication deliverables trigger automated n8n webhooks for scheduled social distribution.
          </p>
        </div>

        <button
          onClick={loadJobs}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Integration Status Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white p-2.5 shadow-sm">
              <Workflow className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                n8n Webhook Ingestion Pipeline
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
              </h3>
              <p className="text-sm text-slate-600 mt-0.5 font-medium">
                Target workflow: <code className="text-sky-700 font-mono font-bold">POST /webhook/content-publish</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold px-4 py-2 flex items-center gap-2 shadow-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Signature & Approval Verified</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 flex items-center gap-4 shadow-xs">
            <Linkedin className="h-6 w-6 text-sky-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">LinkedIn Publishing</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">n8n Schedule node active</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 flex items-center gap-4 shadow-xs">
            <Twitter className="h-6 w-6 text-sky-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">X / Twitter Threads</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Thread pagination ready</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 flex items-center gap-4 shadow-xs">
            <Instagram className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Instagram Visuals</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">FLUX.1 image asset dispatch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Publishing Jobs History */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-sky-600" />
          Dispatched Publishing Jobs History
        </h3>

        {loading ? (
          <div className="p-16 text-center text-sm font-bold text-slate-500">Loading jobs history...</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 p-16 text-center space-y-3 text-slate-500 bg-white">
            <p className="font-bold text-base text-slate-800">No jobs dispatched yet.</p>
            <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
              Approved deliverables will appear here when sent to n8n from the Transformation Studio.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-xs">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-bold uppercase border border-slate-200">
                      {job.platform}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-bold uppercase ${
                        job.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {job.payload?.title || `Output ${job.output_id.slice(0, 8)}`}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span>Job ID: {job.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>Dispatched: {new Date(job.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-200 max-w-md overflow-hidden text-slate-700 font-mono truncate font-medium">
                  {job.response_data?.message || JSON.stringify(job.response_data)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
