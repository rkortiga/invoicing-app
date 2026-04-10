import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientsLookup } from "../../clients/hooks/use-clients-lookup";
import { invoicesApi } from "../api/invoices-api";

const INVOICES_PAGE_SIZE = 10;

export type InvoicesPageModel = {
    filters: {
        clientId: string;
        setClientId: (value: string) => void;
        page: number;
        setPage: (page: number) => void;
    };
    clients: {
        items: ReturnType<typeof useClientsLookup>["items"];
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    list: {
        data: Awaited<ReturnType<typeof invoicesApi.list>> | undefined;
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    resolveClientName: (clientId: number) => string;
};

export function useInvoicesPage(): InvoicesPageModel {
    const [clientId, setClientId] = useState("");
    const [page, setPage] = useState(1);

    const clientsLookup = useClientsLookup();

    const clientIdFilter = useMemo(() => {
        const trimmed = clientId.trim();
        if (!trimmed) return undefined;

        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? undefined : parsed;
    }, [clientId]);

    const invoicesQuery = useQuery({
        queryKey: ["invoices", { clientId: clientIdFilter, page }],
        queryFn: () =>
            invoicesApi.list({
                clientId: clientIdFilter,
                page,
                pageSize: INVOICES_PAGE_SIZE,
            }),
    });

    return {
        filters: {
            clientId,
            setClientId: (value) => {
                setClientId(value);
                setPage(1);
            },
            page,
            setPage,
        },
        clients: {
            items: clientsLookup.items,
            isLoading: clientsLookup.isLoading,
            error: clientsLookup.error,
            retry: clientsLookup.retry,
        },
        list: {
            data: invoicesQuery.data,
            isLoading: invoicesQuery.isLoading,
            error: invoicesQuery.error,
            retry: invoicesQuery.refetch,
        },
        resolveClientName: (invoiceClientId) => {
            const client = clientsLookup.byId.get(invoiceClientId);
            if (client) return client.name;
            if (clientsLookup.error) return `Client #${invoiceClientId}`;
            if (clientsLookup.isLoading) return "Loading...";
            return `Client #${invoiceClientId}`;
        },
    };
}
