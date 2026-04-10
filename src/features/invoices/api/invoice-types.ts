export type InvoiceListItem = {
    id: number;
    invoiceCode: string;
    clientId: number;
    invoiceDate: string;
    dueDate?: string | null;
    totalAmount: number;
    createdAt: string;
    updatedAt?: string | null;
};

export type InvoiceLineDetail = {
    id: number;
    lineNumber: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: {
        id: number;
        name: string;
        sku: string;
        price: number;
    };
    createdAt?: string;
    updatedAt?: string | null;
};

export type InvoiceDetail = {
    id: number;
    invoiceCode: string;
    clientId: number;
    invoiceDate: string;
    dueDate?: string | null;
    totalAmount: number;
    createdAt: string;
    updatedAt?: string | null;
    lines: InvoiceLineDetail[];
};

export type InvoiceCreateLine = {
    productId: number;
    quantity: number;
    unitPrice: number;
    lineNumber?: number;
};

export type InvoiceCreateInput = {
    invoiceCode: string;
    clientId: number;
    invoiceDate: string;
    dueDate?: string | null;
    lines: InvoiceCreateLine[];
};

export type InvoiceUpdateInput = {
    invoiceDate?: string;
    dueDate?: string | null;
};

export type InvoiceLineUpdateInput = {
    quantity?: number;
    unitPrice?: number;
    lineNumber?: number;
};
