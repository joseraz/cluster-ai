import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NetworkView from "./pages/NetworkView";
import ContactsView from "./pages/ContactsView";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ContactsProvider } from "@/contexts/ContactsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ContactsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app/*" element={
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-background">
                    <AppSidebar />
                    <main className="flex-1 overflow-hidden" style={{ height: '100vh' }}>
                      <Routes>
                        <Route path="network" element={<NetworkView />} />
                        <Route path="contacts" element={<ContactsView />} />
                        <Route path="*" element={<Navigate to="network" replace />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ContactsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
