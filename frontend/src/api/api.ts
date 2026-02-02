import type { ApiErrorPayload, ApiListResponse, ApiResponse, Person, TreeNode } from "./type";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");


export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const payload = json as ApiErrorPayload | null;
    const code = payload?.error?.code ?? "UNKNOWN_ERROR";
    const message = payload?.error?.message ?? `Request failed (${res.status})`;
    const details = payload?.error?.details;
    throw new ApiError(code, message, details);
  }

  return json as T;
}

export function getPeople() {
  return http<ApiListResponse<Person>>("/api/people");
}

export function createPerson(body: { name: string; dateOfBirth: string; placeOfBirth?: string }) {
  return http<ApiResponse<Person>>("/api/people", { method: "POST", body: JSON.stringify(body) });
}

export function createRelationship(body: { parentId: string; childId: string }) {
  return http<ApiResponse<{ id: string }>>("/api/relationships", { method: "POST", body: JSON.stringify(body) });
}

export function getTree(rootId: string) {
  return http<ApiResponse<TreeNode>>(`/api/tree/${rootId}`);
}
