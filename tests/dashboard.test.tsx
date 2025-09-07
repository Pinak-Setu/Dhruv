import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Dashboard', () => {
  it('renders a Hindi table with headers and 48 rows', () => {
    render(<Dashboard />);

    const table = screen.getByRole('table', { name: 'गतिविधि सारणी' });
    const headers = within(table).getAllByRole('columnheader').map((th) => th.textContent);

    expect(headers).toEqual(['दिन / दिनांक', 'स्थान', 'दौरा / कार्यक्रम', 'कौन/टैग', 'विवरण']);

    const body = within(table).getAllByRole('row');
    // First row is header; count tbody rows by selecting rows inside tbody
    const tbody = within(table).getByTestId('tbody');
    const dataRows = within(tbody).getAllByRole('row');
    expect(dataRows.length).toBe(48);

    // Spot check: should include at least one known location and hashtag
    const anyRaigarh = screen.getAllByText(/रायगढ़/).length > 0;
    const anyHashtag = screen.getAllByText(/#/).length > 0;
    expect(anyRaigarh).toBe(true);
    expect(anyHashtag).toBe(true);
  });
});
