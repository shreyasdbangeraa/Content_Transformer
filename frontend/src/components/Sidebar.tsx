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
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Transformation', href: '/dashboard/new', icon: Sparkles, highlight: true },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Templates', href: '/dashboard/templates', icon: FileStack },
  { label: 'Knowledge Base (RAG)', href: '/dashboard/knowledge', icon: BookOpen },
  { label: 'Publishing & n8n', href: '/dashboard/publishing', icon: Workflow },
  { label: 'Settings & Status', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white/80 p-4 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Workspace
          </p>
          <nav className="mt-2 space-y-1">
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
                  className={clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    item.highlight && !isActive && 'text-sky-600 font-bold'
                  )}
                >
                  <Icon className={clsx('h-4 w-4 shrink-0', isActive ? 'text-sky-600' : 'text-slate-400')} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-sky-500" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Enterprise Pipeline Info Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Enterprise AI Pipeline</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Single Ingest → Canonical Knowledge → Multi-Artefact Generation → Claim Fact Check → n8n Webhook.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-sky-700 font-semibold pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Source-Grounded Architecture</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md transition-colors"
        >
          <span>Landing Showcase</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
        <div className="px-3 py-1 text-[11px] text-slate-400 font-medium">
          Enterprise Content Transformation
        </div>
      </div>
    </aside>
  )
}
