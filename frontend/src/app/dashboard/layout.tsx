import React from 'react'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFC] transition-all duration-300 overflow-x-clip">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-x-clip">
        <DashboardHeader />
        <main className="flex-1 min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6 max-w-7xl mx-auto w-full overflow-x-clip">
          {children}
        </main>
      </div>
    </div>
  )
}
