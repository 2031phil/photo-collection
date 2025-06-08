'use client';
import { createContext, useContext, useState, useRef } from 'react';

const GalleryContext = createContext();

export function GalleryProvider({ children }) {
  const [savedState, setSavedState] = useState(null);
  const isNavigatingAway = useRef(false);
  
  const saveGalleryState = (state) => {
    setSavedState(state);
  };
  
  const getSavedState = () => {
    return savedState;
  };
  
  const clearSavedState = () => {
    setSavedState(null);
  };
  
  const setNavigatingAway = (value) => {
    isNavigatingAway.current = value;
  };
  
  const getIsNavigatingAway = () => {
    return isNavigatingAway.current;
  };
  
  return (
    <GalleryContext.Provider value={{ 
      saveGalleryState, 
      getSavedState, 
      clearSavedState,
      setNavigatingAway,
      getIsNavigatingAway
    }}>
      {children}
    </GalleryContext.Provider>
  );
}

export const useGalleryContext = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
};