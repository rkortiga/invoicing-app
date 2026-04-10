import { useMemo } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { SearchableSelect, type SelectOption } from "../../../components/searchable-select";
import { getErrorMessage } from "../../../lib/api";
import {
    calculateLineTotal,
    sanitizeNonNegativeNumber,
    type CreateInvoiceLineDraft,
} from "../lib/invoice-form-helpers";
import type { NewInvoiceFormModel } from "../hooks/use-new-invoice-form";

type NewInvoiceFormProps = {
    model: NewInvoiceFormModel;
    onBack: () => void;
};

function NewInvoiceLineRow({
    index,
    line,
    productOptions,
    model,
}: {
    index: number;
    line: CreateInvoiceLineDraft;
    productOptions: SelectOption[];
    model: NewInvoiceFormModel;
}) {
    return (
        <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1 space-y-2">
                <Label>Product</Label>
                <SearchableSelect
                    options={productOptions}
                    value={line.productId}
                    onValueChange={(value) => model.lines.selectProduct(index, value)}
                    placeholder={
                        model.lookups.isProductsLoading
                            ? "Loading products..."
                            : model.lookups.productsError
                              ? "Unable to load products"
                              : "Select product"
                    }
                    searchPlaceholder="Search products..."
                    emptyMessage="No matching products."
                    disabled={
                        model.lookups.isProductsLoading || Boolean(model.lookups.productsError)
                    }
                />
            </div>

            <div className="w-24 space-y-2">
                <Label>Quantity</Label>
                <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={line.quantity}
                    onChange={(event) =>
                        model.lines.update(
                            index,
                            "quantity",
                            sanitizeNonNegativeNumber(event.target.value),
                        )
                    }
                />
            </div>

            <div className="w-28 space-y-2">
                <Label>Unit Price</Label>
                <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={line.unitPrice}
                    onChange={(event) =>
                        model.lines.update(
                            index,
                            "unitPrice",
                            sanitizeNonNegativeNumber(event.target.value),
                        )
                    }
                />
            </div>

            <div className="w-28 space-y-2">
                <Label>Total</Label>
                <div className="flex h-10 items-center font-medium">
                    ${calculateLineTotal(line.quantity, line.unitPrice).toFixed(2)}
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove line item ${index + 1}`}
                onClick={() => model.lines.remove(index)}
                disabled={model.lines.items.length === 1}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function NewInvoiceForm({ model, onBack }: NewInvoiceFormProps) {
    const clientOptions = useMemo<SelectOption[]>(
        () =>
            model.lookups.clients.map((c) => ({
                value: String(c.id),
                label: `${c.name} - ${c.abn}`,
            })),
        [model.lookups.clients],
    );

    const productOptions = useMemo<SelectOption[]>(
        () =>
            model.lookups.products.map((p) => ({
                value: String(p.id),
                label: `${p.name} - $${p.price.toFixed(2)}`,
            })),
        [model.lookups.products],
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invoices
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">New Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-8" onSubmit={model.submission.submit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="invoiceCode">Invoice Code</Label>
                                <Input
                                    id="invoiceCode"
                                    value={model.fields.invoiceCode}
                                    onChange={(event) =>
                                        model.fields.setInvoiceCode(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Client</Label>
                                <SearchableSelect
                                    options={clientOptions}
                                    value={model.fields.clientId}
                                    onValueChange={model.fields.setClientId}
                                    placeholder={
                                        model.lookups.isClientsLoading
                                            ? "Loading clients..."
                                            : model.lookups.clientsError
                                              ? "Unable to load clients"
                                              : "Select client"
                                    }
                                    searchPlaceholder="Search clients..."
                                    emptyMessage="No matching clients."
                                    disabled={
                                        model.lookups.isClientsLoading ||
                                        Boolean(model.lookups.clientsError)
                                    }
                                />
                                {model.lookups.clientsError ? (
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-destructive">
                                        <span>
                                            {getErrorMessage(
                                                model.lookups.clientsError,
                                                "Couldn't load clients for this form.",
                                            )}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => {
                                                void model.lookups.retryClients();
                                            }}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invoiceDate">Invoice Date</Label>
                                <Input
                                    id="invoiceDate"
                                    type="date"
                                    value={model.fields.invoiceDate}
                                    onChange={(event) =>
                                        model.fields.setInvoiceDate(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={model.fields.dueDate}
                                    onChange={(event) =>
                                        model.fields.setDueDate(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Line Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={model.lines.add}
                                    disabled={
                                        model.lookups.isProductsLoading ||
                                        Boolean(model.lookups.productsError)
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Line
                                </Button>
                            </div>
                            {model.lookups.productsError ? (
                                <div className="flex flex-wrap items-center gap-2 text-sm text-destructive">
                                    <span>
                                        {getErrorMessage(
                                            model.lookups.productsError,
                                            "Couldn't load products for line items.",
                                        )}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => {
                                            void model.lookups.retryProducts();
                                        }}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : null}

                            {model.lines.items.map((line, index) => (
                                <NewInvoiceLineRow
                                    key={index}
                                    index={index}
                                    line={line}
                                    productOptions={productOptions}
                                    model={model}
                                />
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between text-xl font-bold">
                                <span>Total Amount</span>
                                <span className="text-primary">
                                    ${model.lines.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                model.submission.isSubmitting || model.submission.isFormInvalid
                            }
                        >
                            {model.submission.isSubmitting ? "Creating..." : "Create Invoice"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
