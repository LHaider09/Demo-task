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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const body = await res.json();

  if (!res.ok) {
    // backend returns { error: { code, message, details } }
    const msg = body?.error?.message || "Request failed";
    const code = body?.error?.code || "ERROR";
    throw new Error(`${code}: ${msg}`);
  }

  return body as T;
}

export function getPeople() {
  return request<{ data: Person[] }>("/api/people");
}

export function createPerson(input: { name: string; dateOfBirth: string; placeOfBirth?: string }) {
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
