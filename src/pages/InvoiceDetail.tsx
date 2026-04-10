import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QueryErrorState } from "../components/query-error-state";
import { InvoiceDetailContent } from "../features/invoices/components/invoice-detail-content";
import { useInvoiceDetailPage } from "../features/invoices/hooks/use-invoice-detail-page";

export default function InvoiceDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const invoiceId = useMemo(() => {
        if (!id) return undefined;

        const numeric = Number(id);
        return Number.isNaN(numeric) ? undefined : numeric;
    }, [id]);

    const model = useInvoiceDetailPage(invoiceId);

    if (model.invoiceState.isLoading) {
        return <div className="py-8 text-center">Loading invoice...</div>;
    }

    if (!invoiceId) {
        return (
            <QueryErrorState
                title="Invoice not found"
                fallbackMessage="The invoice ID in this URL is invalid."
            />
        );
    }

    if (model.invoiceState.error || !model.invoice) {
        return (
            <QueryErrorState
                title="Couldn't load invoice"
                fallbackMessage="Invoice details are unavailable right now."
                error={model.invoiceState.error}
                onRetry={model.invoiceState.retry}
            />
        );
    }

    return <InvoiceDetailContent model={model} onBack={() => navigate("/invoices")} />;
}
