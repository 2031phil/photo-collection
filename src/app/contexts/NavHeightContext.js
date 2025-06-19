'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const NavHeightContext = createContext(0);

export function NavHeightProvider({ children }) {
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    if (!navRef.current) return;

    const updateHeight = () => setNavHeight(navRef.current.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(navRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <NavHeightContext.Provider value={{ navRef, navHeight }}>
      {children}
    </NavHeightContext.Provider>
  );
}

export function useNavHeight() {
  return useContext(NavHeightContext);
}