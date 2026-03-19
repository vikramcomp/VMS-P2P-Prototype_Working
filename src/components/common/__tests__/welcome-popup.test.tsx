import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomePopup } from '../welcome-popup';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('WelcomePopup', () => {
  let onCloseMock: jest.Mock;

  beforeEach(() => {
    onCloseMock = jest.fn();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render the popup', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      expect(screen.getByTestId('welcome-popup')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      expect(screen.getByTestId('welcome-popup')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render X icon', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should render the diagram image', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const image = screen.getByAltText('Request Approval Flow Diagram');
      expect(image).toBeInTheDocument();
    });

    it('should render image with correct src', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const image = screen.getByAltText('Request Approval Flow Diagram');
      expect(image).toHaveAttribute('src', '/images/illustrations/RequestApprovalFlowDiagram.jpg');
    });

    it('should render Continue button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      expect(screen.getByText('Continue to Dashboard')).toBeInTheDocument();
    });

    it('should render arrow icon in Continue button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const button = screen.getByText('Continue to Dashboard').closest('button');
      expect(button?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render tooltip on close button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should start with opacity-0 class', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const popup = screen.getByTestId('welcome-popup');
      expect(popup).toHaveClass('opacity-0');
    });

    it('should start with animation classes', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const popup = screen.getByTestId('welcome-popup');
      expect(popup).toHaveClass('transition-opacity', 'duration-300');
    });
  });

  describe('Animation', () => {
    it('should have transition classes', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const popup = screen.getByTestId('welcome-popup');
      expect(popup).toHaveClass('transition-opacity', 'duration-300');
    });
  });

  describe('Close Button Interaction', () => {
    it('should call handleClose when close button is clicked', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      
      jest.advanceTimersByTime(300);
      expect(onCloseMock).toHaveBeenCalled();
    });

    it('should call onClose after fade out animation', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      
      expect(onCloseMock).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(300);
      
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Continue Button Interaction', () => {
    it('should call handleClose when Continue button is clicked', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const continueButton = screen.getByText('Continue to Dashboard').closest('button');
      
      fireEvent.click(continueButton!);
      
      jest.advanceTimersByTime(300);
      expect(onCloseMock).toHaveBeenCalled();
    });

  });

  describe('Backdrop Interaction', () => {
    it('should call handleClose when backdrop is clicked', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const backdrop = screen.getByTestId('welcome-popup');
      
      fireEvent.click(backdrop);
      
      jest.advanceTimersByTime(300);
      expect(onCloseMock).toHaveBeenCalled();
    });

    it('should not close when clicking inside content area', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const contentDiv = screen.getByTestId('welcome-popup').querySelector('.bg-white');
      
      fireEvent.click(contentDiv!);
      
      jest.advanceTimersByTime(300);
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have fixed positioning', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const popup = screen.getByTestId('welcome-popup');
      expect(popup).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should have flex layout for centering', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const popup = screen.getByTestId('welcome-popup');
      expect(popup).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have backdrop styling', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const popup = screen.getByTestId('welcome-popup');
      expect(popup).toHaveClass('bg-black/60');
    });

    it('should have white background on content', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const contentDiv = screen.getByTestId('welcome-popup').querySelector('.bg-white');
      expect(contentDiv).toHaveClass('rounded-lg', 'shadow-2xl');
    });

    it('should have gradient background on Continue button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const continueButton = screen.getByText('Continue to Dashboard').closest('button');
      expect(continueButton).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-blue-700');
    });

    it('should have animation class on arrow icon', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const continueButton = screen.getByText('Continue to Dashboard').closest('button');
      const arrow = continueButton?.querySelector('.animate-arrow-slide');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe('Image Properties', () => {
    it('should render image with correct dimensions', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const image = screen.getByAltText('Request Approval Flow Diagram');
      expect(image).toHaveAttribute('width', '1200');
      expect(image).toHaveAttribute('height', '800');
    });

    it('should have rounded corners on image', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const image = screen.getByAltText('Request Approval Flow Diagram');
      expect(image).toHaveClass('rounded-lg');
    });
  });

  describe('Close Button Styling', () => {
    it('should have absolute positioning', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('absolute', 'top-4', 'right-4');
    });

    it('should have rounded-full class', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('rounded-full', 'bg-white', 'shadow-md');
    });

    it('should have hover classes', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('hover:bg-gray-100', 'transition-colors');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on close button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });

    it('should have descriptive alt text on image', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const image = screen.getByAltText('Request Approval Flow Diagram');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have padding on image container', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const imageContainer = screen.getByTestId('welcome-popup').querySelector('.p-6');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should center the Continue button', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const buttonContainer = screen.getByText('Continue to Dashboard').closest('button')?.parentElement;
      expect(buttonContainer).toHaveClass('flex', 'justify-center');
    });
  });

  describe('Responsive Design', () => {
    it('should have max-width constraint', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const contentDiv = screen.getByTestId('welcome-popup').querySelector('.max-w-4xl');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have full width on mobile', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const contentDiv = screen.getByTestId('welcome-popup').querySelector('.w-full');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have responsive margin', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const contentDiv = screen.getByTestId('welcome-popup').querySelector('.mx-4');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Animation Timing', () => {
    it('should not call onClose immediately', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      
      expect(onCloseMock).not.toHaveBeenCalled();
    });

    it('should wait 300ms before calling onClose', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      
      jest.advanceTimersByTime(299);
      expect(onCloseMock).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1);
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('SVG Arrow Icon', () => {
    it('should render SVG with correct viewBox', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const continueButton = screen.getByText('Continue to Dashboard').closest('button');
      const svg = continueButton?.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('should render SVG with no fill', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const continueButton = screen.getByText('Continue to Dashboard').closest('button');
      const svg = continueButton?.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should render SVG path', () => {
      render(<WelcomePopup onClose={onCloseMock} />);
      const continueButton = screen.getByText('Continue to Dashboard').closest('button');
      const path = continueButton?.querySelector('path');
      expect(path).toBeInTheDocument();
    });

  });
});
