import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../../../lib/api";
import { clientsApi } from "../api/clients-api";
import type { Client, ClientInput } from "../api/client-types";

const CLIENTS_PAGE_SIZE = 10;

const normalizeOptionalField = (value: FormDataEntryValue | null): string | undefined => {
    if (value === null) return undefined;

    const trimmed = value.toString().trim();
    return trimmed.length ? trimmed : undefined;
};

function buildClientInput(form: HTMLFormElement): ClientInput {
    const formData = new FormData(form);

    return {
        name: (formData.get("name") as string).trim(),
        abn: (formData.get("abn") as string).trim(),
        phone: normalizeOptionalField(formData.get("phone")),
        email: normalizeOptionalField(formData.get("email")),
    };
}

export type ClientsPageModel = {
    filters: {
        search: string;
        updateSearch: (value: string) => void;
        page: number;
        setPage: (page: number) => void;
    };
    dialog: {
        isOpen: boolean;
        editingClient: Client | null;
        openCreate: () => void;
        openEdit: (client: Client) => void;
        onOpenChange: (open: boolean) => void;
    };
    list: {
        data: Awaited<ReturnType<typeof clientsApi.list>> | undefined;
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    form: {
        submit: (event: FormEvent<HTMLFormElement>) => void;
        isSubmitting: boolean;
    };
    actions: {
        deleteClient: (id: number) => void;
    };
};

export function useClientsPage(): ClientsPageModel {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const queryClient = useQueryClient();

    const clientsQuery = useQuery({
        queryKey: ["clients", { search, page }],
        queryFn: () => clientsApi.list({ search, page, pageSize: CLIENTS_PAGE_SIZE }),
    });

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingClient(null);
    };

    const createMutation = useMutation({
        mutationFn: (client: ClientInput) => clientsApi.create(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            closeDialog();
            toast.success("Client created successfully");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to create client"));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ClientInput }) => clientsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            closeDialog();
            toast.success("Client updated successfully");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update client"));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => clientsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Client deleted successfully");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to delete client. Client may have invoices."));
        },
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const clientData = buildClientInput(event.currentTarget);
        if (!clientData.name || !clientData.abn) {
            toast.error("Name and ABN are required.");
            return;
        }

        if (editingClient) {
            updateMutation.mutate({ id: editingClient.id, data: clientData });
            return;
        }

        createMutation.mutate(clientData);
    };

    return {
        filters: {
            search,
            updateSearch: (value) => {
                setSearch(value);
                setPage(1);
            },
            page,
            setPage,
        },
        dialog: {
            isOpen: isDialogOpen,
            editingClient,
            openCreate: () => {
                setEditingClient(null);
                setIsDialogOpen(true);
            },
            openEdit: (client) => {
                setEditingClient(client);
                setIsDialogOpen(true);
            },
            onOpenChange: (open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setEditingClient(null);
                }
            },
        },
        list: {
            data: clientsQuery.data,
            isLoading: clientsQuery.isLoading,
            error: clientsQuery.error,
            retry: clientsQuery.refetch,
        },
        form: {
            submit,
            isSubmitting: createMutation.isPending || updateMutation.isPending,
        },
        actions: {
            deleteClient: (id) => deleteMutation.mutate(id),
        },
    };
}
