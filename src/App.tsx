import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/app-layout";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import InvoiceDetail from "./pages/InvoiceDetail";
import Invoices from "./pages/Invoices";
import NewInvoice from "./pages/NewInvoice";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <BrowserRouter>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/invoices/new" element={<NewInvoice />} />
                        <Route path="/invoices/:id" element={<InvoiceDetail />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
