'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  FileStack,
  ShieldCheck,
  FileText,
  Building,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const TEMPLATES = [
  {
    id: 'cyber_advisory',
    title: 'Government & Enterprise Cyber Advisory',
    domain: 'Cybersecurity',
    desc: 'Transforms technical incident logs into CVSS severity scores, IoCs, affected nodes, and mandatory remediation directives.',
    formats: ['Advisory', 'LinkedIn', 'PPTX Deck', 'Infographic'],
    audience: 'Government Cyber Regulators & IT Teams',
    tone: 'Urgent & Authoritative',
    icon: ShieldCheck,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'exec_brief',
    title: 'Executive Decision-Maker Briefing Dossier',
    domain: 'Leadership & Strategy',
    desc: 'Distills complex documents into a comprehensive 3-page situational dossier with telemetry tables and risk matrices.',
    formats: ['Executive Dossier', 'PPTX Slides', 'Infographic'],
    audience: 'Executive Board & C-Suite',
    tone: 'Formal & Strategic',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'public_announcement',
    title: 'Multilingual Public Notice & Guidance',
    domain: 'Government & Public Sector',
    desc: 'Converts policy updates into accessible public announcements with Kannada, Hindi, and English multi-lingual outputs.',
    formats: ['Advisory', 'Social Posts', 'FAQ'],
    audience: 'General Public & Citizens',
    tone: 'Clear, Educational & Accessible',
    icon: Building,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'research_digest',
    title: 'Academic Research & Technology Digest',
    domain: 'Research & Deep Tech',
    desc: 'Structures scientific papers and whitepapers into key findings, methodology summaries, and high-impact visual banners.',
    formats: ['Executive Dossier', 'LinkedIn Post', 'Infographic'],
    audience: 'Engineering & Research Community',
    tone: 'Technical & Objective',
    icon: GraduationCap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
]

export default function TemplatesPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <FileStack className="h-8 w-8 text-indigo-600" />
            Communication Template Library
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Pre-configured transformation recipes tailored for cybersecurity, executive leadership, and government communications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon
          return (
            <div
              key={tmpl.id}
              onClick={() => router.push(`/dashboard/new?template=${tmpl.id}`)}
              className={`rounded-3xl border-2 ${tmpl.borderColor} bg-white p-7 space-y-5 hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between shadow-xs`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-2xl ${tmpl.bgColor} p-2.5 border border-slate-100`}>
                      <Icon className={`h-5 w-5 ${tmpl.color}`} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      {tmpl.domain}
                    </span>
                  </div>
                  <span className="text-xs bg-slate-100 text-sky-800 font-bold px-2.5 py-1 rounded-md font-mono border border-slate-200">
                    {tmpl.formats.length} Deliverables
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 hover:text-sky-700 transition-colors leading-snug">
                  {tmpl.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{tmpl.desc}</p>

                <div className="space-y-2 pt-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-bold text-slate-800">Target Audience:</span>
                    <span>{tmpl.audience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-bold text-slate-800">Tone & Style:</span>
                    <span>{tmpl.tone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  {tmpl.formats.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:translate-x-1 transition-transform">
                  <span>Use Template</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
