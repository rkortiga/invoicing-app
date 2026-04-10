import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { QueryErrorState } from "../components/query-error-state";
import { FileText, Plus, TrendingUp } from "lucide-react";
import { useClientsLookup } from "../features/clients/hooks/use-clients-lookup";
import { invoicesApi } from "../features/invoices/api/invoices-api";

const DASHBOARD_RECENT_INVOICES_PAGE_SIZE = 5;

function sumInvoiceAmounts(invoices: Array<{ totalAmount: number }>) {
    return invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
}

export default function Dashboard() {
    const {
        data: invoices,
        isLoading,
        error: invoicesError,
        refetch: refetchInvoices,
    } = useQuery({
        queryKey: ["invoices", { page: 1, pageSize: DASHBOARD_RECENT_INVOICES_PAGE_SIZE }],
        queryFn: () => invoicesApi.list({ page: 1, pageSize: DASHBOARD_RECENT_INVOICES_PAGE_SIZE }),
    });

    const totalRevenueQuery = useQuery({
        queryKey: [
            "dashboard-invoice-revenue",
            { totalPages: invoices?.totalPages, pageSize: invoices?.pageSize },
        ],
        enabled: Boolean(invoices) && (invoices?.totalPages ?? 0) > 1,
        queryFn: async () => {
            if (!invoices) {
                return 0;
            }

            const remainingPages = await Promise.all(
                Array.from({ length: invoices.totalPages - 1 }, (_, index) =>
                    invoicesApi.list({
                        page: index + 2,
                        pageSize: invoices.pageSize,
                    }),
                ),
            );

            return (
                sumInvoiceAmounts(invoices.items) +
                remainingPages.reduce((sum, page) => sum + sumInvoiceAmounts(page.items), 0)
            );
        },
    });

    const {
        byId: clientLookup,
        isLoading: isClientLookupLoading,
        error: clientLookupError,
        retry: retryClientLookup,
    } = useClientsLookup();

    const resolveClientName = (clientId: number) => {
        const client = clientLookup.get(clientId);
        if (client) return client.name;
        if (clientLookupError) return `Client #${clientId}`;
        if (isClientLookupLoading) return "Loading...";
        return `Client #${clientId}`;
    };

    const totalRevenue = useMemo(() => {
        if (!invoices) {
            return 0;
        }

        if (invoices.totalPages <= 1) {
            return sumInvoiceAmounts(invoices.items);
        }

        return totalRevenueQuery.data;
    }, [invoices, totalRevenueQuery.data]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your invoice management</p>
                </div>
                <Link to="/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invoicesError ? "--" : (invoices?.totalCount ?? 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invoicesError || totalRevenueQuery.error
                                ? "--"
                                : typeof totalRevenue === "number"
                                  ? `$${totalRevenue.toFixed(2)}`
                                  : "..."}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invoicesError ? "--" : (invoices?.items.length ?? 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>Latest invoices from your system</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading invoices...
                        </div>
                    ) : invoicesError ? (
                        <QueryErrorState
                            title="Couldn't load recent invoices"
                            fallbackMessage="Something went wrong while loading the dashboard invoices."
                            error={invoicesError}
                            onRetry={refetchInvoices}
                        />
                    ) : invoices?.items.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">No invoices yet</p>
                            <Link to="/invoices/new">
                                <Button>Create your first invoice</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {clientLookupError ? (
                                <QueryErrorState
                                    title="Some client names couldn't be loaded"
                                    fallbackMessage="Invoice rows will fall back to client IDs until the lookup succeeds."
                                    error={clientLookupError}
                                    onRetry={retryClientLookup}
                                />
                            ) : null}
                            {invoices?.items.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    to={`/invoices/${invoice.id}`}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{invoice.invoiceCode}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {resolveClientName(invoice.clientId)}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-medium">
                                            ${invoice.totalAmount.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            <div className="pt-4">
                                <Link to="/invoices">
                                    <Button variant="outline" className="w-full">
                                        View All Invoices
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
