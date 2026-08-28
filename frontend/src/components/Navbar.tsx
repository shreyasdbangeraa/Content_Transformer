'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Settings,
  Layers,
  Plus,
  Menu,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useNav } from '@/context/NavContext'

export default function Navbar() {
  const [status, setStatus] = useState<any>(null)
  const { toggleMobileNav } = useNav()

  useEffect(() => {
    api.getStatus().then(setStatus).catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex h-16 sm:h-18 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-2">
        {/* Left Section: Mobile 3-Lines Hamburger Button & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 3 lines on the top for sidebar */}
          <button
            onClick={toggleMobileNav}
            aria-label="Open Navigation Sidebar"
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors border border-slate-200 shadow-2xs"
          >
            <Menu className="h-5 w-5 text-slate-800" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
              </div>
            </div>
            <div>
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <span className="truncate max-w-[140px] xs:max-w-none">AI Content Transformer</span>
                <span className="hidden xs:inline rounded-md bg-sky-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-sky-700 border border-sky-200">
                  ENTERPRISE
                </span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                One Source → Canonical Knowledge → Multi-Artefact Publishing
              </p>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3.5">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600">Engine:</span>
            <span className="text-sky-600 font-bold font-mono">
              {status?.default_ai_provider ? status.default_ai_provider.toUpperCase() : 'ONLINE'}
            </span>
          </div>

          {/* New Transformation Button */}
          <Link
            href="/dashboard/new"
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New <span className="hidden sm:inline">Transformation</span></span>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="rounded-xl p-2 sm:p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
            title="Settings & System Status"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
