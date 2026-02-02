import { API_BASE_URL } from "./config";

export type Person = {
  id: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string | null;
};

export type Relationship = {
  id: string;
  parentId: string;
  childId: string;
  createdAt: string;
};

export type TreeNode = {
  id: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string | null;
  children: TreeNode[];
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
  details?: unknown;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: ApiError = {
      code: body?.error?.code ?? "ERROR",
      message: body?.error?.message ?? "Request failed",
      status: res.status,
      details: body?.error?.details,
    };
    throw err;
  }

  return body as T;
}

export function getPeople() {
  return request<{ data: Person[] }>("/api/people");
}

export function createPerson(input: {
  name: string;
  dateOfBirth: string;
  placeOfBirth?: string;
}) {
  return request<{ data: Person }>("/api/people", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createRelationship(input: { parentId: string; childId: string }) {
  return request<{ data: Relationship }>("/api/relationships", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTree(rootId: string) {
  return request<{ data: TreeNode }>(`/api/tree/${rootId}`);
}
