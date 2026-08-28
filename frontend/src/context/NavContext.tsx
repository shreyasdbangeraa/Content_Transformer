'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface NavContextType {
  isMobileOpen: boolean
  toggleMobileNav: () => void
  openMobileNav: () => void
  closeMobileNav: () => void
}

const NavContext = createContext<NavContextType>({
  isMobileOpen: false,
  toggleMobileNav: () => {},
  openMobileNav: () => {},
  closeMobileNav: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Automatically close mobile menu when navigating to a new route
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev)
  const openMobileNav = () => setIsMobileOpen(true)
  const closeMobileNav = () => setIsMobileOpen(false)

  return (
    <NavContext.Provider
      value={{
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
