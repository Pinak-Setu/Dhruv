import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Canonical badges (flagged)', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('renders canonical badges when NEXT_PUBLIC_FLAG_CANONICAL=on', () => {
    process.env.NEXT_PUBLIC_FLAG_CANONICAL = 'on';
    render(<Dashboard />);
    // Find a row containing #समारोह and expect a canonical badge element present
    const table = screen.getByRole('table', { name: 'गतिविधि सारणी' });
    const tbody = within(table).getByTestId('tbody');
    const rows = within(tbody).getAllByRole('row');
    let found = false;
    for (const row of rows) {
      const cells = within(row).getAllByRole('cell');
      const tagCell = cells[3];
      if ((tagCell.textContent || '').includes('#समारोह')) {
        // badge should be present
        const badge = within(tagCell).queryAllByTestId('canonical-badge');
        if (badge.length > 0) {
          found = true;
          break;
        }
      }
    }
    expect(found).toBe(true);
  });
});

