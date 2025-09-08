import '@testing-library/jest-dom';
import { render, screen, within, fireEvent } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Dashboard date range filter', () => {
  it('filters rows by inclusive date range', () => {
    render(<Dashboard />);
    const table = screen.getByRole('table', { name: 'गतिविधि सारणी' });
    const tbody = within(table).getByTestId('tbody');
    const before = within(tbody).getAllByRole('row').length;

    const from = screen.getByLabelText('तिथि से');
    const to = screen.getByLabelText('तिथि तक');

    fireEvent.change(from, { target: { value: '2025-09-05' } });
    fireEvent.change(to, { target: { value: '2025-09-05' } });

    const after = within(tbody).getAllByRole('row').length;
    expect(after).toBeLessThan(before);

    // All remaining rows should be for 05 सितंबर 2025 (prefix may include day name)
    const rows = within(tbody).getAllByRole('row');
    for (const row of rows) {
      const cells = within(row).getAllByRole('cell');
      expect(cells[0].textContent || '').toMatch(/05 सितंबर 2025/);
    }
  });
});
