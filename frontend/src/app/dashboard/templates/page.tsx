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
} from 'lucide-react'

const TEMPLATES = [
  {
    id: 'cyber_advisory',
    title: 'Government / Enterprise Cyber Advisory',
    domain: 'Cybersecurity',
    desc: 'Transforms technical incident logs into CVSS severity scores, IoCs, affected nodes, and mandatory action items.',
    formats: ['Advisory', 'LinkedIn', 'PPTX Presentation', 'Infographic'],
    audience: 'Government Cyber Regulators & IT Teams',
    tone: 'Formal & Authoritative',
    icon: ShieldCheck,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'exec_brief',
    title: 'Executive Decision-Maker Briefing',
    domain: 'Leadership',
    desc: 'Distills multi-page reports into 1-page situational briefings, impact highlights, telemetry charts, and risks.',
    formats: ['Executive Summary', 'PPTX Slides'],
    audience: 'Executive Board & C-Suite',
    tone: 'Concise & Strategic',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'public_announcement',
    title: 'Multilingual Public Notice',
    domain: 'Government / Public Sector',
    desc: 'Converts policy updates into accessible public announcements with Kannada, Hindi, and English outputs.',
    formats: ['Press Release', 'Social Posts', 'Advisory', 'FAQ'],
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
    domain: 'Research & Science',
    desc: 'Structures scientific papers and whitepapers into key findings, methodology summaries, and infographics.',
    formats: ['Executive Summary', 'LinkedIn Post', 'Infographic'],
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
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileStack className="h-5 w-5 text-indigo-600" />
            Communication Template Library
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Pre-configured transformation recipes tailored for cybersecurity, executive leadership, and government communications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon
          return (
            <div
              key={tmpl.id}
              onClick={() => router.push(`/dashboard/new?template=${tmpl.id}`)}
              className={`rounded-2xl border ${tmpl.borderColor} bg-white p-6 space-y-4 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between shadow-xs`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-xl ${tmpl.bgColor} p-2`}>
                      <Icon className={`h-4 w-4 ${tmpl.color}`} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {tmpl.domain}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-sky-800 font-bold px-2 py-0.5 rounded font-mono">
                    {tmpl.formats.length} Deliverables
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 hover:text-sky-700 transition-colors">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{tmpl.desc}</p>

                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-bold text-slate-800">Audience:</span>
                    <span>{tmpl.audience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-bold text-slate-800">Tone:</span>
                    <span>{tmpl.tone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.formats.map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-sky-700 hover:translate-x-1 transition-transform">
                  <span>Use Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
