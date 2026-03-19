import React from 'react';
import { render, waitFor } from '@testing-library/react';
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

describe('WelcomePopup - isTesting prop', () => {
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

  it('should call handleClose when isTesting is true', async () => {
    render(<WelcomePopup onClose={onCloseMock} isTesting={true} />);

    jest.advanceTimersByTime(300);
    
    expect(onCloseMock).toHaveBeenCalled();
  });
});
