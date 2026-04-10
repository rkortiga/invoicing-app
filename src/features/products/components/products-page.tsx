import { Pencil, Plus, Power, Search } from "lucide-react";
import { PaginationControls } from "../../../components/pagination-controls";
import { QueryErrorState } from "../../../components/query-error-state";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { ProductsPageModel } from "../hooks/use-products-page";

type ProductsPageProps = {
    model: ProductsPageModel;
};

export function ProductsPage({ model }: ProductsPageProps) {
    const submitLabel = model.dialog.editingProduct
        ? model.form.isSubmitting
            ? "Updating..."
            : "Update Product"
        : model.form.isSubmitting
          ? "Creating..."
          : "Create Product";

    return (
        <Dialog open={model.dialog.isOpen} onOpenChange={model.dialog.onOpenChange}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">Manage your product catalog</p>
                    </div>
                    <Button onClick={model.dialog.openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Product
                    </Button>
                </div>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {model.dialog.editingProduct ? "Edit Product" : "New Product"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={model.form.submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={model.dialog.editingProduct?.name ?? ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                name="sku"
                                defaultValue={model.dialog.editingProduct?.sku ?? ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={model.dialog.editingProduct?.price ?? ""}
                                required
                            />
                        </div>
                        {model.dialog.editingProduct ? (
                            <p className="text-sm text-muted-foreground">
                                Toggle product status from the list view.
                            </p>
                        ) : null}
                        <Button type="submit" className="w-full" disabled={model.form.isSubmitting}>
                            {submitLabel}
                        </Button>
                    </form>
                </DialogContent>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex flex-1 items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={model.filters.search}
                                    onChange={(event) => {
                                        model.filters.updateSearch(event.target.value);
                                    }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        model.filters.filterActive === undefined
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => {
                                        model.filters.setFilterActive(undefined);
                                    }}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={
                                        model.filters.filterActive === true ? "default" : "outline"
                                    }
                                    onClick={() => {
                                        model.filters.setFilterActive(true);
                                    }}
                                >
                                    Active
                                </Button>
                                <Button
                                    variant={
                                        model.filters.filterActive === false ? "default" : "outline"
                                    }
                                    onClick={() => {
                                        model.filters.setFilterActive(false);
                                    }}
                                >
                                    Inactive
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {model.list.isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Loading products...
                            </div>
                        ) : model.list.error ? (
                            <QueryErrorState
                                title="Couldn't load products"
                                fallbackMessage="Something went wrong while loading the product list."
                                error={model.list.error}
                                onRetry={model.list.retry}
                            />
                        ) : model.list.data?.items.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No products found
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {model.list.data?.items.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-4"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{product.name}</p>
                                                <Badge
                                                    variant={
                                                        product.isActive ? "default" : "secondary"
                                                    }
                                                >
                                                    {product.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {product.sku}
                                            </p>
                                            <p className="text-sm font-medium">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                aria-label={`Edit product ${product.name}`}
                                                onClick={() => {
                                                    model.dialog.openEdit(product);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                aria-label={`${product.isActive ? "Deactivate" : "Activate"} product ${product.name}`}
                                                onClick={() => {
                                                    model.actions.toggleStatus(product);
                                                }}
                                            >
                                                <Power className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {model.list.data ? (
                            <PaginationControls
                                page={model.filters.page}
                                totalPages={model.list.data.totalPages}
                                onPageChange={model.filters.setPage}
                            />
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </Dialog>
    );
}
