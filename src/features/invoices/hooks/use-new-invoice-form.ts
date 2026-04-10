import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../../../lib/api";
import type { Client } from "../../clients/api/client-types";
import { useClientsLookup } from "../../clients/hooks/use-clients-lookup";
import { productsApi } from "../../products/api/products-api";
import type { Product } from "../../products/api/product-types";
import { invoicesApi } from "../api/invoices-api";
import type { InvoiceCreateInput } from "../api/invoice-types";
import {
    DEFAULT_CREATE_INVOICE_LINE_DRAFT,
    applyProductToCreateLineDraft,
    buildCreateInvoiceLines,
    calculateDraftInvoiceTotal,
    formatDateInputValue,
    type CreateInvoiceLineDraft,
} from "../lib/invoice-form-helpers";

export type NewInvoiceFormModel = {
    fields: {
        clientId: string;
        invoiceCode: string;
        invoiceDate: string;
        dueDate: string;
        setClientId: (value: string) => void;
        setInvoiceCode: (value: string) => void;
        setInvoiceDate: (value: string) => void;
        setDueDate: (value: string) => void;
    };
    lookups: {
        clients: Client[];
        products: Product[];
        isClientsLoading: boolean;
        isProductsLoading: boolean;
        clientsError: unknown;
        productsError: unknown;
        retryClients: () => Promise<unknown>;
        retryProducts: () => Promise<unknown>;
    };
    lines: {
        items: CreateInvoiceLineDraft[];
        totalAmount: number;
        add: () => void;
        remove: (index: number) => void;
        update: (
            index: number,
            field: keyof CreateInvoiceLineDraft,
            value: string | number,
        ) => void;
        selectProduct: (index: number, productId: string) => void;
    };
    submission: {
        isSubmitting: boolean;
        isFormInvalid: boolean;
        submit: (event: FormEvent<HTMLFormElement>) => void;
    };
};

export function useNewInvoiceForm(): NewInvoiceFormModel {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [clientId, setClientId] = useState("");
    const [invoiceCode, setInvoiceCode] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(formatDateInputValue(new Date()));
    const [dueDate, setDueDate] = useState("");
    const [lines, setLines] = useState<CreateInvoiceLineDraft[]>([
        { ...DEFAULT_CREATE_INVOICE_LINE_DRAFT },
    ]);

    const clientsLookup = useClientsLookup();

    const productsQuery = useQuery({
        queryKey: ["products", { isActive: true, pageSize: 1000 }],
        queryFn: () => productsApi.list({ isActive: true, pageSize: 1000 }),
        staleTime: 5 * 60 * 1000,
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (payload: InvoiceCreateInput) => invoicesApi.create(payload),
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice created successfully");
            navigate(`/invoices/${created.id}`);
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to create invoice"));
        },
    });

    const addLine = () => {
        setLines((prev) => [...prev, { ...DEFAULT_CREATE_INVOICE_LINE_DRAFT }]);
    };

    const removeLine = (index: number) => {
        setLines((prev) => prev.filter((_, lineIndex) => lineIndex !== index));
    };

    const updateLine = (
        index: number,
        field: keyof CreateInvoiceLineDraft,
        value: string | number,
    ) => {
        setLines((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value } as CreateInvoiceLineDraft;
            return next;
        });
    };

    const selectProduct = (index: number, productId: string) => {
        const numericId = Number(productId);
        const product = productsQuery.data?.items.find((item) => item.id === numericId);
        if (!product) return;

        setLines((prev) => {
            const next = [...prev];
            next[index] = applyProductToCreateLineDraft(next[index], product);
            return next;
        });
    };

    const preparedLines = useMemo(() => buildCreateInvoiceLines(lines), [lines]);
    const totalAmount = useMemo(() => calculateDraftInvoiceTotal(lines), [lines]);

    const isFormInvalid = useMemo(() => {
        if (
            clientsLookup.isLoading ||
            productsQuery.isLoading ||
            clientsLookup.error ||
            productsQuery.error
        ) {
            return true;
        }

        if (!clientId || !invoiceCode.trim()) {
            return true;
        }

        return preparedLines.length === 0;
    }, [
        clientId,
        invoiceCode,
        preparedLines.length,
        clientsLookup.isLoading,
        productsQuery.isLoading,
        clientsLookup.error,
        productsQuery.error,
    ]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedCode = invoiceCode.trim();
        if (!trimmedCode) {
            toast.error("Please enter an invoice code");
            return;
        }

        const numericClientId = Number(clientId);
        if (!Number.isFinite(numericClientId)) {
            toast.error("Please select a valid client");
            return;
        }

        if (preparedLines.length === 0) {
            toast.error("Please add at least one valid line item");
            return;
        }

        const payload: InvoiceCreateInput = {
            invoiceCode: trimmedCode,
            clientId: numericClientId,
            invoiceDate,
            dueDate: dueDate.trim() || undefined,
            lines: preparedLines,
        };

        createInvoiceMutation.mutate(payload);
    };

    return {
        fields: {
            clientId,
            invoiceCode,
            invoiceDate,
            dueDate,
            setClientId,
            setInvoiceCode,
            setInvoiceDate,
            setDueDate,
        },
        lookups: {
            clients: clientsLookup.items,
            products: productsQuery.data?.items ?? [],
            isClientsLoading: clientsLookup.isLoading,
            isProductsLoading: productsQuery.isLoading,
            clientsError: clientsLookup.error,
            productsError: productsQuery.error,
            retryClients: clientsLookup.retry,
            retryProducts: productsQuery.refetch,
        },
        lines: {
            items: lines,
            totalAmount,
            add: addLine,
            remove: removeLine,
            update: updateLine,
            selectProduct,
        },
        submission: {
            isSubmitting: createInvoiceMutation.isPending,
            isFormInvalid,
            submit,
        },
    };
}
