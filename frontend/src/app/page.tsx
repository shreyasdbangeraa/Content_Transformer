'use client'

import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Workflow,
  Lock,
  Cpu,
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      title: 'Canonical Structured Knowledge',
      desc: 'Never repeatedly prompt raw documents. Source data is decomposed once into verified facts, entities, statistics, and risks.',
      icon: Cpu,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      title: 'Multi-Artefact Transformation',
      desc: 'Generate Executive Summaries, LinkedIn Posts, Twitter Threads, Technical Advisories, PPTX Presentations, and Infographics simultaneously.',
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Claim Verification & Grounding',
      desc: 'Every factual assertion is matched against source page numbers. Unsupported claims are flagged before human review.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'PII & Sensitivity Scanning',
      desc: 'Automatic regex and NER detection of emails, phone numbers, and internal IP addresses with 1-click masking for public feeds.',
      icon: Lock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Conversational AI Refinement',
      desc: 'Ask AI to shorten, translate into Kannada/Hindi, or elevate formality while preserving source grounding.',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'n8n Social Media Automation',
      desc: 'Approved content flows directly into n8n webhooks for scheduled publication across LinkedIn, X, and Instagram.',
      icon: Workflow,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Subtle Radial Gradient Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-sky-200/60 via-indigo-100/40 to-transparent rounded-full blur-3xl opacity-75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-24">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-8 pt-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-200 bg-sky-50 px-5 py-2 text-xs sm:text-sm font-extrabold text-sky-800 shadow-xs">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <span>Enterprise Multimodal GenAI Transformation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
            One Source. <br />
            <span className="gradient-text">Every Communication Format.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            Transform incident reports, policy papers, and complex documents into professional, source-grounded executive briefings, social posts, security advisories, presentations, and visual assets.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Launch Transformation Studio</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-950 active:scale-95 transition-all shadow-xs"
            >
              <span>Open Dashboard</span>
            </Link>
          </div>
        </div>

        {/* ARCHITECTURE PIPELINE SHOWCASE */}
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 sm:p-12 backdrop-blur-xl shadow-lg space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-sky-600 tracking-widest uppercase">
              THE CORE ARCHITECTURAL PRINCIPLE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              One Unified AI Analysis → Multiple Target Deliverables
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Unlike generic chatbots that repeatedly query raw documents, our engine establishes a trusted Canonical Representation before multi-format synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {/* Step 1 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-3.5 relative shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Multimodal Ingestion</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                PDF, DOCX, TXT, OCR, and URLs are parsed with page-level spatial coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-sky-300 bg-sky-50/60 p-6 space-y-3.5 relative shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-200 text-sky-800 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Canonical Knowledge</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Facts, metrics, risks, and PII are extracted once into a verified structured schema.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-3.5 relative shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Format Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Generates Executive Summaries, LinkedIn posts, Advisories, Slides, and Infographics.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-3.5 relative shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-mono font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Fact Check & Publish</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Verifies claims against source pages, awaits human sign-off, and triggers n8n webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Enterprise-Grade AI Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Built with full traceability, prompt injection defenses, and human-in-the-loop governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-7 space-y-4 hover:border-sky-300 hover:shadow-xl transition-all shadow-xs"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bgColor}`}>
                    <Icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-white p-10 sm:p-14 text-center space-y-6 shadow-md">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Ready to Transform Your Content Workflows?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Ingest your incident reports, whitepapers, or policy briefs and generate source-grounded multi-format deliverables.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/new"
              className="rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-slate-800 shadow-md transition-colors"
            >
              Start New Transformation
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700">AI Content Transformer — Enterprise Multi-Format Generative Platform</p>
        <p className="mt-1.5 text-xs text-slate-400">
          Powered by Supabase, Hugging Face FLUX.1, and n8n Webhook Automation
        </p>
      </footer>
    </div>
  )
}
