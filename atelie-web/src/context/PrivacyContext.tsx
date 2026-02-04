import { createContext, useContext, useState } from 'react';

type PrivacyContextType = {
  mostrarValores: boolean;
  toggleValores: () => void;
};

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [mostrarValores, setMostrarValores] = useState(true);

  function toggleValores() {
    setMostrarValores(prev => !prev);
  }

  return (
    <PrivacyContext.Provider value={{ mostrarValores, toggleValores }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy deve ser usado dentro do PrivacyProvider');
  }
  return context;
}
