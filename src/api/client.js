// API Client with automatic JWT Bearer authentication and tenant error handling

const API_BASE = ""; // Relative path works directly through Vite proxy or production reverse proxy

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("revguard_token");
  
  const headers = {
    ...(options.headers || {}),
  };

  // Only set Content-Type to JSON if not uploading FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Handle Unauthorized (expired token)
  if (response.status === 401 && !endpoint.includes("/api/auth/login")) {
    localStorage.removeItem("revguard_token");
    localStorage.removeItem("revguard_user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  // Handle Forbidden (cross-tenant violation)
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || "Access Forbidden: Strict Tenant Isolation Policy Active.";
    throw new Error(message);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) => request(endpoint, { 
    method: "POST", 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  upload: (endpoint, formData) => request(endpoint, {
    method: "POST",
    body: formData
  })
};

export default api;
