import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('Homepage composition', () => {
  it('renders dashboard table and metrics summary', () => {
    render(<HomePage />);
    expect(screen.getByRole('table', { name: 'गतिविधि सारणी' })).toBeInTheDocument();
  });
});

