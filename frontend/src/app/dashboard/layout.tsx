import React from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
