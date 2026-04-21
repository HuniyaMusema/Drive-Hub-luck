export const API_BASE = import.meta.env.VITE_API_BASE || 'https://drive-hub-luck-production.up.railway.app/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('token');
  
  const headers: Record<string, string> = { ...options.headers } as Record<string, string>;
  
  // Only set application/json if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    window.location.href = "/auth/login?expired=true";
    throw new Error("Session expired or invalid. Please log in again.");
  }

  if (response.status === 503) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Platform is currently under maintenance. Please try again later.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API Error');
  }

  return response.json();
};
