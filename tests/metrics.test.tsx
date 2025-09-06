import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Metrics from '@/components/Metrics';

describe('Metrics summary', () => {
  it('shows top locations and actions with counts in Hindi', () => {
    render(<Metrics />);

    // Section headings
    expect(screen.getByRole('heading', { name: 'स्थान सारांश' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'गतिविधि सारांश' })).toBeInTheDocument();

    // Known frequency expectations from dataset
    expect(screen.getByText('दिल्ली — 10 बार')).toBeInTheDocument();
    expect(screen.getByText('रायगढ़ — 8 बार')).toBeInTheDocument();

    // Actions: at least known ones
    expect(screen.getByText(/भूमिपूजन — \d+ बार/)).toBeInTheDocument();
    expect(screen.getByText(/सम्मिलित — \d+ बार/)).toBeInTheDocument();
  });
});

