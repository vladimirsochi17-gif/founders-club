export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

type Envelope<T> = { data: T; meta?: Record<string, unknown> };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.message || "Не удалось выполнить запрос.",
      payload?.error?.code || "request_error",
      payload?.error?.fields,
    );
  }
  return (payload as Envelope<T>).data;
}

const json = (value: unknown) => JSON.stringify(value);

export const api = {
  submitRequest: (kind: string, fields: Record<string,string>, requestKey: string) => request<any>('/requests', {method:'POST',body:json({kind,fields,requestKey})}),
  requests: (admin = false) => request<any[]>(admin ? '/requests/admin' : '/requests'),
  updateRequest: (id: string, status: string, response: string) => request<any>(`/requests/${id}`,{method:'PATCH',body:json({status,response})}),
  publicProject: (slug: string) => request<any>(`/public/projects/${slug}`),
  publicProjects: async () => {
    const rows: any[] = [];
    for (let cursor = 0; ; cursor += 48) {
      const page = await request<any[]>(`/public/projects?limit=48&cursor=${cursor}`);
      rows.push(...page);
      if (page.length < 48) return rows;
    }
  },
  myProjects: () => request<any[]>("/projects"),
  deleteDraft: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  profile: (handle: string) => request<any>(`/public/profiles/${encodeURIComponent(handle)}`),
  billingHistory: () => request<any[]>("/billing/history"),
  moderation: () => request<any[]>("/admin/moderation"),
  audit: () => request<any[]>("/admin/audit"),
  moderate: (id: string, decision: string, reason: string, version: number) =>
    request<any>(`/admin/moderation/${id}/decision`, { method: "POST", body: json({ decision, reason, version }) }),
  session: () => request<any>("/auth/session"),
  requestCode: (input: {
    email: string;
    purpose: "login" | "signup" | "recover" | "reauth";
    name?: string;
    termsAccepted?: boolean;
  }) =>
    request<{ sent: boolean; expiresInSeconds: number; devCode?: string }>(
      "/auth/request-code",
      { method: "POST", body: json(input) },
    ),
  verifyCode: (input: {
    email: string;
    code: string;
    purpose: "login" | "signup" | "recover" | "reauth";
  }) =>
    request<{ authenticated: boolean }>("/auth/verify", {
      method: "POST",
      body: json(input),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  patchState: (state: Record<string, unknown>) =>
    request<Record<string, unknown>>("/state", {
      method: "PATCH",
      body: json(state),
    }),
  updateProfile: (profile: { name: string; handle: string; bio: string }) =>
    request<{ name: string; handle: string; bio: string }>("/state/profile", {
      method: "PATCH",
      body: json(profile),
    }),
  saveDraft: (draft: Record<string, unknown>) =>
    request<any>("/projects/draft", { method: "PUT", body: json(draft) }),
  submitProject: (publicId: string) =>
    request<any>(`/projects/${publicId}/submit`, { method: "POST" }),
  uploadProjectMedia: (publicId: string, files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    return request<any[]>(`/projects/${publicId}/media`, { method: "POST", body });
  },
  deleteProjectMedia: (publicId: string, mediaId: string) =>
    request<void>(`/projects/${publicId}/media/${mediaId}`, { method: "DELETE" }),
  reorderProjectMedia: (publicId: string, mediaIds: string[]) =>
    request<any[]>(`/projects/${publicId}/media-order`, {
      method: "PUT",
      body: json({ mediaIds }),
    }),
  voteProject: (projectKey: string) =>
    request<{ voted: boolean }>(`/projects/${projectKey}/vote`, { method: "POST" }),
  reviewProject: (projectKey: string, body: string) =>
    request<any>(`/projects/${projectKey}/reviews`, {
      method: "POST",
      body: json({ body }),
    }),
  reportProject: (projectKey: string, reason: string, details: string) =>
    request<any>(`/projects/${projectKey}/reports`, {
      method: "POST",
      body: json({ reason, details }),
    }),
  checkout: (plan: "founder" | "plus", idempotencyKey: string) =>
    request<any>("/billing/checkout", {
      method: "POST",
      body: json({
        plan,
        termsVersion: "2026-10-22",
        recurringConsent: true,
        idempotencyKey,
      }),
    }),
  confirmMockPayment: (paymentId: string) =>
    request<any>(`/billing/mock-confirm/${paymentId}`, { method: "POST" }),
  cancelSubscription: () =>
    request<any>("/billing/subscription/cancel", { method: "POST" }),
  downloadResource: (slug: string) =>
    request<any>(`/resources/${slug}/download`, { method: "POST" }),
};
