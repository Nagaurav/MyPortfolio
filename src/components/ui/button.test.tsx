import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables itself and swaps content for a spinner while loading', () => {
    render(<Button loading>Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // The label is replaced by the spinner, so it should no longer be readable.
    expect(button).not.toHaveTextContent('Submit');
  });

  it('applies the class set for each variant', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary-100');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('renders as another element when `as` is given', () => {
    render(<Button as="a" href="/somewhere">Link</Button>);

    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/somewhere');
  });
});
