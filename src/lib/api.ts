const jsonHeaders = { "Content-Type": "application/json" };

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return (j as { error?: string }).error || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiSend<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { ...jsonHeaders, ...init.headers },
  });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function loginRequest(username: string, password: string) {
  return apiSend<{ user: { id: number; username: string; role: string } }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutRequest() {
  return apiSend("/api/auth/logout", { method: "POST" });
}
