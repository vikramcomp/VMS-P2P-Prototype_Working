import React from 'react';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '../main-layout';

// Mock child components
jest.mock('../sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('../header', () => ({
  Header: ({ title, breadcrumbs }: any) => (
    <div data-testid="header">
      Header
      {title && <span data-testid="header-title">{title}</span>}
      {breadcrumbs && <span data-testid="header-breadcrumbs">Breadcrumbs</span>}
    </div>
  ),
}));

describe('MainLayout Component', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <MainLayout>
          <div>Test Children Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Test Children Content')).toBeInTheDocument();
    });

    it('should render sidebar component', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render header component', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should pass title prop to Header', () => {
      render(
        <MainLayout title="Test Page Title">
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header-title')).toHaveTextContent('Test Page Title');
    });

    it('should pass breadcrumbs prop to Header', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/home' },
        { label: 'Page', href: '/page' },
      ];
      
      render(
        <MainLayout breadcrumbs={breadcrumbs}>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header-breadcrumbs')).toBeInTheDocument();
    });

    it('should pass both title and breadcrumbs to Header', () => {
      const breadcrumbs = [{ label: 'Home', href: '/home' }];
      
      render(
        <MainLayout title="Test Title" breadcrumbs={breadcrumbs}>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header-title')).toHaveTextContent('Test Title');
      expect(screen.getByTestId('header-breadcrumbs')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have correct flex layout structure', () => {
      const { container } = render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('flex', 'h-screen', 'bg-background');
    });

    it('should render main content area', () => {
      render(
        <MainLayout>
          <div>Main Content</div>
        </MainLayout>
      );
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-1', 'overflow-auto');
    });

    it('should render container with padding', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const main = screen.getByRole('main');
      const container = main.querySelector('.container');
      expect(container).toHaveClass('mx-auto', 'p-6');
    });
  });

  describe('Children Rendering', () => {
    it('should render single child', () => {
      render(
        <MainLayout>
          <div>Single Child</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Single Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <MainLayout>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should render complex nested children', () => {
      render(
        <MainLayout>
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        </MainLayout>
      );
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /button/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined title', () => {
      render(
        <MainLayout title={undefined}>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
    });

    it('should handle undefined breadcrumbs', () => {
      render(
        <MainLayout breadcrumbs={undefined}>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.queryByTestId('header-breadcrumbs')).not.toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(
        <MainLayout>
          {null}
        </MainLayout>
      );
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});
