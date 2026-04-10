import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../../../lib/api";
import { productsApi } from "../api/products-api";
import type { Product, ProductInput } from "../api/product-types";

const PRODUCTS_PAGE_SIZE = 10;

function buildProductInput(form: HTMLFormElement): ProductInput {
    const formData = new FormData(form);

    return {
        name: (formData.get("name") as string).trim(),
        sku: (formData.get("sku") as string).trim(),
        price: Number(formData.get("price")),
    };
}

export type ProductsPageModel = {
    filters: {
        search: string;
        updateSearch: (value: string) => void;
        filterActive: boolean | undefined;
        setFilterActive: (value: boolean | undefined) => void;
        page: number;
        setPage: (page: number) => void;
    };
    dialog: {
        isOpen: boolean;
        editingProduct: Product | null;
        openCreate: () => void;
        openEdit: (product: Product) => void;
        onOpenChange: (open: boolean) => void;
    };
    list: {
        data: Awaited<ReturnType<typeof productsApi.list>> | undefined;
        isLoading: boolean;
        error: unknown;
        retry: () => Promise<unknown>;
    };
    form: {
        submit: (event: FormEvent<HTMLFormElement>) => void;
        isSubmitting: boolean;
    };
    actions: {
        toggleStatus: (product: Product) => void;
    };
};

export function useProductsPage(): ProductsPageModel {
    const [search, setSearch] = useState("");
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const queryClient = useQueryClient();

    const productsQuery = useQuery({
        queryKey: ["products", { search, filterActive, page }],
        queryFn: () =>
            productsApi.list({
                search,
                isActive: filterActive,
                page,
                pageSize: PRODUCTS_PAGE_SIZE,
            }),
    });

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
    };

    const createMutation = useMutation({
        mutationFn: (product: ProductInput) => productsApi.create(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            closeDialog();
            toast.success("Product created successfully");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to create product"));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProductInput }) =>
            productsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            closeDialog();
            toast.success("Product updated successfully");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update product"));
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            productsApi.updateStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product status updated");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update product status"));
        },
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const productData = buildProductInput(event.currentTarget);
        if (!productData.name || !productData.sku) {
            toast.error("Name and SKU are required.");
            return;
        }

        if (!Number.isFinite(productData.price) || productData.price < 0) {
            toast.error("Price must be a positive number.");
            return;
        }

        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: productData });
            return;
        }

        createMutation.mutate(productData);
    };

    return {
        filters: {
            search,
            updateSearch: (value) => {
                setSearch(value);
                setPage(1);
            },
            filterActive,
            setFilterActive: (value) => {
                setFilterActive(value);
                setPage(1);
            },
            page,
            setPage,
        },
        dialog: {
            isOpen: isDialogOpen,
            editingProduct,
            openCreate: () => {
                setEditingProduct(null);
                setIsDialogOpen(true);
            },
            openEdit: (product) => {
                setEditingProduct(product);
                setIsDialogOpen(true);
            },
            onOpenChange: (open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setEditingProduct(null);
                }
            },
        },
        list: {
            data: productsQuery.data,
            isLoading: productsQuery.isLoading,
            error: productsQuery.error,
            retry: productsQuery.refetch,
        },
        form: {
            submit,
            isSubmitting: createMutation.isPending || updateMutation.isPending,
        },
        actions: {
            toggleStatus: (product) =>
                statusMutation.mutate({
                    id: product.id,
                    isActive: !product.isActive,
                }),
        },
    };
}
