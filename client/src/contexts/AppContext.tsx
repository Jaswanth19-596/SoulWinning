import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DayType } from '../types';

type SectionType = 'prospects' | 'riders' | 'workers' | 'buslog';

interface AppContextType {
  dayType: DayType;
  setDayType: (day: DayType) => void;
  section: SectionType;
  setSection: (section: SectionType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dayType, setDayType] = useState<DayType>('saturday');
  const [section, setSection] = useState<SectionType>('prospects');

  return (
    <AppContext.Provider value={{ dayType, setDayType, section, setSection }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
