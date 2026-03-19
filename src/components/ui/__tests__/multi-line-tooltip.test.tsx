import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiLineTooltip } from '../multi-line-tooltip';

describe('MultiLineTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders trigger element', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    test('renders with string content', () => {
      const { container } = render(
        <MultiLineTooltip content="Single line tooltip">
          <span>Trigger</span>
        </MultiLineTooltip>
      );
      expect(container).toBeInTheDocument();
    });

    test('renders children correctly', () => {
      render(
        <MultiLineTooltip content="Tooltip">
          <div data-testid="child">Child Element</div>
        </MultiLineTooltip>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Element')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const { container } = render(
        <MultiLineTooltip content="Tooltip" className="custom-class">
          <span>Trigger</span>
        </MultiLineTooltip>
      );
      const triggerDiv = container.querySelector('.custom-class');
      expect(triggerDiv).toBeInTheDocument();
    });

    test('applies default maxWidth', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toHaveStyle({ maxWidth: '300px' });
    });

    test('applies custom maxWidth', () => {
      render(
        <MultiLineTooltip content="Tooltip text" maxWidth="500px">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toHaveStyle({ maxWidth: '500px' });
    });
  });

  describe('Tooltip Visibility', () => {
    test('does not show tooltip initially', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });

    test('shows tooltip on mouse enter', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    test('hides tooltip on mouse leave', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      
      fireEvent.mouseLeave(trigger);
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip Positioning', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect for positioning tests
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: 100,
        right: 150,
        bottom: 130,
        width: 50,
        height: 30,
        x: 100,
        y: 100,
        toJSON: () => {}
      }));

      // Mock window properties
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
      Object.defineProperty(window, 'pageYOffset', { writable: true, value: 0 });
      Object.defineProperty(window, 'pageXOffset', { writable: true, value: 0 });
    });

    test('positions tooltip at top by default', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('positions tooltip at bottom when specified', () => {
      render(
        <MultiLineTooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('positions tooltip at left when specified', () => {
      render(
        <MultiLineTooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('positions tooltip at right when specified', () => {
      render(
        <MultiLineTooltip content="Tooltip text" position="right">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('prevents tooltip from going off-screen horizontally (left edge)', () => {
      Element.prototype.getBoundingClientRect = jest.fn(function(this: Element) {
        if (this.textContent === 'Tooltip text') {
          return {
            top: 100,
            left: 100,
            right: 350,
            bottom: 130,
            width: 250,
            height: 30,
            x: 100,
            y: 100,
            toJSON: () => {}
          };
        }
        return {
          top: 100,
          left: -100,
          right: -90,
          bottom: 130,
          width: 10,
          height: 30,
          x: -100,
          y: 100,
          toJSON: () => {}
        };
      });

      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('prevents tooltip from going off-screen horizontally (right edge)', () => {
      Element.prototype.getBoundingClientRect = jest.fn(function(this: Element) {
        if (this.textContent === 'Tooltip text') {
          return {
            top: 100,
            left: 100,
            right: 350,
            bottom: 130,
            width: 250,
            height: 30,
            x: 100,
            y: 100,
            toJSON: () => {}
          };
        }
        return {
          top: 100,
          left: 1000,
          right: 1010,
          bottom: 130,
          width: 10,
          height: 30,
          x: 1000,
          y: 100,
          toJSON: () => {}
        };
      });

      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('prevents tooltip from going off-screen vertically (top edge)', () => {
      Element.prototype.getBoundingClientRect = jest.fn(function(this: Element) {
        if (this.textContent === 'Tooltip text') {
          return {
            top: 0,
            left: 100,
            right: 350,
            bottom: 30,
            width: 250,
            height: 30,
            x: 100,
            y: 0,
            toJSON: () => {}
          };
        }
        return {
          top: 10,
          left: 100,
          right: 150,
          bottom: 40,
          width: 50,
          height: 30,
          x: 100,
          y: 10,
          toJSON: () => {}
        };
      });

      render(
        <MultiLineTooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });

    test('prevents tooltip from going off-screen vertically (bottom edge)', () => {
      Element.prototype.getBoundingClientRect = jest.fn(function(this: Element) {
        if (this.textContent === 'Tooltip text') {
          return {
            top: 100,
            left: 100,
            right: 350,
            bottom: 150,
            width: 250,
            height: 50,
            x: 100,
            y: 100,
            toJSON: () => {}
          };
        }
        return {
          top: 750,
          left: 100,
          right: 150,
          bottom: 780,
          width: 50,
          height: 30,
          x: 100,
          y: 750,
          toJSON: () => {}
        };
      });

      render(
        <MultiLineTooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('Tooltip Arrow', () => {
    test('renders arrow for top position', () => {
      const { container } = render(
        <MultiLineTooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      const arrow = tooltip.parentElement?.querySelector('.top-full');
      expect(arrow).toBeInTheDocument();
    });

    test('renders arrow for bottom position', () => {
      const { container } = render(
        <MultiLineTooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      const arrow = tooltip.parentElement?.querySelector('.bottom-full');
      expect(arrow).toBeInTheDocument();
    });

    test('renders arrow for left position', () => {
      const { container } = render(
        <MultiLineTooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      const arrow = tooltip.parentElement?.querySelector('.left-full');
      expect(arrow).toBeInTheDocument();
    });

    test('renders arrow for right position', () => {
      const { container } = render(
        <MultiLineTooltip content="Tooltip text" position="right">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      const arrow = tooltip.parentElement?.querySelector('.right-full');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles missing refs gracefully', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      
      // Should not throw error
      expect(() => {
        fireEvent.mouseEnter(trigger);
        fireEvent.mouseLeave(trigger);
      }).not.toThrow();
    });

    test('updates position when visibility changes', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      
      fireEvent.mouseLeave(trigger);
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
      
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    test('handles long content correctly', () => {
      const longContent = 'This is a very long tooltip content that should wrap properly within the maximum width constraint of the tooltip container.';
      
      render(
        <MultiLineTooltip content={longContent}>
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test('tooltip has correct styling', () => {
      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      const tooltip = screen.getByText('Tooltip text');
      expect(tooltip).toHaveClass('fixed');
      expect(tooltip).toHaveClass('z-[100]');
      expect(tooltip).toHaveClass('px-3');
      expect(tooltip).toHaveClass('py-2');
      expect(tooltip).toHaveClass('text-sm');
      expect(tooltip).toHaveClass('text-white');
      expect(tooltip).toHaveClass('bg-gray-900');
      expect(tooltip).toHaveClass('rounded-md');
      expect(tooltip).toHaveClass('shadow-xl');
      expect(tooltip).toHaveClass('border');
      expect(tooltip).toHaveClass('border-gray-700');
      expect(tooltip).toHaveClass('pointer-events-none');
    });

    test('handles scrolled page with pageYOffset', () => {
      Object.defineProperty(window, 'pageYOffset', { writable: true, value: 100 });
      Object.defineProperty(document.documentElement, 'scrollTop', { writable: true, value: 0 });

      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    test('handles scrolled page with scrollTop', () => {
      Object.defineProperty(window, 'pageYOffset', { writable: true, value: 0 });
      Object.defineProperty(document.documentElement, 'scrollTop', { writable: true, value: 100 });

      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    test('handles scrolled page horizontally with pageXOffset', () => {
      Object.defineProperty(window, 'pageXOffset', { writable: true, value: 50 });
      Object.defineProperty(document.documentElement, 'scrollLeft', { writable: true, value: 0 });

      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    test('handles scrolled page horizontally with scrollLeft', () => {
      Object.defineProperty(window, 'pageXOffset', { writable: true, value: 0 });
      Object.defineProperty(document.documentElement, 'scrollLeft', { writable: true, value: 50 });

      render(
        <MultiLineTooltip content="Tooltip text">
          <button>Hover me</button>
        </MultiLineTooltip>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(10);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });
});
