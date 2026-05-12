import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import PrivacyPolicy from '../views/PrivacyPolicy';
import Support from '../views/Support';

export type LegalLinksValue = {
  openPrivacy: () => void;
  openSupport: () => void;
};

const LegalLinksContext = createContext<LegalLinksValue | null>(null);

export function useLegalLinks(): LegalLinksValue | null {
  return useContext(LegalLinksContext);
}

/**
 * Full-screen legal/support surfaces and a stable API for footer links (Auth, Layout, Profile).
 */
export function LegalLinksProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<'privacy' | 'support' | null>(null);

  const value = useMemo<LegalLinksValue>(
    () => ({
      openPrivacy: () => setPage('privacy'),
      openSupport: () => setPage('support'),
    }),
    [],
  );

  if (page === 'privacy') {
    return <PrivacyPolicy onBack={() => setPage(null)} />;
  }
  if (page === 'support') {
    return <Support onBack={() => setPage(null)} />;
  }

  return <LegalLinksContext.Provider value={value}>{children}</LegalLinksContext.Provider>;
}
