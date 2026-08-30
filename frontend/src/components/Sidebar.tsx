'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  FileStack,
  BookOpen,
  Settings,
  ShieldCheck,
  ExternalLink,
  Workflow,
  X,
  Layers,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'
import { useNav } from '@/context/NavContext'

const mainNavItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-sky-600',
    bg: 'bg-sky-100/80',
    border: 'border-sky-200',
  },
  {
    label: 'New Transformation',
    href: '/dashboard/new',
    icon: Sparkles,
    highlight: true,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100/80',
    border: 'border-indigo-200',
  },
  {
    label: 'Projects & Deliverables',
    href: '/dashboard/projects',
    icon: FolderKanban,
    color: 'text-amber-600',
    bg: 'bg-amber-100/80',
    border: 'border-amber-200',
  },
]

const workspaceNavItems = [
  {
    label: 'Template Presets',
    href: '/dashboard/templates',
    icon: FileStack,
    color: 'text-purple-600',
    bg: 'bg-purple-100/80',
    border: 'border-purple-200',
  },
  {
    label: 'Knowledge Base (RAG)',
    href: '/dashboard/knowledge',
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100/80',
    border: 'border-emerald-200',
  },
  {
    label: 'Publishing & n8n',
    href: '/dashboard/publishing',
    icon: Workflow,
    color: 'text-cyan-600',
    bg: 'bg-cyan-100/80',
    border: 'border-cyan-200',
  },
  {
    label: 'Engine & Settings',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'text-rose-600',
    bg: 'bg-rose-100/80',
    border: 'border-rose-200',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isMobileOpen, closeMobileNav } = useNav()

  const renderNavLinks = (items: typeof mainNavItems) => (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname?.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobileNav}
            className={clsx(
              'group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all relative overflow-hidden',
              isActive
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white shadow-md shadow-indigo-600/25 font-extrabold'
                : 'text-slate-700 bg-white/70 hover:bg-white hover:text-slate-900 border border-slate-200/60 shadow-2xs hover:shadow-xs hover:border-indigo-300'
            )}
          >
            <div
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 shrink-0 border',
                isActive
                  ? 'bg-white/20 text-white border-white/20'
                  : clsx(item.bg, item.color, item.border)
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span>{item.label}</span>
            {item.highlight && (
              <span
                className={clsx(
                  'ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs',
                  isActive
                    ? 'bg-white text-indigo-800'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                )}
              >
                <Zap className="h-2.5 w-2.5" />
                <span>AI Studio</span>
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 shrink-0 border-r border-indigo-100 bg-gradient-to-b from-indigo-50/50 via-slate-50/70 to-sky-50/40 backdrop-blur-xl p-5 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar z-30">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-extrabold tracking-wider text-indigo-900/60 uppercase">
              Core Platform
            </p>
            <div className="mt-2.5">
              {renderNavLinks(mainNavItems)}
            </div>
          </div>

          {/* Workspace Tools */}
          <div>
            <p className="px-3 text-[11px] font-extrabold tracking-wider text-indigo-900/60 uppercase">
              Workspace &amp; Tools
            </p>
            <div className="mt-2.5">
              {renderNavLinks(workspaceNavItems)}
            </div>
          </div>
        </div>

        {/* Bottom Gating Assurance Card */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-white p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
            <div className="p-1.5 rounded-xl bg-emerald-500 text-white shadow-2xs">
              <ShieldCheck className="h-4 w-4 shrink-0" />
            </div>
            <span>Single-Truth Gating</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Strict Fact Verification • Zero Hallucination • Grounded Intelligence
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[10px] font-mono">
            <span className="text-slate-500">Guardrails</span>
            <span className="text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
              v2.4 Active
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Backdrop & Sheet */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Darker Blur Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeMobileNav}
          />

          {/* Sliding Drawer */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-gradient-to-b from-indigo-50/90 via-slate-50 to-sky-50/80 h-full shadow-2xl p-5 justify-between z-10 animate-fade-in border-r border-indigo-200">
            <div className="space-y-6">
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-cyan-400 p-0.5 shadow-md text-white">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 block font-sans">
                      conteX AI
                    </span>
                    <span className="text-[10px] text-indigo-700 font-bold block uppercase font-mono">
                      Enterprise Suite
                    </span>
                  </div>
                </div>

                <button
                  onClick={closeMobileNav}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Navigation */}
              <div>
                <p className="px-3 text-[11px] font-extrabold tracking-wider text-indigo-900/60 uppercase">
                  Core Platform
                </p>
                <div className="mt-2.5">
                  {renderNavLinks(mainNavItems)}
                </div>
              </div>

              {/* Workspace Tools */}
              <div>
                <p className="px-3 text-[11px] font-extrabold tracking-wider text-indigo-900/60 uppercase">
                  Workspace &amp; Tools
                </p>
                <div className="mt-2.5">
                  {renderNavLinks(workspaceNavItems)}
                </div>
              </div>
            </div>

            {/* Bottom Gating Assurance Card */}
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-white p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
                <div className="p-1.5 rounded-xl bg-emerald-500 text-white shadow-2xs">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                </div>
                <span>Single-Truth Gating</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Strict Fact Verification • Zero Hallucination
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[10px] font-mono">
                <span className="text-slate-500">Guardrails</span>
                <span className="text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
                  v2.4 Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
