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
} from 'lucide-react'
import clsx from 'clsx'
import { useNav } from '@/context/NavContext'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Transformation', href: '/dashboard/new', icon: Sparkles, highlight: true },
  { label: 'Projects & Artefacts', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Template Presets', href: '/dashboard/templates', icon: FileStack },
  { label: 'Knowledge Base (RAG)', href: '/dashboard/knowledge', icon: BookOpen },
  { label: 'Publishing & n8n', href: '/dashboard/publishing', icon: Workflow },
  { label: 'Engine & Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isMobileOpen, closeMobileNav } = useNav()

  const renderNavLinks = () => (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
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
              'flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold transition-all',
              isActive
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              item.highlight && !isActive && 'text-indigo-600 font-black'
            )}
          >
            <Icon className={clsx('h-4 w-4 shrink-0', isActive ? 'text-indigo-600' : 'text-slate-400')} />
            <span>{item.label}</span>
            {item.highlight && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-indigo-500 shadow-2xs" />
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white/95 backdrop-blur-md p-5 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar z-30">
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Workspace Navigation
            </p>
            <div className="mt-3">
              {renderNavLinks()}
            </div>
          </div>

          {/* Enterprise Pipeline Info Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Single-Truth Architecture</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Research Once → Verify → Build Knowledge → Transform to 7 Formats.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold pt-1 border-t border-slate-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Zero-Hallucination Gating</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-slate-200 space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span>Landing Showcase</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="px-3 text-[10px] text-slate-400 font-medium">
            Enterprise Content Engine • v1.0
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Visible on Small Screens when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={closeMobileNav}
          />

          {/* Slide-out Sidebar Drawer */}
          <div className="relative flex flex-col justify-between w-4/5 max-w-xs bg-white h-full p-5 shadow-2xl z-10 animate-slide-in-right overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Navigation</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">AI Content Transformer</p>
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
                <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  Workspace Routes
                </p>
                {renderNavLinks()}
              </div>

              {/* Mobile Info Box */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Single-Truth Layer</span>
                </div>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">
                  Verified facts across 7 multi-channel formats with zero hallucination.
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
              Enterprise Content Engine • v1.0
            </div>
          </div>
        </div>
      )}
    </>
  )
}
