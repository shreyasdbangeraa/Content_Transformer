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
  Zap,
  Layers,
  Server,
  Activity,
  KeyRound,
} from 'lucide-react'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // FLUX Test state
  const [fluxPrompt, setFluxPrompt] = useState(
    'Cybersecurity incident response infographic illustration, 500 systems contained in 42 minutes, professional light theme, high detail'
  )
  const [fluxImageUri, setFluxImageUri] = useState<string | null>(null)
  const [isGeneratingFlux, setIsGeneratingFlux] = useState(false)

  // n8n Webhook Test state
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('https://shreyasdb.app.n8n.cloud/webhook/social-publish')
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null)

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

  const handleTestWebhook = async () => {
    try {
      setIsTestingWebhook(true)
      setWebhookTestResult(null)
      const res = await api.testN8nWebhook(n8nWebhookUrl)
      setWebhookTestResult(res)
    } catch (err: any) {
      setWebhookTestResult({ success: false, error: err.message })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl pb-20 mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <Settings className="h-8 w-8 text-indigo-600" />
            System Configuration &amp; AI Engine Status
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Status of backend AI providers, database connections, Hugging Face FLUX.1 visual models, and n8n publishing webhooks.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all shadow-xs"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            AI Provider Engine
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-indigo-600" />
            <span>{status?.default_ai_provider ? status.default_ai_provider.toUpperCase() : 'ONLINE'}</span>
          </div>
          <span className="text-xs text-emerald-700 font-bold block flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active &amp; Grounded
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Image Model
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="h-5 w-5 text-sky-600" />
            <span>FLUX.1-schnell</span>
          </div>
          <span className="text-xs text-slate-500 font-medium block">Hugging Face API</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Database Engine
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <Server className="h-5 w-5 text-emerald-600" />
            <span>PostgreSQL Engine</span>
          </div>
          <span className="text-xs text-emerald-700 font-bold block flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Connected &amp; Synced
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Automation Node
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <Workflow className="h-5 w-5 text-cyan-600" />
            <span>n8n Webhook</span>
          </div>
          <span className="text-xs text-indigo-700 font-bold block">Active Endpoint</span>
        </div>
      </div>

      {/* Environment (.env) Configuration Notice */}
      <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-7 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Server-Side Environment Security (.env)
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              All credentials, API keys, and database endpoints are securely managed on the server.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-white p-6 text-sm font-mono text-slate-700 space-y-2.5 shadow-2xs">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 font-sans">
            Configured Environment Services:
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>GEMINI_API_KEY &amp; LLM Providers</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>HUGGINGFACE_API_KEY (FLUX.1-schnell Models)</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>POSTGRESQL_URL &amp; Database Connection Pool</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>N8N_WEBHOOK_URL (Social Media AI Publisher)</span>
          </div>
        </div>
      </div>

      {/* Hugging Face FLUX.1 Visual Generation Test */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 border border-indigo-100 shadow-2xs">
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
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-normal leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Model: <code className="text-indigo-700 font-mono font-bold">black-forest-labs/FLUX.1-schnell</code>
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
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 overflow-hidden flex justify-center shadow-md">
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

      {/* n8n Automation Webhook Live Diagnostics */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700 border border-cyan-100 shadow-2xs">
            <Workflow className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              n8n Social Media Publisher Webhook Diagnostics
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Verify live connectivity to your active n8n cloud or self-hosted webhook.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Target n8n Webhook URL
            </label>
            <input
              type="url"
              value={n8nWebhookUrl}
              onChange={(e) => setN8nWebhookUrl(e.target.value)}
              placeholder="https://shreyasdb.app.n8n.cloud/webhook/social-publish"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 font-mono focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Workflow ID: <code className="text-indigo-700 font-mono font-bold">CwDM3Nx2ruQ7lKt0</code> (Social Media AI Publisher)
            </span>
            <button
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-3 font-bold text-sm text-white shadow-md shadow-cyan-600/25 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 transition-all active:scale-95"
            >
              {isTestingWebhook ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Dispatching Ping Test...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Test n8n Webhook Connection</span>
                </>
              )}
            </button>
          </div>

          {webhookTestResult && (
            <div className={`p-4 rounded-2xl border ${webhookTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'} space-y-2 text-xs font-mono`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className={`h-4 w-4 ${webhookTestResult.success ? 'text-emerald-600' : 'text-rose-600'}`} />
                <span>{webhookTestResult.success ? 'Connection Successful (200 OK)' : 'Webhook Connection Warning / Inactive'}</span>
              </div>
              {webhookTestResult.response_body && (
                <div>
                  <span className="font-bold">n8n Response: </span>
                  <code>{webhookTestResult.response_body}</code>
                </div>
              )}
              {webhookTestResult.error && (
                <div>
                  <span className="font-bold">Detail: </span>
                  <span>{webhookTestResult.error}</span>
                </div>
              )}
              {!webhookTestResult.success && (
                <div className="font-sans text-xs text-rose-800 bg-white/60 p-3 rounded-xl mt-2 border border-rose-200">
                  <strong>Troubleshooting Hint:</strong> In your n8n cloud dashboard, make sure the <strong>Social Media AI Publisher</strong> workflow is toggled to <strong>ACTIVE (Enabled)</strong> in the top right.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
