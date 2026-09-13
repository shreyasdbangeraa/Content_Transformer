'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  PlusCircle,
  Folder,
  Link2,
  Database,
  Send,
  FileText,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useNav } from '@/context/NavContext'

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'New Transformation',
    href: '/dashboard/new',
    icon: PlusCircle,
  },
  {
    label: 'Projects',
    href: '/dashboard/projects',
    icon: Folder,
  },
  {
    label: 'Sources',
    href: '/dashboard/knowledge?tab=sources',
    icon: Link2,
  },
  {
    label: 'Knowledge Base',
    href: '/dashboard/knowledge',
    icon: Database,
  },
  {
    label: 'Published Content',
    href: '/dashboard/publishing',
    icon: Send,
  },
  {
    label: 'Templates',
    href: '/dashboard/templates',
    icon: FileText,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isMobileOpen, closeMobileNav } = useNav()

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname?.startsWith(item.href.split('?')[0]) && item.href !== '/dashboard'

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={closeMobileNav}
            className={clsx(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all',
              isActive
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            )}
          >
            <Icon
              className={clsx(
                'h-5 w-5 shrink-0 transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-500'
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-6">
      <div className="space-y-8">
        {/* Brand Logo & Name */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-slate-200/80 bg-white p-0.5 group-hover:scale-105 group-hover:shadow-md transition-all shrink-0">
            <Image
              src="/logo.png"
              alt="ContexAI Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain rounded-lg"
              priority
            />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight group-hover:text-blue-600 transition-colors">
              ContexAI
            </span>
            <span className="text-[11px] text-slate-400 font-medium block leading-tight">
              From Information to Impact
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <div>{renderNavLinks()}</div>
      </div>

      {/* Bottom Secure / Verified Badge Card */}
      <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 flex flex-col gap-2 shadow-2xs">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 leading-tight">
            Secure. Verified. Impactful.
          </div>
          <p className="text-[11px] text-slate-400 font-normal leading-relaxed mt-0.5">
            Trusted AI for a better tomorrow.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-100/90 hidden md:flex flex-col min-h-screen sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeMobileNav}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-fade-in border-r border-slate-100">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={closeMobileNav}
                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
