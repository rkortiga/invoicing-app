import { useMemo, type FormEvent } from "react";
import { format } from "date-fns";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { QueryErrorState } from "../../../components/query-error-state";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { SearchableSelect, type SelectOption } from "../../../components/searchable-select";
import type { InvoiceLineDetail } from "../api/invoice-types";
import type { InvoiceAddLineDraft, InvoiceLineEditorDraft } from "../lib/invoice-form-helpers";
import type { InvoiceDetailPageModel } from "../hooks/use-invoice-detail-page";

type InvoiceDetailContentProps = {
    model: InvoiceDetailPageModel;
    onBack: () => void;
};

function InvoiceLineEditorCard({
    line,
    draft,
    invoiceCreatedAt,
    onDraftChange,
    onSave,
    onDelete,
    isSaving,
    isRemoving,
}: {
    line: InvoiceLineDetail;
    draft?: InvoiceLineEditorDraft;
    invoiceCreatedAt: string;
    onDraftChange: (field: keyof InvoiceLineEditorDraft, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    isSaving: boolean;
    isRemoving: boolean;
}) {
    return (
        <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium">
                        {line.product?.name ?? `Product #${line.productId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        SKU: {line.product?.sku ?? "N/A"}
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Created: {format(new Date(line.createdAt ?? invoiceCreatedAt), "MMM dd, yyyy")}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                    <Label>Line Number</Label>
                    <Input
                        value={draft?.lineNumber ?? ""}
                        onChange={(event) => onDraftChange("lineNumber", event.target.value)}
                        placeholder={line.lineNumber.toString()}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={draft?.quantity ?? ""}
                        onChange={(event) => onDraftChange("quantity", event.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={draft?.unitPrice ?? ""}
                        onChange={(event) => onDraftChange("unitPrice", event.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Line Total</Label>
                    <div className="flex h-10 items-center font-medium">
                        ${line.lineTotal.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    disabled={isRemoving}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </div>
        </div>
    );
}

function AddInvoiceLineForm({
    draft,
    productOptions,
    isProductsLoading,
    productsError,
    onRetryProducts,
    onFieldChange,
    onSubmit,
    isSubmitting,
}: {
    draft: InvoiceAddLineDraft;
    productOptions: SelectOption[];
    isProductsLoading: boolean;
    productsError: unknown;
    onRetryProducts: () => Promise<unknown>;
    onFieldChange: (field: keyof InvoiceAddLineDraft, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    isSubmitting: boolean;
}) {
    return (
        <form
            className="space-y-4 rounded-lg border border-dashed border-border p-4"
            onSubmit={onSubmit}
        >
            <h4 className="flex items-center gap-2 font-semibold">
                <Plus className="h-4 w-4" />
                Add Line
            </h4>

            {productsError ? (
                <QueryErrorState
                    title="Couldn't load products"
                    fallbackMessage="The add-line form is unavailable until product options can be loaded."
                    error={productsError}
                    onRetry={onRetryProducts}
                />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-5">
                <div className="space-y-2 sm:col-span-2">
                    <Label>Product</Label>
                    <SearchableSelect
                        options={productOptions}
                        value={draft.productId}
                        onValueChange={(value) => onFieldChange("productId", value)}
                        placeholder="Select product"
                        searchPlaceholder="Search products..."
                        emptyMessage="No matching products."
                        disabled={isProductsLoading || Boolean(productsError)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={draft.quantity}
                        onChange={(event) => onFieldChange("quantity", event.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={draft.unitPrice}
                        onChange={(event) => onFieldChange("unitPrice", event.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Line Number (optional)</Label>
                    <Input
                        type="number"
                        step="1"
                        min="1"
                        value={draft.lineNumber}
                        onChange={(event) => onFieldChange("lineNumber", event.target.value)}
                    />
                </div>

                <div className="flex items-end">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || isProductsLoading || Boolean(productsError)}
                    >
                        {isSubmitting ? "Adding..." : "Add Line"}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export function InvoiceDetailContent({ model, onBack }: InvoiceDetailContentProps) {
    const productOptions = useMemo<SelectOption[]>(
        () =>
            model.productState.products.map((p) => ({
                value: String(p.id),
                label: `${p.name} - $${p.price.toFixed(2)}`,
            })),
        [model.productState.products],
    );

    if (!model.invoice) {
        return null;
    }

    const invoice = model.invoice;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invoices
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => {
                        if (confirm("Are you sure you want to delete this invoice?")) {
                            model.deleteInvoice.run();
                        }
                    }}
                    disabled={model.deleteInvoice.isPending}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {model.deleteInvoice.isPending ? "Deleting..." : "Delete Invoice"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Invoice {invoice.invoiceCode}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <section className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            {model.clientState.error ? (
                                <QueryErrorState
                                    title="Couldn't load client details"
                                    fallbackMessage="Showing the invoice client ID until the client record can be loaded."
                                    error={model.clientState.error}
                                    onRetry={model.clientState.retry}
                                />
                            ) : null}

                            <div>
                                <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
                                    Client
                                </h3>
                                <p className="font-medium">
                                    {model.clientState.client?.name ??
                                        `Client #${invoice.clientId}`}
                                </p>
                                {model.clientState.client?.abn ? (
                                    <p className="text-sm text-muted-foreground">
                                        ABN: {model.clientState.client.abn}
                                    </p>
                                ) : null}
                                {model.clientState.client?.phone ? (
                                    <p className="text-sm text-muted-foreground">
                                        Phone: {model.clientState.client.phone}
                                    </p>
                                ) : null}
                                {model.clientState.client?.email ? (
                                    <p className="text-sm text-muted-foreground">
                                        Email: {model.clientState.client.email}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={model.headerForm.submit}>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-date">Invoice Date</Label>
                                <Input
                                    id="invoice-date"
                                    type="date"
                                    value={model.headerForm.invoiceDate}
                                    onChange={(event) =>
                                        model.headerForm.setInvoiceDate(event.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due-date">Due Date</Label>
                                <Input
                                    id="due-date"
                                    type="date"
                                    value={model.headerForm.dueDate}
                                    onChange={(event) =>
                                        model.headerForm.setDueDate(event.target.value)
                                    }
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={model.headerForm.isSaving}
                                className="inline-flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {model.headerForm.isSaving ? "Saving..." : "Save header"}
                            </Button>
                        </form>
                    </section>

                    <section className="space-y-6 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Line Items</h3>
                        </div>

                        <div className="space-y-4">
                            {invoice.lines.map((line) => (
                                <InvoiceLineEditorCard
                                    key={line.id}
                                    line={line}
                                    draft={model.lineEditor.drafts[line.id]}
                                    invoiceCreatedAt={invoice.createdAt}
                                    onDraftChange={(field, value) =>
                                        model.lineEditor.update(line.id, field, value)
                                    }
                                    onSave={() => model.lineEditor.save(line.id)}
                                    onDelete={() => {
                                        if (confirm("Delete this line item?")) {
                                            model.lineEditor.remove(line.id);
                                        }
                                    }}
                                    isSaving={model.lineEditor.isSaving}
                                    isRemoving={model.lineEditor.isRemoving}
                                />
                            ))}
                        </div>

                        <AddInvoiceLineForm
                            draft={model.addLineForm.draft}
                            productOptions={productOptions}
                            isProductsLoading={model.productState.isLoading}
                            productsError={model.productState.error}
                            onRetryProducts={model.productState.retry}
                            onFieldChange={model.addLineForm.setField}
                            onSubmit={model.addLineForm.submit}
                            isSubmitting={model.addLineForm.isSubmitting}
                        />
                    </section>

                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between text-xl font-bold">
                            <span>Total Amount</span>
                            <span className="text-primary">${invoice.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
