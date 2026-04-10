type PagedResult<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
};

export interface PaginatedResponse<T> extends PagedResult<T> {
    totalPages: number;
}

export function withTotalPages<T>(paged: PagedResult<T>): PaginatedResponse<T> {
    const pageSize = paged.pageSize || 1;
    const totalPages = Math.max(1, Math.ceil((paged.totalCount ?? 0) / pageSize));

    return {
        ...paged,
        totalPages,
    };
}

export type { PagedResult };
