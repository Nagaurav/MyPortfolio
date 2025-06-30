// Generate a CSRF token
export function generateCSRFToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store the CSRF token in localStorage
export function storeCSRFToken(token: string): void {
  localStorage.setItem('csrf_token', token);
}

// Get the stored CSRF token
export function getStoredCSRFToken(): string | null {
  return localStorage.getItem('csrf_token');
}