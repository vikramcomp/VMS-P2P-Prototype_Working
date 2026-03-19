import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  readonly content: string;
  readonly children: React.ReactNode;
  readonly position?: 'top' | 'bottom' | 'left' | 'right';
  readonly className?: string;
  readonly delay?: number;
}

export function Tooltip({ content, children, position = 'top', className = '', delay = 0 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const showTimeout = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
    }

    // Prevent tooltip from going off-screen horizontally
    const viewportWidth = window.innerWidth;
    const tooltipWidth = tooltipRect.width;
    
    if (left < 0) {
      left = 8; // Minimum left margin
    } else if (left + tooltipWidth > viewportWidth) {
      left = viewportWidth - tooltipWidth - 8; // Maximum right margin
    }

    // Prevent tooltip from going off-screen vertically
    const viewportHeight = window.innerHeight;
    const tooltipHeight = tooltipRect.height;
    
    if (top < scrollTop) {
      top = scrollTop + 8; // Minimum top margin
    } else if (top + tooltipHeight > scrollTop + viewportHeight) {
      top = scrollTop + viewportHeight - tooltipHeight - 8; // Maximum bottom margin
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure the tooltip is rendered before calculating position
      setTimeout(() => {
        updatePosition();
      }, 0);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (showTimeout.current) clearTimeout(showTimeout.current);
    showTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimeout.current) clearTimeout(showTimeout.current);
    setIsVisible(false);
  };

  const getArrowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };
    
    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderColor: 'black transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
          borderColor: 'transparent transparent black transparent',
        };
      case 'left':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
          borderColor: 'transparent transparent transparent black',
        };
      case 'right':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
          borderColor: 'transparent black transparent transparent',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[100] px-2 py-1 text-sm text-white bg-black rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {content}
          <div style={getArrowStyles()} />
        </div>
      )}
    </>
  );
}