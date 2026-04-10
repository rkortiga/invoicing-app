import { apiRequest, buildQuery } from "../../../lib/api/http-client";
import {
    type PaginatedResponse,
    type PagedResult,
    withTotalPages,
} from "../../../lib/api/pagination";
import type { Product, ProductInput } from "./product-types";

export const productsApi = {
    list: async (params?: {
        search?: string;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<Product>> => {
        const query = buildQuery({
            search: params?.search,
            isActive: params?.isActive,
            page: params?.page,
            pageSize: params?.pageSize,
        });

        const data = await apiRequest<PagedResult<Product>>(`/products${query}`);
        return withTotalPages(data);
    },

    get: (id: number): Promise<Product> => apiRequest<Product>(`/products/${id}`),

    create: (product: ProductInput): Promise<Product> =>
        apiRequest<Product>("/products", {
            method: "POST",
            body: product,
        }),

    update: (id: number, product: ProductInput): Promise<void> =>
        apiRequest<void>(`/products/${id}`, {
            method: "PUT",
            body: product,
        }),

    updateStatus: (id: number, isActive: boolean): Promise<void> =>
        apiRequest<void>(`/products/${id}/status`, {
            method: "PATCH",
            body: { isActive },
        }),
};
