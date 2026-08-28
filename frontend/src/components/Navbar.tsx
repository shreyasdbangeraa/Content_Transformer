'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Settings,
  Layers,
  Plus,
} from 'lucide-react'
import { api } from '@/lib/api'

export default function Navbar() {
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    api.getStatus().then(setStatus).catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                <Layers className="h-5 w-5 text-sky-600" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                AI Content Transformer
                <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
                  ENTERPRISE
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                One Source → Canonical Knowledge → Multi-Artefact Publishing
              </p>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-600">Engine:</span>
            <span className="text-sky-600 font-bold font-mono">
              {status?.default_ai_provider ? status.default_ai_provider.toUpperCase() : 'ONLINE'}
            </span>
          </div>

          {/* New Transformation */}
          <Link
            href="/dashboard/new"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Transformation</span>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Settings & System Status"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
