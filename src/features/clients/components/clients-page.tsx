import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PaginationControls } from "../../../components/pagination-controls";
import { QueryErrorState } from "../../../components/query-error-state";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { ClientsPageModel } from "../hooks/use-clients-page";

type ClientsPageProps = {
    model: ClientsPageModel;
};

export function ClientsPage({ model }: ClientsPageProps) {
    const submitLabel = model.dialog.editingClient
        ? model.form.isSubmitting
            ? "Updating..."
            : "Update Client"
        : model.form.isSubmitting
          ? "Creating..."
          : "Create Client";

    return (
        <Dialog open={model.dialog.isOpen} onOpenChange={model.dialog.onOpenChange}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                        <p className="text-muted-foreground">Manage your client database</p>
                    </div>
                    <Button onClick={model.dialog.openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Client
                    </Button>
                </div>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {model.dialog.editingClient ? "Edit Client" : "New Client"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={model.form.submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={model.dialog.editingClient?.name ?? ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="abn">ABN</Label>
                            <Input
                                id="abn"
                                name="abn"
                                defaultValue={model.dialog.editingClient?.abn ?? ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={model.dialog.editingClient?.phone ?? ""}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={model.dialog.editingClient?.email ?? ""}
                                placeholder="Optional"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={model.form.isSubmitting}>
                            {submitLabel}
                        </Button>
                    </form>
                </DialogContent>

                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clients..."
                                value={model.filters.search}
                                onChange={(event) => {
                                    model.filters.updateSearch(event.target.value);
                                }}
                                className="max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {model.list.isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Loading clients...
                            </div>
                        ) : model.list.error ? (
                            <QueryErrorState
                                title="Couldn't load clients"
                                fallbackMessage="Something went wrong while loading the client list."
                                error={model.list.error}
                                onRetry={model.list.retry}
                            />
                        ) : model.list.data?.items.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No clients found
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {model.list.data?.items.map((client) => (
                                    <div
                                        key={client.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-4"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium">{client.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ABN: {client.abn}
                                            </p>
                                            {client.phone ? (
                                                <p className="text-sm text-muted-foreground">
                                                    Phone: {client.phone}
                                                </p>
                                            ) : null}
                                            {client.email ? (
                                                <p className="text-sm text-muted-foreground">
                                                    Email: {client.email}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                aria-label={`Edit client ${client.name}`}
                                                onClick={() => {
                                                    model.dialog.openEdit(client);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                aria-label={`Delete client ${client.name}`}
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this client?")) {
                                                        model.actions.deleteClient(client.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
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
