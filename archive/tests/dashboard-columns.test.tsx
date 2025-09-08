import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

describe('Dashboard columns behavior', () => {
  it('renders placeholder (—) where location or actions are missing', () => {
    render(<Dashboard />);
    // At least one cell should show placeholder
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('truncates the "विवरण" column to 80 chars and exposes full text in title', () => {
    render(<Dashboard />);
    const howCells = screen.getAllByLabelText('विवरण');
    expect(howCells.length).toBeGreaterThan(0);
    const sample = howCells[0] as HTMLElement;
    const text = sample.textContent ?? '';
    expect(text.length).toBeLessThanOrEqual(80);
    const title = sample.getAttribute('title') ?? '';
    expect(title.length).toBeGreaterThanOrEqual(text.length);
  });
});
