import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState } from "react";
import Index from "./pages/Index";
import Discovery from "./pages/Discovery";
import StudyHelp from "./pages/StudyHelp";
import Activities from "./pages/Activities";
import WeekendPlans from "./pages/WeekendPlans";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

// Create QueryClient factory to prevent recreation issues
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Use useState to ensure QueryClient is stable across hot reloads
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/study-help" element={<StudyHelp />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/weekend-plans" element={<WeekendPlans />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding/friends" element={<Onboarding />} />
              <Route path="/onboarding/studybuddies" element={<Onboarding />} />
              <Route path="/onboarding/activities" element={<Onboarding />} />
              <Route path="/onboarding/weekend" element={<Onboarding />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;