'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface NavContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  isMobileOpen: boolean
  toggleMobileNav: () => void
  openMobileNav: () => void
  closeMobileNav: () => void
}

const NavContext = createContext<NavContextType>({
  isSidebarOpen: true,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  isMobileOpen: false,
  toggleMobileNav: () => {},
  openMobileNav: () => {},
  closeMobileNav: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Automatically close mobile drawer when navigating to a new route
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const toggleSidebar = () => {
    // On small screens, toggle mobile drawer. On desktop, toggle desktop sidebar
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev)
    } else {
      setIsSidebarOpen((prev) => !prev)
    }
  }

  const openSidebar = () => {
    setIsSidebarOpen(true)
    setIsMobileOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    setIsMobileOpen(false)
  }

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev)
  const openMobileNav = () => setIsMobileOpen(true)
  const closeMobileNav = () => setIsMobileOpen(false)

  return (
    <NavContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        isMobileOpen,
        toggleMobileNav,
        openMobileNav,
        closeMobileNav,
      }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
