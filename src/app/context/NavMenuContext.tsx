"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

interface NavMenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const NavMenuContext = createContext<NavMenuContextType | undefined>(undefined);

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  return (
    <NavMenuContext.Provider value={{ isOpen, openMenu, closeMenu }}>
      {children}
    </NavMenuContext.Provider>
  );
}

export function useNavMenu() {
  const context = useContext(NavMenuContext);
  if (context === undefined) {
    throw new Error('useNavMenu must be used within a NavMenuProvider');
  }
  return context;
}