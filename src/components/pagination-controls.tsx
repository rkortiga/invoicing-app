import { Button } from "./ui/button";

type PaginationControlsProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center space-x-2 mt-6">
            <Button
                variant="outline"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
            >
                Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                Next
            </Button>
        </div>
    );
}
