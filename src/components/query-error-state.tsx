import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { getErrorMessage } from "../lib/api";

type QueryErrorStateProps = {
    title: string;
    fallbackMessage: string;
    error?: unknown;
    onRetry?: () => void | Promise<unknown>;
    retryLabel?: string;
    className?: string;
};

export function QueryErrorState({
    title,
    fallbackMessage,
    error,
    onRetry,
    retryLabel = "Retry",
    className,
}: QueryErrorStateProps) {
    return (
        <Alert variant="destructive" className={cn(className)}>
            <AlertCircle className="h-4 w-4" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>{getErrorMessage(error, fallbackMessage)}</AlertDescription>
                </div>
                {onRetry ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full shrink-0 sm:w-auto"
                        onClick={() => {
                            void onRetry();
                        }}
                    >
                        {retryLabel}
                    </Button>
                ) : null}
            </div>
        </Alert>
    );
}
