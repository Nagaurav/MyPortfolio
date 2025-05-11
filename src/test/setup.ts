import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  }),
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// MSW Server Setup
export const server = setupServer(
  http.get('*/api/*', () => {
    return HttpResponse.json({ message: 'mocked response' });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});