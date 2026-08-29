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
} from 'lucide-react'
import clsx from 'clsx'
import { useNav } from '@/context/NavContext'

const mainNavItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Transformation', href: '/dashboard/new', icon: Sparkles, highlight: true },
  { label: 'Projects & Deliverables', href: '/dashboard/projects', icon: FolderKanban },
]

const workspaceNavItems = [
  { label: 'Template Presets', href: '/dashboard/templates', icon: FileStack },
  { label: 'Knowledge Base (RAG)', href: '/dashboard/knowledge', icon: BookOpen },
  { label: 'Publishing & n8n', href: '/dashboard/publishing', icon: Workflow },
  { label: 'Engine & Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isMobileOpen, closeMobileNav } = useNav()

  const renderNavLinks = (items: typeof mainNavItems) => (
    <nav className="space-y-1.5">
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
              'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-bold transition-all relative overflow-hidden',
              isActive
                ? 'bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent text-sky-900 border border-sky-200/80 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 border border-transparent'
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-sky-500 to-indigo-600 shadow-xs" />
            )}
            <Icon
              className={clsx(
                'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600',
                item.highlight && !isActive && 'text-indigo-600'
              )}
            />
            <span>{item.label}</span>
            {item.highlight && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full shadow-2xs">
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
      <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl p-5 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar z-30">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
              Core Platform
            </p>
            <div className="mt-2.5">
              {renderNavLinks(mainNavItems)}
            </div>
          </div>

          {/* Workspace Tools */}
          <div>
            <p className="px-3 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
              Workspace & Tools
            </p>
            <div className="mt-2.5">
              {renderNavLinks(workspaceNavItems)}
            </div>
          </div>

          {/* Enterprise Pipeline Governance Box */}
          <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-indigo-50/50 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <div className="h-6 w-6 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span>Single-Truth Gating</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Universal Document Planner • Strict Fact Verification • Zero Hallucination
            </p>
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 pt-2 border-t border-sky-100">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verification Guardrails</span>
              </span>
              <span className="font-mono font-extrabold text-slate-500">v2.4</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <span>Platform Showcase</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="px-3 text-[10px] text-slate-400 font-medium font-mono">
            AI Content Transformer • Enterprise
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={closeMobileNav}
          />

          {/* Slide-out Sidebar Drawer */}
          <div className="relative flex flex-col justify-between w-4/5 max-w-xs bg-white/95 backdrop-blur-2xl h-full p-5 shadow-2xl z-10 animate-slide-in-right overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xs">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Navigation</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">Content Transformer</p>
                  </div>
                </div>
                <button
                  onClick={closeMobileNav}
                  aria-label="Close navigation"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div>
                <p className="px-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                  Core Routes
                </p>
                {renderNavLinks(mainNavItems)}
              </div>

              <div>
                <p className="px-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                  Workspace
                </p>
                {renderNavLinks(workspaceNavItems)}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
              Enterprise GenAI Platform
            </div>
          </div>
        </div>
      )}
    </>
  )
}
