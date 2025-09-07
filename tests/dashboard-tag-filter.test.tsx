import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Dashboard tag/mention quick filter', () => {
  it('filters by hashtag (e.g., #समारोह)', () => {
    render(<Dashboard />);
    const table = screen.getByRole('table', { name: 'गतिविधि सारणी' });
    const tbody = within(table).getByTestId('tbody');

    const baseline = within(tbody).getAllByRole('row').length;

    const input = screen.getByLabelText('टैग/मेंशन फ़िल्टर');
    fireEvent.change(input, { target: { value: '#समारोह' } });

    const filtered = within(tbody).getAllByRole('row').length;
    expect(filtered).toBeLessThan(baseline);

    // All remaining rows should include the hashtag in the tag cell
    for (const row of within(tbody).getAllByRole('row')) {
      const tagCell = within(row).getAllByRole('cell')[3];
      expect(tagCell.textContent || '').toMatch(/#समारोह/);
    }
  });

  it('filters by mention (e.g., @PMOIndia)', () => {
    render(<Dashboard />);
    const table = screen.getByRole('table', { name: 'गतिविधि सारणी' });
    const tbody = within(table).getByTestId('tbody');

    const baseline = within(tbody).getAllByRole('row').length;

    const input = screen.getByLabelText('टैग/मेंशन फ़िल्टर');
    fireEvent.change(input, { target: { value: '@PMOIndia' } });

    const filtered = within(tbody).getAllByRole('row').length;
    expect(filtered).toBeLessThan(baseline);

    for (const row of within(tbody).getAllByRole('row')) {
      const tagCell = within(row).getAllByRole('cell')[3];
      expect(tagCell.textContent || '').toMatch(/@PMOIndia/);
    }
  });
});
