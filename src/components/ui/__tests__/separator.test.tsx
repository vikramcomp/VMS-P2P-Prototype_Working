import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Separator } from '../separator';

describe('Separator', () => {
  test('renders separator component', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Separator className="custom-class" data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveClass('custom-class');
  });

  test('renders with default horizontal orientation', () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild;
    expect(separator).toBeInTheDocument();
  });

  test('accepts orientation prop', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });
});
