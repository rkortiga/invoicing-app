import { apiRequest, buildQuery } from "../../../lib/api/http-client";
import { type PaginatedResponse, type PagedResult, withTotalPages } from "../../../lib/api/pagination";
import type {
    InvoiceCreateInput,
    InvoiceCreateLine,
    InvoiceDetail,
    InvoiceLineUpdateInput,
    InvoiceListItem,
    InvoiceUpdateInput,
} from "./invoice-types";

export const invoicesApi = {
    list: async (params?: {
        clientId?: number | string;
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<InvoiceListItem>> => {
        const query = buildQuery({
            clientId: params?.clientId,
            from: params?.from,
            to: params?.to,
            page: params?.page,
            pageSize: params?.pageSize,
        });

        const data = await apiRequest<PagedResult<InvoiceListItem>>(`/invoices${query}`);
        return withTotalPages(data);
    },

    get: (id: number): Promise<InvoiceDetail> => apiRequest<InvoiceDetail>(`/invoices/${id}`),

    getByCode: (code: string): Promise<InvoiceDetail> =>
        apiRequest<InvoiceDetail>(`/invoices/code/${code}`),

    create: (invoice: InvoiceCreateInput): Promise<InvoiceDetail> =>
        apiRequest<InvoiceDetail>("/invoices", {
            method: "POST",
            body: invoice,
        }),

    update: (id: number, invoice: InvoiceUpdateInput): Promise<void> =>
        apiRequest<void>(`/invoices/${id}`, {
            method: "PUT",
            body: invoice,
        }),

    delete: (id: number): Promise<void> =>
        apiRequest<void>(`/invoices/${id}`, {
            method: "DELETE",
        }),

    addLine: (invoiceId: number, line: InvoiceCreateLine): Promise<InvoiceDetail> =>
        apiRequest<InvoiceDetail>(`/invoices/${invoiceId}/lines`, {
            method: "POST",
            body: line,
        }),

    updateLine: (
        invoiceId: number,
        lineId: number,
        line: InvoiceLineUpdateInput,
    ): Promise<InvoiceDetail> =>
        apiRequest<InvoiceDetail>(`/invoices/${invoiceId}/lines/${lineId}`, {
            method: "PUT",
            body: line,
        }),

    deleteLine: (invoiceId: number, lineId: number): Promise<void> =>
        apiRequest<void>(`/invoices/${invoiceId}/lines/${lineId}`, {
            method: "DELETE",
        }),
};
