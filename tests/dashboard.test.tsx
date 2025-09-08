import '@testing-library/jest-dom';
import { render, screen, within, waitFor } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Dashboard', () => {
  it('renders a Hindi table with headers and data', async () => {
    render(<Dashboard />);
    
    // Wait for the table to appear
    const table = await screen.findByRole('table', { name: 'गतिविधि सारणी' });
    expect(table).toBeInTheDocument();

    // Check headers
    expect(screen.getByRole('columnheader', { name: 'दिन / दिनांक' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'स्थान' })).toBeInTheDocument();

    const tbody = within(table).getByTestId('tbody');
    
    // Wait for data rows to be populated
    await waitFor(() => {
      const dataRows = within(tbody).getAllByRole('row');
      expect(dataRows.length).toBeGreaterThan(0);
    });
  });
});
