import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Dashboard composition', () => {
  it('renders dashboard table', () => {
    render(<Dashboard />);
    expect(screen.getByRole('table', { name: 'गतिविधि सारणी' })).toBeInTheDocument();
  });
});

