import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const SKILLS = [
  { id: '1', name: 'React.js', category: 'Frontend Development', proficiency: 5, user_id: 'u1', created_at: null, updated_at: null },
  { id: '2', name: 'Next.js', category: 'Frontend Development', proficiency: 4, user_id: 'u1', created_at: null, updated_at: null },
  { id: '3', name: 'PostgreSQL', category: 'Databases', proficiency: 4, user_id: 'u1', created_at: null, updated_at: null },
  { id: '4', name: 'Postman', category: 'Development Tools', proficiency: 3, user_id: 'u1', created_at: null, updated_at: null },
];

// fetchSkills chains .select().order().order(); only the final link is awaited.
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          order: () => Promise.resolve({ data: SKILLS, error: null }),
        }),
      }),
    }),
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { AdminSkillsPage } from './skills';

/** Skill names render as level-4 headings; category chips and <option>s do not. */
const listedSkills = () =>
  screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);

describe('AdminSkillsPage filtering', () => {
  beforeEach(async () => {
    render(<AdminSkillsPage />);
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(4));
  });

  it('lists every skill before any filter is applied', () => {
    expect(listedSkills()).toEqual(['React.js', 'Next.js', 'PostgreSQL', 'Postman']);
  });

  it('narrows the list by search term', async () => {
    await userEvent.type(screen.getByPlaceholderText(/search by skill/i), 'post');

    // Matches "PostgreSQL" and "Postman", not the React entries.
    await waitFor(() => expect(listedSkills()).toEqual(['PostgreSQL', 'Postman']));
  });

  it('searches category names as well as skill names', async () => {
    await userEvent.type(screen.getByPlaceholderText(/search by skill/i), 'frontend');

    await waitFor(() => expect(listedSkills()).toEqual(['React.js', 'Next.js']));
  });

  it('filters to a single category when its chip is clicked', async () => {
    await userEvent.click(screen.getByRole('button', { name: /Databases 1/ }));

    await waitFor(() => expect(listedSkills()).toEqual(['PostgreSQL']));
  });

  it('clears the category filter when the active chip is clicked again', async () => {
    const chip = screen.getByRole('button', { name: /Databases 1/ });

    await userEvent.click(chip);
    await waitFor(() => expect(listedSkills()).toHaveLength(1));

    await userEvent.click(chip);
    await waitFor(() => expect(listedSkills()).toHaveLength(4));
  });

  it('combines the search term with the category filter', async () => {
    await userEvent.click(screen.getByRole('button', { name: /Frontend Development 2/ }));
    await userEvent.type(screen.getByPlaceholderText(/search by skill/i), 'next');

    await waitFor(() => expect(listedSkills()).toEqual(['Next.js']));
  });

  it('offers a way out when filters match nothing', async () => {
    await userEvent.type(screen.getByPlaceholderText(/search by skill/i), 'kubernetes');

    await waitFor(() => expect(screen.queryAllByRole('heading', { level: 4 })).toHaveLength(0));
    expect(screen.getByText(/no skills match/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    await waitFor(() => expect(listedSkills()).toHaveLength(4));
  });

  it('shows a filtered count against the total', async () => {
    expect(screen.getByText('4 skills')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Databases 1/ }));
    await waitFor(() => expect(screen.getByText('1 of 4')).toBeInTheDocument());
  });
});
