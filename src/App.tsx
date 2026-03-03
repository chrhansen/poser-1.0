import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import ConfirmEmail from "./pages/ConfirmEmail";
import EmbedResults from "./pages/EmbedResults";
import Releases from "./pages/Releases";
import Partners from "./pages/Partners";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import MetricsDebug from "./pages/MetricsDebug";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Public embed (no auth, no shell) */}
            <Route path="/embed/results/:token" element={<EmbedResults />} />

            {/* Protected routes — require sign-in */}
            {/* TODO_BACKEND_HOOKUP: Re-wrap with <ProtectedRoute> once auth is connected */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />

            {/* TODO_BACKEND_HOOKUP: Re-wrap with <ProtectedRoute requireInternal> once auth is connected */}
            <Route path="/internal/metrics-debug" element={<MetricsDebug />} />

            {/* Explicit 404 page */}
            <Route path="/404" element={<NotFound />} />

            {/* Catch-all: navigate to /404 without silent redirect */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
