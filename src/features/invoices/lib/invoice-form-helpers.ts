import type { Product } from "../../products/api/product-types";
import type { InvoiceCreateInput, InvoiceDetail } from "../api/invoice-types";

export type CreateInvoiceLineDraft = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export type InvoiceLineEditorDraft = {
    quantity: string;
    unitPrice: string;
    lineNumber: string;
};

export type InvoiceAddLineDraft = {
    productId: string;
    quantity: string;
    unitPrice: string;
    lineNumber: string;
};

export const DEFAULT_CREATE_INVOICE_LINE_DRAFT: CreateInvoiceLineDraft = {
    productId: "",
    quantity: 1,
    unitPrice: 0,
};

export const DEFAULT_INVOICE_ADD_LINE_DRAFT: InvoiceAddLineDraft = {
    productId: "",
    quantity: "1",
    unitPrice: "",
    lineNumber: "",
};

export function formatDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function toDateInputValue(raw: string | null | undefined): string {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return trimmed;
    return formatDateInputValue(parsed);
}

export const sanitizeNonNegativeNumber = (raw: string): number => {
    const trimmed = raw.trim();
    if (!trimmed) return 0;

    const value = Number(trimmed);
    if (!Number.isFinite(value)) return 0;

    return Math.max(0, value);
};

export const calculateLineTotal = (quantity: string | number, unitPrice: string | number) => {
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    const safeQuantity = Number.isFinite(parsedQuantity) ? parsedQuantity : 0;
    const safeUnitPrice = Number.isFinite(parsedUnitPrice) ? parsedUnitPrice : 0;

    return safeQuantity * safeUnitPrice;
};

export const calculateDraftInvoiceTotal = (lines: CreateInvoiceLineDraft[]) =>
    lines.reduce((sum, line) => sum + calculateLineTotal(line.quantity, line.unitPrice), 0);

export const buildLineEditorDrafts = (
    lines: InvoiceDetail["lines"],
): Record<number, InvoiceLineEditorDraft> =>
    Object.fromEntries(
        lines.map((line) => [
            line.id,
            {
                quantity: line.quantity.toString(),
                unitPrice: line.unitPrice.toString(),
                lineNumber: line.lineNumber?.toString() ?? "",
            } satisfies InvoiceLineEditorDraft,
        ]),
    );

type ParsedInvoiceLine = {
    quantity: number;
    unitPrice: number;
    lineNumber?: number;
};

type ParsedInvoiceProductLine = ParsedInvoiceLine & {
    productId: number;
};

function parseOptionalLineNumber(value: string | number | undefined): number | null | undefined {
    if (value === undefined) return undefined;

    const trimmed = String(value).trim();
    if (!trimmed) return undefined;

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;

    return parsed;
}

export function validateInvoiceLineValues(input: {
    quantity: string | number;
    unitPrice: string | number;
    lineNumber?: string | number;
}): { data?: ParsedInvoiceLine; error?: string } {
    const quantity = Number(input.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
        return { error: "Quantity must be greater than zero." };
    }

    const unitPrice = Number(input.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return { error: "Unit price cannot be negative." };
    }

    const lineNumber = parseOptionalLineNumber(input.lineNumber);
    if (lineNumber === null) {
        return { error: "Line number must be a positive number." };
    }

    return {
        data: {
            quantity,
            unitPrice,
            lineNumber,
        },
    };
}

export function validateInvoiceProductLineValues(input: {
    productId: string | number;
    quantity: string | number;
    unitPrice: string | number;
    lineNumber?: string | number;
}): { data?: ParsedInvoiceProductLine; error?: string } {
    const productId = Number(input.productId);
    if (!Number.isFinite(productId)) {
        return { error: "Please select a product." };
    }

    const lineValidation = validateInvoiceLineValues(input);
    if (lineValidation.error) {
        return { error: lineValidation.error };
    }
    if (!lineValidation.data) {
        return { error: "Invalid line item" };
    }

    return {
        data: {
            productId,
            ...lineValidation.data,
        },
    };
}

export function buildCreateInvoiceLines(
    lines: CreateInvoiceLineDraft[],
): InvoiceCreateInput["lines"] {
    return lines
        .filter((line) => Boolean(line.productId))
        .map(
            (line, index) =>
                validateInvoiceProductLineValues({
                    productId: line.productId,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    lineNumber: index + 1,
                }).data,
        )
        .filter((line): line is NonNullable<typeof line> => Boolean(line));
}

export const applyProductToCreateLineDraft = (
    draft: CreateInvoiceLineDraft,
    product: Product,
): CreateInvoiceLineDraft => ({
    ...draft,
    productId: String(product.id),
    unitPrice: product.price,
    quantity: Number.isFinite(draft.quantity) && draft.quantity > 0 ? draft.quantity : 1,
});
