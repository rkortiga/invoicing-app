import { apiRequest, buildQuery } from "../../../lib/api/http-client";
import {
    type PaginatedResponse,
    type PagedResult,
    withTotalPages,
} from "../../../lib/api/pagination";
import type { Client, ClientInput } from "./client-types";

export const clientsApi = {
    list: async (params?: {
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<Client>> => {
        const query = buildQuery({
            search: params?.search,
            page: params?.page,
            pageSize: params?.pageSize,
        });

        const data = await apiRequest<PagedResult<Client>>(`/clients${query}`);
        return withTotalPages(data);
    },

    get: (id: number): Promise<Client> => apiRequest<Client>(`/clients/${id}`),

    create: (client: ClientInput): Promise<Client> =>
        apiRequest<Client>("/clients", {
            method: "POST",
            body: client,
        }),

    update: (id: number, client: ClientInput): Promise<void> =>
        apiRequest<void>(`/clients/${id}`, {
            method: "PUT",
            body: client,
        }),

    delete: (id: number): Promise<void> =>
        apiRequest<void>(`/clients/${id}`, {
            method: "DELETE",
        }),
};
