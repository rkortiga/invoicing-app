import type { ReactNode } from "react";
import { FileText, LayoutDashboard, Package, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Products", href: "/products", icon: Package },
];

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <h1 className="text-2xl font-bold text-primary">
                                    Invoice Management System
                                </h1>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={cn(
                                                "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "border-primary text-foreground"
                                                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                                            )}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>
    );
}
