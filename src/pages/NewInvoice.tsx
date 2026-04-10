import { useNavigate } from "react-router-dom";
import { NewInvoiceForm } from "../features/invoices/components/new-invoice-form";
import { useNewInvoiceForm } from "../features/invoices/hooks/use-new-invoice-form";

export default function NewInvoice() {
    const navigate = useNavigate();
    const model = useNewInvoiceForm();

    return <NewInvoiceForm model={model} onBack={() => navigate("/invoices")} />;
}
