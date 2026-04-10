import { ClientsPage } from "../features/clients/components/clients-page";
import { useClientsPage } from "../features/clients/hooks/use-clients-page";

export default function Clients() {
    const model = useClientsPage();

    return <ClientsPage model={model} />;
}
