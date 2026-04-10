import { useMemo } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PaginationControls } from "../../../components/pagination-controls";
import { QueryErrorState } from "../../../components/query-error-state";
import { SearchableSelect, type SelectOption } from "../../../components/searchable-select";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { InvoicesPageModel } from "../hooks/use-invoices-page";

type InvoicesPageProps = {
    model: InvoicesPageModel;
};

export function InvoicesPage({ model }: InvoicesPageProps) {
    const clientOptions = useMemo<SelectOption[]>(
        () =>
            model.clients.items.map((client) => ({
                value: String(client.id),
                label: `${client.name} - ${client.abn}`,
            })),
        [model.clients.items],
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage all your invoices</p>
                </div>
                <Link to="/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="space-y-2">
                        <div className="max-w-xs">
                            <SearchableSelect
                                options={clientOptions}
                                value={model.filters.clientId}
                                onValueChange={model.filters.setClientId}
                                placeholder="All clients"
                                searchPlaceholder="Search clients..."
                                emptyMessage="No matching clients."
                                disabled={model.clients.isLoading || Boolean(model.clients.error)}
                            />
                        </div>
                        {model.clients.isLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading client filters...
                            </p>
                        ) : model.clients.error ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-destructive">
                                <span>Client filters are unavailable right now.</span>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0"
                                    onClick={() => {
                                        void model.clients.retry();
                                    }}
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent>
                    {model.list.isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Loading invoices...
                        </div>
                    ) : model.list.error ? (
                        <QueryErrorState
                            title="Couldn't load invoices"
                            fallbackMessage="Something went wrong while loading the invoice list."
                            error={model.list.error}
                            onRetry={model.list.retry}
                        />
                    ) : model.list.data?.items.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mb-4 text-muted-foreground">No invoices found</p>
                            <Link to="/invoices/new">
                                <Button>Create your first invoice</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {model.clients.error ? (
                                <QueryErrorState
                                    title="Some client names couldn't be loaded"
                                    fallbackMessage="Invoice rows will fall back to client IDs until the lookup succeeds."
                                    error={model.clients.error}
                                    onRetry={model.clients.retry}
                                />
                            ) : null}
                            {model.list.data?.items.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    to={`/invoices/${invoice.id}`}
                                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{invoice.invoiceCode}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {model.resolveClientName(invoice.clientId)}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-lg font-medium">
                                            ${invoice.totalAmount.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {invoice.dueDate
                                                ? `Due: ${format(new Date(invoice.dueDate), "MMM dd, yyyy")}`
                                                : "No due date"}
                                        </p>
                                    </div>
                                </Link>
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
    );
}
