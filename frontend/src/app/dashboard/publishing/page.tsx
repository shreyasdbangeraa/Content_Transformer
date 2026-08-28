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
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-sky-600" />
            n8n Automation & Social Publishing Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Approved communication deliverables trigger automated n8n webhooks for scheduled social distribution.
          </p>
        </div>

        <button
          onClick={loadJobs}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Integration Status Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white p-2 shadow-xs">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                n8n Webhook Endpoint
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Target workflow: <code className="text-sky-700 font-mono font-bold">POST /webhook/content-publish</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Signature & Approval Verified</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 shadow-2xs">
            <Linkedin className="h-5 w-5 text-sky-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">LinkedIn Publishing</div>
              <div className="text-[11px] text-slate-500 font-medium">n8n Schedule node active</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 shadow-2xs">
            <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">X / Twitter Threads</div>
              <div className="text-[11px] text-slate-500 font-medium">Thread pagination ready</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 shadow-2xs">
            <Instagram className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Instagram Visuals</div>
              <div className="text-[11px] text-slate-500 font-medium">FLUX.1 image asset dispatch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Publishing Jobs History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-sky-600" />
          Dispatched Publishing Jobs History
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading jobs history...</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2 text-xs text-slate-500 bg-white">
            <p className="font-bold text-slate-700">No jobs dispatched yet.</p>
            <p className="text-slate-400 text-[11px] font-medium">
              Approved deliverables will appear here when sent to n8n from the Output Studio.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-xs">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                      {job.platform}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        job.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {job.payload?.title || `Output ${job.output_id.slice(0, 8)}`}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5 font-medium">
                    <span>Job ID: {job.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>Dispatched: {new Date(job.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-w-sm overflow-hidden text-slate-600 font-mono text-[11px] truncate font-medium">
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
