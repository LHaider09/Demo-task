export type Person = {
  id: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string | null;
  createdAt: string;
};

export type TreeNode = Person & {
  children: TreeNode[];
};

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = { data: T };
export type ApiListResponse<T> = { data: T[] };
