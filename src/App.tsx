import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CRM from "./pages/CRM";
import Dashboard from "./components/Dashboard";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import Estimates from "./pages/Estimates";
import Invoices from "./pages/Invoices";
import VideoReviews from "./pages/VideoReviews";
import ClientImports from "./pages/ClientImports";
import Inspections from "./pages/Inspections";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CRM />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="customers" element={<Customers />} />
            <Route path="estimates" element={<Estimates />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="video-reviews" element={<VideoReviews />} />
            <Route path="client-imports" element={<ClientImports />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="reviews" element={<Reviews />} />
            {/* Placeholder routes for other CRM features */}
            <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary">Reports - Coming Soon</h1></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary">Settings - Coming Soon</h1></div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
