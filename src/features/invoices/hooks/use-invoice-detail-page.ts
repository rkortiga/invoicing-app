import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../../../lib/api";
import { clientsApi } from "../../clients/api/clients-api";
import type { Client } from "../../clients/api/client-types";
import { productsApi } from "../../products/api/products-api";
import type { Product } from "../../products/api/product-types";
import { invoicesApi } from "../api/invoices-api";
import type { InvoiceDetail } from "../api/invoice-types";
import {
    DEFAULT_INVOICE_ADD_LINE_DRAFT,
    buildLineEditorDrafts,
    toDateInputValue,
    type InvoiceAddLineDraft,
    type InvoiceLineEditorDraft,
    validateInvoiceLineValues,
    validateInvoiceProductLineValues,
} from "../lib/invoice-form-helpers";

export type InvoiceDetailPageModel = {
    invoiceId?: number;
    invoice?: InvoiceDetail;
    invoiceState: {
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    clientState: {
        client?: Client;
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    productState: {
        products: Product[];
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    headerForm: {
        invoiceDate: string;
        dueDate: string;
        setInvoiceDate: (value: string) => void;
        setDueDate: (value: string) => void;
        submit: (event: FormEvent<HTMLFormElement>) => void;
        isSaving: boolean;
    };
    lineEditor: {
        drafts: Record<number, InvoiceLineEditorDraft>;
        update: (lineId: number, field: keyof InvoiceLineEditorDraft, value: string) => void;
        save: (lineId: number) => void;
        remove: (lineId: number) => void;
        isSaving: boolean;
        isRemoving: boolean;
    };
    addLineForm: {
        draft: InvoiceAddLineDraft;
        setField: (field: keyof InvoiceAddLineDraft, value: string) => void;
        submit: (event: FormEvent<HTMLFormElement>) => void;
        isSubmitting: boolean;
    };
    deleteInvoice: {
        run: () => void;
        isPending: boolean;
    };
};

export function useInvoiceDetailPage(invoiceId?: number): InvoiceDetailPageModel {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const invoiceQuery = useQuery({
        queryKey: ["invoice", invoiceId],
        queryFn: () => invoicesApi.get(invoiceId!),
        enabled: invoiceId !== undefined,
    });

    const clientQuery = useQuery({
        queryKey: ["client", invoiceQuery.data?.clientId],
        queryFn: () => clientsApi.get(invoiceQuery.data!.clientId),
        enabled: Boolean(invoiceQuery.data),
        staleTime: 5 * 60 * 1000,
    });

    const productsQuery = useQuery({
        queryKey: ["products", { isActive: true, pageSize: 1000 }],
        queryFn: () => productsApi.list({ isActive: true, pageSize: 1000 }),
        staleTime: 5 * 60 * 1000,
    });

    const [invoiceDate, setInvoiceDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [lineDrafts, setLineDrafts] = useState<Record<number, InvoiceLineEditorDraft>>({});
    const [newLine, setNewLine] = useState<InvoiceAddLineDraft>(DEFAULT_INVOICE_ADD_LINE_DRAFT);

    useEffect(() => {
        if (!invoiceQuery.data) return;

        setInvoiceDate(toDateInputValue(invoiceQuery.data.invoiceDate));
        setDueDate(toDateInputValue(invoiceQuery.data.dueDate));
        setLineDrafts(buildLineEditorDrafts(invoiceQuery.data.lines));
        setNewLine(DEFAULT_INVOICE_ADD_LINE_DRAFT);
    }, [invoiceQuery.data]);

    const headerMutation = useMutation({
        mutationFn: (payload: { invoiceDate: string; dueDate?: string }) =>
            invoicesApi.update(invoiceId!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
            toast.success("Invoice updated");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update invoice"));
        },
    });

    const addLineMutation = useMutation({
        mutationFn: (payload: {
            invoiceId: number;
            line: { productId: number; quantity: number; unitPrice: number; lineNumber?: number };
        }) => invoicesApi.addLine(payload.invoiceId, payload.line),
        onSuccess: (detail) => {
            queryClient.setQueryData(["invoice", invoiceId], detail);
            setLineDrafts(buildLineEditorDrafts(detail.lines));
            setNewLine(DEFAULT_INVOICE_ADD_LINE_DRAFT);
            toast.success("Line added");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to add line"));
        },
    });

    const updateLineMutation = useMutation({
        mutationFn: (payload: {
            invoiceId: number;
            lineId: number;
            line: { quantity: number; unitPrice: number; lineNumber?: number };
        }) => invoicesApi.updateLine(payload.invoiceId, payload.lineId, payload.line),
        onSuccess: (detail) => {
            queryClient.setQueryData(["invoice", invoiceId], detail);
            setLineDrafts(buildLineEditorDrafts(detail.lines));
            toast.success("Line updated");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update line"));
        },
    });

    const deleteLineMutation = useMutation({
        mutationFn: (payload: { invoiceId: number; lineId: number }) =>
            invoicesApi.deleteLine(payload.invoiceId, payload.lineId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
            toast.success("Line deleted");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to delete line"));
        },
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: (invoiceIdValue: number) => invoicesApi.delete(invoiceIdValue),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice deleted");
            navigate("/invoices");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to delete invoice"));
        },
    });

    const submitHeader = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!invoiceId) return;

        if (!invoiceDate) {
            toast.error("Invoice date is required.");
            return;
        }

        headerMutation.mutate({
            invoiceDate,
            dueDate: dueDate.trim() ? dueDate : undefined,
        });
    };

    const updateLineDraft = (
        lineId: number,
        field: keyof InvoiceLineEditorDraft,
        value: string,
    ) => {
        setLineDrafts((prev) => ({
            ...prev,
            [lineId]: {
                ...prev[lineId],
                [field]: value,
            },
        }));
    };

    const saveLine = (lineId: number) => {
        if (!invoiceId) return;

        const draft = lineDrafts[lineId];
        if (!draft) return;

        const validation = validateInvoiceLineValues(draft);
        if (validation.error || !validation.data) {
            toast.error(validation.error ?? "Invalid line item");
            return;
        }

        updateLineMutation.mutate({
            invoiceId,
            lineId,
            line: validation.data,
        });
    };

    const removeLine = (lineId: number) => {
        if (!invoiceId) return;

        deleteLineMutation.mutate({ invoiceId, lineId });
    };

    const setNewLineField = (field: keyof InvoiceAddLineDraft, value: string) => {
        setNewLine((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const submitNewLine = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!invoiceId) return;

        const validation = validateInvoiceProductLineValues(newLine);
        if (validation.error || !validation.data) {
            toast.error(validation.error ?? "Invalid line item");
            return;
        }

        addLineMutation.mutate({
            invoiceId,
            line: validation.data,
        });
    };

    const runDeleteInvoice = () => {
        if (!invoiceId) return;
        deleteInvoiceMutation.mutate(invoiceId);
    };

    return {
        invoiceId,
        invoice: invoiceQuery.data,
        invoiceState: {
            isLoading: invoiceQuery.isLoading,
            error: invoiceQuery.error,
            retry: invoiceQuery.refetch,
        },
        clientState: {
            client: clientQuery.data,
            isLoading: clientQuery.isLoading,
            error: clientQuery.error,
            retry: clientQuery.refetch,
        },
        productState: {
            products: productsQuery.data?.items ?? [],
            isLoading: productsQuery.isLoading,
            error: productsQuery.error,
            retry: productsQuery.refetch,
        },
        headerForm: {
            invoiceDate,
            dueDate,
            setInvoiceDate,
            setDueDate,
            submit: submitHeader,
            isSaving: headerMutation.isPending,
        },
        lineEditor: {
            drafts: lineDrafts,
            update: updateLineDraft,
            save: saveLine,
            remove: removeLine,
            isSaving: updateLineMutation.isPending,
            isRemoving: deleteLineMutation.isPending,
        },
        addLineForm: {
            draft: newLine,
            setField: setNewLineField,
            submit: submitNewLine,
            isSubmitting: addLineMutation.isPending,
        },
        deleteInvoice: {
            run: runDeleteInvoice,
            isPending: deleteInvoiceMutation.isPending,
        },
    };
}
