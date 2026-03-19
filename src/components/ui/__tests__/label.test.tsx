import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from '../label';

describe('Label', () => {
  test('renders label component', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Label className="custom-class" data-testid="label">Label</Label>);
    expect(screen.getByTestId('label')).toHaveClass('custom-class');
  });

  test('accepts htmlFor prop', () => {
    render(<Label htmlFor="input-id">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  test('renders children correctly', () => {
    render(
      <Label>
        <span>Complex Label</span>
      </Label>
    );
    expect(screen.getByText('Complex Label')).toBeInTheDocument();
  });
});
