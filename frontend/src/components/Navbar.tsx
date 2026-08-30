'use client'

import React from 'react'
import Link from 'next/link'
import {
  Settings,
  Layers,
  Plus,
  Menu,
  ShieldCheck,
} from 'lucide-react'
import { useNav } from '@/context/NavContext'

export default function Navbar() {
  const { toggleMobileNav } = useNav()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs transition-all duration-300">
      <div className="flex h-16 sm:h-18 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-2">
        {/* Left Section: Mobile Hamburger Button & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            onClick={toggleMobileNav}
            aria-label="Open Navigation Sidebar"
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-2xl text-slate-700 hover:bg-slate-100/80 active:scale-95 transition-all border border-slate-200/80 shadow-xs"
          >
            <Menu className="h-5 w-5 text-slate-800" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 group-hover:shadow-sky-500/35 transition-all shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white text-slate-900">
                <Layers className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                  <span>conteX AI</span>
                </span>
                <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black text-sky-800 border border-sky-200 shadow-2xs font-mono">
                  <ShieldCheck className="h-3 w-3 text-sky-600" />
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block tracking-normal">
                Single Source → Universal Research → Multi-Channel Publishing
              </p>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* New Transformation Button */}
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New <span className="hidden sm:inline">Transformation</span></span>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="rounded-2xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200 hover:border-slate-300 shadow-2xs hover:scale-105 active:scale-95"
            title="Settings & System Diagnostics"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
