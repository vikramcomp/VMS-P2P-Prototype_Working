import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '../input';

describe('Input', () => {
  test('renders input component', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  test('accepts placeholder prop', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('accepts type prop', () => {
    render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
  });

  test('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('custom-class');
  });

  test('can be disabled', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  test('accepts value prop', () => {
    render(<Input value="test value" onChange={() => {}} data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveValue('test value');
  });
});
