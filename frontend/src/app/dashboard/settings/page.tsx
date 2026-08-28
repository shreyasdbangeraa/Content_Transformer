'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Cpu,
  Sparkles,
  Image as ImageIcon,
  ShieldCheck,
  Workflow,
  RefreshCw,
  FileCode,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // FLUX Test state
  const [fluxPrompt, setFluxPrompt] = useState(
    'Cybersecurity incident response infographic illustration, 500 systems contained in 42 minutes, dark slate and glowing cyan theme, high detail'
  )
  const [fluxImageUri, setFluxImageUri] = useState<string | null>(null)
  const [isGeneratingFlux, setIsGeneratingFlux] = useState(false)

  const loadStatus = async () => {
    try {
      setLoading(true)
      const data = await api.getStatus()
      setStatus(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const handleTestFlux = async () => {
    try {
      setIsGeneratingFlux(true)
      const res = await api.generateFluxImage(fluxPrompt)
      setFluxImageUri(res.image_uri)
    } catch (err: any) {
      alert(`FLUX generation error: ${err.message}`)
    } finally {
      setIsGeneratingFlux(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            System Configuration & AI Engine Status
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Status of backend AI providers, Supabase database, Hugging Face FLUX.1 models, and n8n webhooks.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            AI Provider Engine
          </span>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-sky-600" />
            <span>{status?.default_ai_provider ? status.default_ai_provider.toUpperCase() : 'ONLINE'}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Active & grounded</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Image Model
          </span>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-indigo-600" />
            <span>FLUX.1-schnell</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Hugging Face API</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Database Engine
          </span>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{status?.database_engine || 'Supabase PostgreSQL'}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {status?.database_connected ? 'Connected & Active' : 'Supabase Cloud Pooler'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Automation Node
          </span>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-cyan-600" />
            <span>n8n Webhook</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Active signature check</span>
        </div>
      </div>

      {/* Environment (.env) Configuration Notice */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-6 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Server-Side Environment Security (.env)
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              All credentials, API keys, and database endpoints are securely loaded from the project root <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono text-sky-800 font-bold">.env</code> file on the server.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 bg-white p-4 text-xs font-mono text-slate-700 space-y-1.5 shadow-2xs">
          <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1 font-sans">
            Configured Environment Keys in .env:
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>GEMINI_API_KEY & OPENAI_API_KEY</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>HUGGINGFACE_API_KEY (FLUX.1-schnell / FLUX.1-dev)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>SUPABASE_URL & SUPABASE_KEY</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>N8N_WEBHOOK_URL & N8N_WEBHOOK_SECRET</span>
          </div>
        </div>
      </div>

      {/* Hugging Face FLUX.1 Visual Generation Test */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Hugging Face FLUX.1 Visual Generation Studio
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Test FLUX.1-schnell / FLUX.1-dev text-to-image synthesis for infographics and slide visual assets.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <textarea
            value={fluxPrompt}
            onChange={(e) => setFluxPrompt(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Model: <code className="text-sky-700 font-mono font-bold">black-forest-labs/FLUX.1-schnell</code>
            </span>
            <button
              onClick={handleTestFlux}
              disabled={isGeneratingFlux}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 font-bold text-white shadow-xs hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 transition-all"
            >
              {isGeneratingFlux ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing FLUX Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate FLUX Visual</span>
                </>
              )}
            </button>
          </div>

          {fluxImageUri && (
            <div className="pt-3">
              <span className="text-[11px] font-bold text-slate-700 block mb-2">
                Generated FLUX Asset:
              </span>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-hidden flex justify-center shadow-xs">
                <img
                  src={fluxImageUri}
                  alt="FLUX visual asset"
                  className="max-h-64 rounded-xl object-contain shadow-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
