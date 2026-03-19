import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  test('renders textarea component', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  test('accepts placeholder prop', () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('custom-class');
  });

  test('can be disabled', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  test('accepts value prop', () => {
    render(<Textarea value="test content" onChange={() => {}} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveValue('test content');
  });

  test('accepts rows prop', () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
  });
});
