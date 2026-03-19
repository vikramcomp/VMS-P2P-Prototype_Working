import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    test('renders card component', () => {
      render(<Card data-testid="card">Card Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    test('renders card header', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    test('renders card title', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId('title')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    test('renders card description', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>);
      expect(screen.getByTestId('description')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    test('renders card content', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    test('renders card footer', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Card with all parts', () => {
    test('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });
  });
});
