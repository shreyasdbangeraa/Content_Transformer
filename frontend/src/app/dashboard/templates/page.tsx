'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileStack,
  ShieldCheck,
  FileText,
  Building,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Building2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sliders,
} from 'lucide-react'
import { api } from '@/lib/api'
import { BrandProfile } from '@/types'

const TEMPLATES = [
  {
    id: 'cyber_advisory',
    title: 'Government & Enterprise Cyber Advisory',
    domain: 'Cybersecurity',
    desc: 'Transforms technical incident logs into CVSS severity scores, IoCs, affected nodes, and mandatory remediation directives.',
    formats: ['Advisory', 'LinkedIn', 'PPTX Deck', 'Infographic', 'Video Package'],
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
    formats: ['Executive Dossier', 'PPTX Slides', 'Infographic', 'X Thread'],
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
    formats: ['Advisory', 'Social Posts', 'Video Package'],
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
    formats: ['Executive Dossier', 'LinkedIn Post', 'Infographic', 'PPTX Deck'],
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
  const [profiles, setProfiles] = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [orgName, setOrgName] = useState('')
  const [orgTone, setOrgTone] = useState('Authoritative & Reassuring')
  const [writingStyle, setWritingStyle] = useState('Corporate & Government Advisory')
  const [targetAudience, setTargetAudience] = useState('Executive Board & Regulators')
  const [forbiddenTermsStr, setForbiddenTermsStr] = useState('panic, hacked, catastrophic, unrecoverable')
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const data = await api.listBrandProfiles()
      setProfiles(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    try {
      await api.createBrandProfile({
        organization_name: orgName,
        tone: orgTone,
        writing_style: writingStyle,
        target_audience_default: targetAudience,
        forbidden_terms: forbiddenTermsStr.split(',').map((t) => t.trim()).filter(Boolean),
        terminology_rules: {
          ransomware: 'unauthorized encryption incident',
          breach: 'security containment event',
        },
        communication_rules: [
          'Always cite exact UTC timestamps for milestones',
          'Include telemetry scorecard in executive briefings',
        ],
      })
      setOrgName('')
      setIsCreatingProfile(false)
      loadProfiles()
    } catch (err: any) {
      alert(`Failed to create profile: ${err.message}`)
    }
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <FileStack className="h-8 w-8 text-indigo-600" />
            Communication Templates & Brand Profiles
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Pre-configured transformation recipes and organizational style guides for certified enterprise outputs.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Transformation Templates</h2>
          <span className="text-xs text-slate-500 font-medium">{TEMPLATES.length} pre-configured presets</span>
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
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                        {tmpl.domain}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {tmpl.tone}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{tmpl.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                      {tmpl.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {tmpl.formats.map((fmt, i) => (
                      <span
                        key={i}
                        className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-sky-600">
                  <span>Audience: {tmpl.audience}</span>
                  <div className="flex items-center gap-1 hover:text-sky-700">
                    <span>Use Template</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Brand Profiles Section */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
              <Building2 className="h-6 w-6 text-indigo-600" />
              Organizational Brand Profiles & Terminology Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Configure organizational tone, forbidden words, and required communication rules to enforce compliance across all generated deliverables.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingProfile(!isCreatingProfile)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs self-start sm:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreatingProfile ? 'Close Form' : 'New Brand Profile'}</span>
          </button>
        </div>

        {/* Create Profile Form */}
        {isCreatingProfile && (
          <form onSubmit={handleCreateProfile} className="rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="text-base font-black text-slate-900">Add Brand Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. NovaTech Systems"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Brand Tone</label>
                <input
                  type="text"
                  value={orgTone}
                  onChange={(e) => setOrgTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Writing Style</label>
                <input
                  type="text"
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Target Audience Default</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Forbidden Words (Comma separated)</label>
                <input
                  type="text"
                  value={forbiddenTermsStr}
                  onChange={(e) => setForbiddenTermsStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-xs font-bold hover:bg-indigo-500 transition-all shadow-xs"
            >
              Save Profile
            </button>
          </form>
        )}

        {/* Existing Brand Profiles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-indigo-100 text-indigo-700 p-2 font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">{p.organization_name}</h4>
                    <span className="text-xs text-slate-500 font-medium">{p.writing_style}</span>
                  </div>
                </div>
                <span className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold px-2.5 py-1">
                  {p.tone}
                </span>
              </div>

              {p.forbidden_terms && p.forbidden_terms.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                    Forbidden Words & Phrases Filter:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.forbidden_terms.map((term, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold px-2 py-0.5"
                      >
                        🚫 {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {p.communication_rules && p.communication_rules.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Mandatory Communication Directives:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 font-medium">
                    {p.communication_rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
