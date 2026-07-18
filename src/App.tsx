import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NetworkView from "./pages/NetworkView";
import SettingsView from "./pages/SettingsView";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ContactsProvider } from "@/contexts/ContactsContext";
import { ContactsPanelProvider } from "@/contexts/ContactsPanelContext";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { SearchBar } from "@/components/network/SearchBar";
import { MrFoxButton } from "@/components/mrfox/MrFoxButton";
import { ConversationProvider } from "@elevenlabs/react";
import { AuthProvider } from "@/auth/AuthProvider";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { useAuth } from "@/auth/useAuth";
import { ImpersonationBanner } from "@/components/settings/ImpersonationBanner";

const queryClient = new QueryClient();

// ── Inner layout: reads SearchContext to wire the search bar ─────────────────

function AppContentLayout() {
  const { searchQuery, submitSearch, clearSearch } = useSearch();
  const { actor, effectiveUser, impersonation, stopImpersonation } = useAuth();

  return (
    // ConversationProvider is required by @elevenlabs/react v1.6.3 —
    // useConversation (inside useMrFox) must be called within this provider.
    <ConversationProvider>
    <div className="flex-1 flex flex-col overflow-hidden" style={{ height: '100vh' }}>
      {actor && effectiveUser && impersonation && (
        <ImpersonationBanner
          actor={actor}
          effectiveUser={effectiveUser}
          impersonation={impersonation}
          onStop={stopImpersonation}
        />
      )}

      {/* ── Persistent search header — always visible ── */}
      <div
        className="flex-none flex items-center justify-center gap-3 px-6 flex-shrink-0"
        style={{
          height: 60,
          background: 'hsl(var(--background))',
          borderBottom: '1px solid hsl(var(--border))',
          zIndex: 50,
        }}
      >
        <MrFoxButton />
        <SearchBar
          onSubmit={submitSearch}
          onClear={clearSearch}
          activeQuery={searchQuery}
        />
      </div>

      {/* ── Page content — fills remaining height ── */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="network"  element={<NetworkView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*"        element={<Navigate to="network" replace />} />
        </Routes>
      </div>

    </div>
    </ConversationProvider>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/"      element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route path="/app/*" element={
              <ProtectedRoute>
                <ContactsProvider>
                <ContactsPanelProvider>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      {/* SearchProvider inside ContactsProvider so it can call useContacts() */}
                      <SearchProvider>
                        <AppContentLayout />
                      </SearchProvider>
                    </div>
                  </SidebarProvider>
                </ContactsPanelProvider>
                </ContactsProvider>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
