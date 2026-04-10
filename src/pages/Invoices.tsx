import { InvoicesPage } from "../features/invoices/components/invoices-page";
import { useInvoicesPage } from "../features/invoices/hooks/use-invoices-page";

export default function Invoices() {
    const model = useInvoicesPage();

    return <InvoicesPage model={model} />;
}
