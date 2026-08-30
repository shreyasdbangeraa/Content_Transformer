'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Workflow,
  Lock,
  Cpu,
  FileText,
  Linkedin,
  Twitter,
  Presentation,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Zap,
  Check,
  ChevronRight,
  TrendingUp,
  Sliders,
} from 'lucide-react'
import clsx from 'clsx'

export default function LandingPage() {
  const [activeFormatIdx, setActiveFormatIdx] = useState<number>(0)

  const formats = [
    {
      label: 'LinkedIn Post',
      icon: Linkedin,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Thought Leadership',
      description: 'Engaging, hook-driven professional narrative with structured insights, clear takeaways, and verified domain hashtags.',
    },
    {
      label: 'Executive Briefing',
      icon: FileText,
      color: 'from-sky-500 to-blue-600',
      badge: 'C-Suite Ready',
      description: 'Concise executive summary with bottom-line-up-front findings, financial metrics, risk breakdown, and actionable decisions.',
    },
    {
      label: 'Technical Advisory',
      icon: ShieldCheck,
      color: 'from-rose-500 to-orange-600',
      badge: 'Zero Hallucination',
      description: 'Authoritative technical bulletin covering CVEs, incident timeline, threat actor analysis, and step-by-step remediation directives.',
    },
    {
      label: 'Presentation Slide Deck',
      icon: Presentation,
      color: 'from-amber-500 to-yellow-600',
      badge: '16:9 Visual Slides',
      description: 'Professional multi-slide presentation deck with speaker notes, key bullet points, takeaways, and structured slide layouts.',
    },
    {
      label: 'Visual Infographic',
      icon: ImageIcon,
      color: 'from-indigo-600 to-purple-600',
      badge: '1200x630 Banner',
      description: 'High-impact visual banner asset paired with crisp vector infographics for immediate social media engagement.',
    },
    {
      label: 'X (Twitter) Thread',
      icon: Twitter,
      color: 'from-cyan-500 to-sky-600',
      badge: 'Viral Breakdown',
      description: 'Bite-sized, multi-tweet thread format breaking down complex reports into high-engagement numbered highlights.',
    },
    {
      label: 'Video Script & Storyboard',
      icon: Video,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Broadcast Ready',
      description: 'Scene-by-scene script with timing cues, presenter voiceover, on-screen text instructions, and visual storyboards.',
    },
  ]

  const features = [
    {
      title: 'Canonical Structured Knowledge',
      desc: 'Never repeatedly prompt raw documents. Source content is parsed once into verified facts, entities, statistics, risks, and actionable recommendations.',
      icon: Cpu,
      gradient: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Multi-Artefact Transformation',
      desc: 'Generate Executive Briefings, LinkedIn Posts, Twitter Threads, Technical Advisories, Slide Decks, and Infographics simultaneously from a single source.',
      icon: Layers,
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Universal Research & Evidence Discovery',
      desc: 'Dynamic domain detection across 9+ domains. Real-time external evidence search with strict factual verification and freshness policies.',
      icon: ShieldCheck,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'PII & Security Sanitization',
      desc: 'Automatic regex and NER detection of emails, phone numbers, and sensitive IP addresses with 1-click masking for public publishing.',
      icon: Lock,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Conversational AI Refinement',
      desc: 'Iterate interactively with the AI Editor. Shorten, expand, translate, or elevate formality while preserving primary document grounding.',
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      title: 'n8n Multi-Channel Automation',
      desc: 'Approved content dispatches seamlessly to n8n webhooks for scheduled publishing across LinkedIn, Instagram, and internal enterprise channels.',
      icon: Workflow,
      gradient: 'from-cyan-500 to-blue-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-sky-200/40 via-indigo-100/30 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-24">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-8 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 backdrop-blur-md px-5 py-2 text-xs sm:text-sm font-black text-indigo-950 shadow-xs animate-float">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span>Enterprise Multimodal Generative AI Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            One Source Document. <br />
            <span className="gradient-text-sky">Every Communication Format.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            Transform complex reports, research papers, and policy briefings into certified executive summaries, thought leadership posts, visual infographics, and presentation decks.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/new"
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              <span>Launch Transformation Studio</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:scale-98 transition-all shadow-xs"
            >
              <span>Explore Dashboard</span>
            </Link>
          </div>
        </div>

        {/* INTERACTIVE FORMAT EXPLORER */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Single-Truth Multimodal Generation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Simultaneously Generates 7 Target Formats
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm">
              Click any communication format below to preview its tailored output blueprint.
            </p>
          </div>

          {/* Format Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {formats.map((f, idx) => {
              const Icon = f.icon
              const isSelected = activeFormatIdx === idx
              return (
                <button
                  key={idx}
                  onClick={() => setActiveFormatIdx(idx)}
                  className={clsx(
                    'flex flex-col items-center text-center p-3 rounded-2xl border transition-all gap-2',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 shadow-md ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300'
                  )}
                >
                  <div className={`p-2 rounded-xl bg-gradient-to-tr ${f.color} text-white shadow-xs`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{f.label}</span>
                </button>
              )
            })}
          </div>

          {/* Active Format Preview Spotlight */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/50 via-sky-50/40 to-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-indigo-800 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono">
                  {formats[activeFormatIdx].badge}
                </span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Certified Truth Grounding
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{formats[activeFormatIdx].label}</h3>
              <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                {formats[activeFormatIdx].description}
              </p>
            </div>

            <Link
              href="/dashboard/new"
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <span>Create This Format</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* WORKFLOW PIPELINE CARDS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Single-Truth Governance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                How Content Transformation Works
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4" />
              <span>Full Audit Traceability</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all">
              <span className="text-xs font-mono font-black text-sky-600 uppercase">Stage 01</span>
              <h3 className="text-base font-bold text-slate-900">Ingestion &amp; Canonicalization</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Upload PDF, Word, or plain text. Facts, claims, statistics, and entities are extracted once.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all">
              <span className="text-xs font-mono font-black text-indigo-600 uppercase">Stage 02</span>
              <h3 className="text-base font-bold text-slate-900">Universal Research Planner</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Detects domain, assesses freshness needs, discovers corroborating evidence, and flags conflicts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all">
              <span className="text-xs font-mono font-black text-purple-600 uppercase">Stage 03</span>
              <h3 className="text-base font-bold text-slate-900">Multimodal Generation</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Hugging Face Llama-3.3 &amp; FLUX.1 models generate text, slides, and infographics tailored to audience.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all">
              <span className="text-xs font-mono font-black text-emerald-600 uppercase">Stage 04</span>
              <h3 className="text-base font-bold text-slate-900">Sign-Off &amp; n8n Publishing</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Human-in-the-loop approval gate certifies content and dispatches directly to n8n social workflows.
              </p>
            </div>
          </div>
        </div>

        {/* FEATURE HIGHLIGHTS GRID */}
        <div className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Grade Capabilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Architected for high-compliance environments where factual accuracy is non-negotiable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-7 space-y-4 shadow-xs hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${feat.gradient} text-white shadow-md shadow-sky-500/20`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span className="font-bold text-slate-800">AI Content Transformer</span>
            <span>• Enterprise Multimodal Communications Engine</span>
          </div>
          <div>
            Built with Next.js, FastAPI, PostgreSQL, Hugging Face FLUX.1 &amp; n8n
          </div>
        </div>
      </footer>
    </div>
  )
}
