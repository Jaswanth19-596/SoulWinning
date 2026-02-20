import React, { createContext, useContext, useState, ReactNode } from 'react';

type SectionType = 'prospects' | 'riders' | 'workers' | 'satvisit' | 'buslog';

interface AppContextType {
  section: SectionType;
  setSection: (section: SectionType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [section, setSection] = useState<SectionType>('prospects');

  return (
    <AppContext.Provider value={{ section, setSection }}>
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
