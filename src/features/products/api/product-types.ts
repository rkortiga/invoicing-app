export type Product = {
    id: number;
    name: string;
    sku: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string | null;
};

export type ProductInput = {
    name: string;
    sku: string;
    price: number;
};
