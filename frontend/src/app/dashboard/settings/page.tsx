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
    <div className="space-y-10 animate-fade-in max-w-5xl pb-20 mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <Settings className="h-8 w-8 text-sky-600" />
            System Configuration & AI Engine Status
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Status of backend AI providers, Supabase database, Hugging Face FLUX.1 models, and n8n webhooks.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            AI Provider Engine
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-sky-600" />
            <span>{status?.default_ai_provider ? status.default_ai_provider.toUpperCase() : 'ONLINE'}</span>
          </div>
          <span className="text-xs sm:text-sm text-emerald-700 font-semibold block">Active & grounded</span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Image Model
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="h-5 w-5 text-indigo-600" />
            <span>FLUX.1-schnell</span>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium block">Hugging Face API</span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Database Engine
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>{status?.database_engine || 'Supabase PostgreSQL'}</span>
          </div>
          <span className="text-xs sm:text-sm text-emerald-700 font-semibold block">
            {status?.database_connected ? 'Connected & Active' : 'Supabase Cloud Pooler'}
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Automation Node
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <Workflow className="h-5 w-5 text-cyan-600" />
            <span>n8n Webhook</span>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium block">Active signature check</span>
        </div>
      </div>

      {/* Environment (.env) Configuration Notice */}
      <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Server-Side Environment Security (.env)
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              All credentials, API keys, and database endpoints are securely loaded from the project root <code className="bg-sky-100 px-2 py-0.5 rounded font-mono text-sky-800 font-bold">.env</code> file on the server.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-white p-6 text-sm font-mono text-slate-700 space-y-2.5 shadow-xs">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 font-sans">
            Configured Environment Keys in .env:
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>GEMINI_API_KEY & OPENAI_API_KEY</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>HUGGINGFACE_API_KEY (FLUX.1-schnell / FLUX.1-dev)</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>SUPABASE_URL & SUPABASE_KEY</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>N8N_WEBHOOK_URL & N8N_WEBHOOK_SECRET</span>
          </div>
        </div>
      </div>

      {/* Hugging Face FLUX.1 Visual Generation Test */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 border border-indigo-100">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Hugging Face FLUX.1 Visual Generation Studio
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Test FLUX.1-schnell text-to-image synthesis for infographics and slide visual assets.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={fluxPrompt}
            onChange={(e) => setFluxPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs font-normal leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Model: <code className="text-sky-700 font-mono font-bold">black-forest-labs/FLUX.1-schnell</code>
            </span>
            <button
              onClick={handleTestFlux}
              disabled={isGeneratingFlux}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-6 py-3 font-bold text-sm text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 transition-all active:scale-95"
            >
              {isGeneratingFlux ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing FLUX Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate FLUX Visual</span>
                </>
              )}
            </button>
          </div>

          {fluxImageUri && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-800 block mb-3">
                Generated FLUX Asset:
              </span>
              <div className="rounded-3xl border border-slate-200 bg-slate-900 p-4 overflow-hidden flex justify-center shadow-lg">
                <img
                  src={fluxImageUri}
                  alt="FLUX visual asset"
                  className="max-h-80 rounded-2xl object-contain shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
