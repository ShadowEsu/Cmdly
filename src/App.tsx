import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CollectionsProvider } from "./context/CollectionsContext";
import { BottomNav } from "./components/BottomNav";
import { HomePage } from "./pages/HomePage";
import { PlatformPage } from "./pages/PlatformPage";
import { SearchPage } from "./pages/SearchPage";
import { CollectionsPage } from "./pages/CollectionsPage";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col text-[17.5px] leading-relaxed">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CollectionsProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/platform/:id" element={<PlatformPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </CollectionsProvider>
    </BrowserRouter>
  );
}
