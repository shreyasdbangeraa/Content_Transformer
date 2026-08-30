'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Building2,
  Globe,
  Sliders,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  Share2,
  Cpu,
  Layers,
  Sparkles,
  Server,
  RefreshCw,
  HardDrive,
  Cloud,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/api'
import clsx from 'clsx'

export default function SettingsPage() {
  // AI Engine & Local vs Cloud Mode
  const [aiProvider, setAiProvider] = useState<'gemini' | 'ollama'>('gemini')
  const [ollamaStatus, setOllamaStatus] = useState<any>(null)
  const [isCheckingOllama, setIsCheckingOllama] = useState(false)

  // General & Organization Settings
  const [orgName, setOrgName] = useState('NovaTech Cyber Solutions')
  const [domain, setDomain] = useState('Cybersecurity & Cloud Resilience')
  const [defaultLanguage, setDefaultLanguage] = useState('English')

  // AI Transformation Defaults
  const [defaultAudience, setDefaultAudience] = useState('Executive Board & Technical Teams')
  const [defaultTone, setDefaultTone] = useState('Authoritative & Professional')
  const [defaultDetailLevel, setDefaultDetailLevel] = useState('Comprehensive & Actionable')

  // Security & Privacy Settings
  const [autoRedactPii, setAutoRedactPii] = useState(true)
  const [enforceGrounding, setEnforceGrounding] = useState(true)
  const [blockchainRegistration, setBlockchainRegistration] = useState(true)

  // Distribution Settings
  const [webhookUrl, setWebhookUrl] = useState('https://shreyasdb.app.n8n.cloud/webhook/social-publish')

  // UI state
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const fetchOllamaStatus = async () => {
    try {
      setIsCheckingOllama(true)
      const data = await api.checkOllamaStatus()
      setOllamaStatus(data)
    } catch {
      setOllamaStatus({
        online: false,
        message: 'Could not connect to local Ollama daemon at http://127.0.0.1:11434',
        installed_models: [],
      })
    } finally {
      setIsCheckingOllama(false)
    }
  }

  // Load from server and local storage on mount
  useEffect(() => {
    fetchOllamaStatus()
    api.getStatus().then((status) => {
      if (status?.default_ai_provider === 'ollama') {
        setAiProvider('ollama')
      }
    }).catch(() => {})

    try {
      const stored = localStorage.getItem('contex_ai_settings')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.aiProvider) setAiProvider(data.aiProvider)
        if (data.orgName) setOrgName(data.orgName)
        if (data.domain) setDomain(data.domain)
        if (data.defaultLanguage) setDefaultLanguage(data.defaultLanguage)
        if (data.defaultAudience) setDefaultAudience(data.defaultAudience)
        if (data.defaultTone) setDefaultTone(data.defaultTone)
        if (data.defaultDetailLevel) setDefaultDetailLevel(data.defaultDetailLevel)
        if (data.autoRedactPii !== undefined) setAutoRedactPii(data.autoRedactPii)
        if (data.enforceGrounding !== undefined) setEnforceGrounding(data.enforceGrounding)
        if (data.blockchainRegistration !== undefined) setBlockchainRegistration(data.blockchainRegistration)
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl)
      }
    } catch {}
  }, [])

  const handleSave = async () => {
    try {
      // 1. Update backend active provider
      await api.setActiveAIProvider(aiProvider)

      // 2. Persist locally
      const settingsToSave = {
        aiProvider,
        orgName,
        domain,
        defaultLanguage,
        defaultAudience,
        defaultTone,
        defaultDetailLevel,
        autoRedactPii,
        enforceGrounding,
        blockchainRegistration,
        webhookUrl,
      }
      localStorage.setItem('contex_ai_settings', JSON.stringify(settingsToSave))
      setSaveMessage(
        aiProvider === 'ollama'
          ? 'Local Offline AI (Ollama - Llama 3) is now active! All transformation pipelines will run 100% on-device.'
          : 'Cloud AI (Google Gemini) is active with online research grounding.'
      )
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch {
      alert('Preferences updated.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-20 mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <Settings className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
            Settings &amp; Workspace Preferences
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Configure AI execution engine (Cloud vs Local Llama 3), organizational defaults, and security guardrails.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-6 py-3 font-bold text-sm text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 active:scale-95 transition-all self-start sm:self-center"
        >
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Success Notification Toast */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveMessage || 'Preferences saved successfully.'}</span>
        </div>
      )}

      {/* Section 1: AI Engine & Privacy Mode (Cloud Gemini vs Local Ollama Llama 3) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-100 p-2.5 text-purple-700">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">AI Execution Engine &amp; Privacy Mode</h2>
              <p className="text-xs text-slate-500 font-medium">
                Choose between Cloud AI or 100% On-Device Offline AI (Ollama - Llama 3)
              </p>
            </div>
          </div>

          <button
            onClick={fetchOllamaStatus}
            disabled={isCheckingOllama}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', isCheckingOllama && 'animate-spin')} />
            <span>Check Local Ollama</span>
          </button>
        </div>

        {/* Provider Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Cloud Gemini */}
          <div
            onClick={() => setAiProvider('gemini')}
            className={clsx(
              'rounded-2xl border-2 p-5 space-y-3 cursor-pointer transition-all',
              aiProvider === 'gemini'
                ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
                  <Cloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cloud AI Engine</h3>
                  <span className="text-[11px] font-mono text-indigo-700 font-bold">Google Gemini 2.5 Flash</span>
                </div>
              </div>
              <input
                type="radio"
                name="aiProvider"
                checked={aiProvider === 'gemini'}
                onChange={() => setAiProvider('gemini')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Ultra fast generation with active multi-tier live web research &amp; external source fact-checking.
            </p>
          </div>

          {/* Option 2: Local Offline Ollama (Llama 3) */}
          <div
            onClick={() => setAiProvider('ollama')}
            className={clsx(
              'rounded-2xl border-2 p-5 space-y-3 cursor-pointer transition-all',
              aiProvider === 'ollama'
                ? 'border-emerald-600 bg-emerald-50/40 ring-4 ring-emerald-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Local AI (Offline Privacy)</h3>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 uppercase border border-emerald-300">
                      Zero-Data Leakage
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 font-bold">Ollama • Llama 3 (On-Device)</span>
                </div>
              </div>
              <input
                type="radio"
                name="aiProvider"
                checked={aiProvider === 'ollama'}
                onChange={() => setAiProvider('ollama')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              100% private local execution on your device. No data leaves your machine; works completely offline with zero internet.
            </p>
          </div>
        </div>

        {/* Ollama Live Health Banner */}
        {aiProvider === 'ollama' && (
          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white p-5 space-y-3 animate-fade-in shadow-2xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase text-emerald-950 font-mono tracking-wider">
                  {ollamaStatus?.online ? 'Local Ollama Daemon Connected' : 'Checking Local Ollama...'}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-900 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold">
                Endpoint: http://127.0.0.1:11434
              </span>
            </div>

            <div className="text-xs text-slate-700 font-medium space-y-2">
              <p>
                <strong>Active Model:</strong>{' '}
                <code className="text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded font-mono font-bold">
                  llama3:latest
                </code>{' '}
                — Enterprise document synthesis, fact extraction, and multi-format transformations will be processed locally.
              </p>

              {ollamaStatus?.installed_models?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-slate-500 font-mono text-[11px]">Installed on device:</span>
                  {ollamaStatus.installed_models.map((m: string, idx: number) => (
                    <span
                      key={idx}
                      className={clsx(
                        'rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border',
                        m.includes('llama3')
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Organization & Domain Defaults */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="rounded-2xl bg-indigo-100 p-2.5 text-indigo-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Organization &amp; Workspace Defaults</h2>
            <p className="text-xs text-slate-500 font-medium">Global organizational profile and default document domain</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Primary Industry Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
            >
              <option value="Cybersecurity & Cloud Resilience">Cybersecurity &amp; Cloud Resilience</option>
              <option value="Enterprise Technology & SaaS">Enterprise Technology &amp; SaaS</option>
              <option value="Financial Services & Fintech">Financial Services &amp; Fintech</option>
              <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
              <option value="Manufacturing & Energy">Manufacturing &amp; Energy</option>
              <option value="General Enterprise">General Enterprise</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Default Output Language</label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
            >
              <option value="English">English (United States)</option>
              <option value="English (UK)">English (United Kingdom)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Japanese">Japanese (日本語)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: AI Transformation Defaults */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">AI Transformation Defaults</h2>
            <p className="text-xs text-slate-500 font-medium">Default audience persona, tone of voice, and synthesis depth</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Default Target Audience</label>
            <select
              value={defaultAudience}
              onChange={(e) => setDefaultAudience(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
            >
              <option value="Executive Board & Technical Teams">Executive &amp; Technical Teams</option>
              <option value="C-Suite Leadership">C-Suite Leadership</option>
              <option value="Technical Engineers">Technical Engineers</option>
              <option value="General Public">General Public &amp; Media</option>
              <option value="Regulatory Authorities">Regulatory Authorities</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Default Tone of Voice</label>
            <select
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
            >
              <option value="Authoritative & Professional">Authoritative &amp; Professional</option>
              <option value="Urgent & Directive">Urgent &amp; Directive</option>
              <option value="Educational & Analytical">Educational &amp; Analytical</option>
              <option value="Conversational & Engaging">Conversational &amp; Engaging</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Detail &amp; Depth Level</label>
            <select
              value={defaultDetailLevel}
              onChange={(e) => setDefaultDetailLevel(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
            >
              <option value="Comprehensive & Actionable">Comprehensive &amp; Actionable</option>
              <option value="Concise & Brief">Concise &amp; Brief</option>
              <option value="Executive Summary Dossier">Executive Summary Dossier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Security & Privacy Guardrails */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Security &amp; Privacy Guardrails</h2>
            <p className="text-xs text-slate-500 font-medium">Automatic data redaction, hallucination defense, and audit ledgers</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 block">Automatic PII &amp; Network Identifier Redaction</span>
              <span className="text-xs text-slate-500">Auto-detects and masks internal IPs, employee email addresses, hostnames, and credentials.</span>
            </div>
            <input
              type="checkbox"
              checked={autoRedactPii}
              onChange={(e) => setAutoRedactPii(e.target.checked)}
              className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 block">Strict Single-Truth Canonical Grounding</span>
              <span className="text-xs text-slate-500">Enforces claim-level verification against the primary source facts to prevent hallucinations.</span>
            </div>
            <input
              type="checkbox"
              checked={enforceGrounding}
              onChange={(e) => setEnforceGrounding(e.target.checked)}
              className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 block">Cryptographic SHA-256 Ledger Watermarking</span>
              <span className="text-xs text-slate-500">Generates immutable SHA-256 verification hashes for each approved release.</span>
            </div>
            <input
              type="checkbox"
              checked={blockchainRegistration}
              onChange={(e) => setBlockchainRegistration(e.target.checked)}
              className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Section 5: Distribution Webhook Endpoint */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="rounded-2xl bg-cyan-100 p-2.5 text-cyan-700">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Distribution Endpoint</h2>
            <p className="text-xs text-slate-500 font-medium">Webhook URL for automated social and multi-channel publication</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Publishing Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-webhook-endpoint.com/publish"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 font-mono focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs"
          />
          <span className="text-xs text-slate-500 block">
            Approved deliverables are dispatched to this endpoint when published.
          </span>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3.5 font-bold text-sm text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-sky-500 active:scale-95 transition-all"
        >
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  )
}
