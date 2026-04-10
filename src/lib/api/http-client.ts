const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL. Set it in your frontend environment.");
}

const API_BASE_URL = apiBaseUrl;

export type ProblemDetails = {
    type?: string | null;
    title?: string | null;
    status?: number;
    detail?: string | null;
    instance?: string | null;
};

export class ApiError extends Error {
    status: number;
    problem?: ProblemDetails;

    constructor(message: string, status: number, problem?: ProblemDetails) {
        super(message);
        this.status = status;
        this.problem = problem;
    }
}

export function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toCamelCaseKey(key: string): string {
    if (!key) return key;
    return key.charAt(0).toLowerCase() + key.slice(1);
}

function camelize<T>(input: unknown): T {
    if (Array.isArray(input)) {
        return input.map((item) => camelize(item)) as unknown as T;
    }

    if (!isObject(input)) {
        return input as T;
    }

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
        out[toCamelCaseKey(key)] = camelize(value);
    }

    return out as T;
}

function toPascalCaseKey(key: string): string {
    if (!key) return key;
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function pascalize(input: unknown): unknown {
    if (Array.isArray(input)) {
        return input.map((item) => pascalize(item));
    }

    if (!isObject(input)) {
        return input;
    }

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
        out[toPascalCaseKey(key)] = pascalize(value);
    }

    return out;
}

async function parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
        return undefined;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    const raw = await parseResponseBody(response);
    if (response.ok) {
        if (raw === undefined) {
            return undefined as T;
        }

        return camelize<T>(raw);
    }

    let problem: ProblemDetails | undefined;
    if (raw && isObject(raw)) {
        problem = raw as ProblemDetails;
    }

    const message =
        problem?.detail ?? problem?.title ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, problem);
}

export function buildQuery(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        searchParams.append(key, String(value));
    }

    const query = searchParams.toString();
    return query ? `?${query}` : "";
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

export async function apiRequest<T>(
    path: string,
    { body, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
    const requestHeaders = new Headers(headers);

    if (body !== undefined && !requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(pascalize(body)),
    });

    return handleResponse<T>(response);
}
