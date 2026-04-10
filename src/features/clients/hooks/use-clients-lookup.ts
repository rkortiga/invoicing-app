import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../api/clients-api";
import type { Client } from "../api/client-types";

export function useClientsLookup() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["clients", "lookup"],
        queryFn: () => clientsApi.list({ pageSize: 1000 }),
        staleTime: 5 * 60 * 1000,
    });

    const items = useMemo(() => data?.items ?? [], [data?.items]);

    const byId = useMemo(() => {
        const map = new Map<number, Client>();
        for (const client of items) {
            map.set(client.id, client);
        }

        return map;
    }, [items]);

    return { items, byId, isLoading, error, retry: () => refetch() };
}
