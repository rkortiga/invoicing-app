export type Client = {
    id: number;
    name: string;
    abn: string;
    phone?: string | null;
    email?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

export type ClientInput = {
    name: string;
    abn: string;
    phone?: string | null;
    email?: string | null;
};
