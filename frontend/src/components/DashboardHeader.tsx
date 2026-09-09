'use client'

import React, { useState } from 'react'
import { Search, Bell, Menu } from 'lucide-react'
import { useNav } from '@/context/NavContext'

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const { toggleMobileNav } = useNav()

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8FAFC]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 transition-all border-b border-slate-100 md:border-transparent">
      {/* Left: Mobile 3-Lines Hamburger Button + Search Input Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-lg min-w-0">
        {/* Three Lines Mobile Sidebar Trigger */}
        <button
          type="button"
          onClick={toggleMobileNav}
          className="md:hidden flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 active:bg-slate-200 transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-6 w-6 stroke-[2.2]" />
        </button>

        {/* Search Input Bar */}
        <div className="relative w-full min-w-0">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200/80 px-3 py-2 shadow-2xs hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, sources, projects..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications ONLY (User profile pill removed per request) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#F8FAFC]" />
        </button>
      </div>
    </header>
  )
}
