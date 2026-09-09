'use client'

import React, { useState } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8FAFC]/90 backdrop-blur-md px-6 lg:px-8 py-4 flex items-center justify-between gap-4 transition-all">
      {/* Search Input Bar */}
      <div className="relative max-w-md w-full">
        <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/80 px-3.5 py-2 shadow-2xs hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, sources, projects..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#F8FAFC]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer select-none group">
          <div className="h-9 w-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            SD
          </div>
          <span className="text-sm font-semibold text-slate-800 hidden sm:block group-hover:text-slate-900 transition-colors">
            Shreyas D Bangera
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  )
}
