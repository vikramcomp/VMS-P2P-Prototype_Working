import React, { useState, useRef, useEffect } from "react";

interface MultiLineTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  maxWidth?: string;
}

export function MultiLineTooltip({
  content,
  children,
  position = "top",
  className = "",
  maxWidth = "300px",
}: Readonly<MultiLineTooltipProps>) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top + scrollTop - tooltipRect.height - 10;
        left =
          triggerRect.left +
          scrollLeft +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollTop + 10;
        left =
          triggerRect.left +
          scrollLeft +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollTop +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 10;
        break;
      case "right":
        top =
          triggerRect.top +
          scrollTop +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollLeft + 10;
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
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
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
          className="fixed z-[100] px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-xl border border-gray-700 pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: maxWidth,
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "1.5",
            boxShadow:
              "0 10px 25px rgba(0, 0, 0, 0.25), 0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {content}
          <div
            className={`absolute ${(() => {
              if (position === "top")
                return "top-full left-1/2 transform -translate-x-1/2";
              if (position === "bottom")
                return "bottom-full left-1/2 transform -translate-x-1/2";
              if (position === "left")
                return "left-full top-1/2 transform -translate-y-1/2";
              return "right-full top-1/2 transform -translate-y-1/2";
            })()}`}
            style={{
              width: 0,
              height: 0,
              zIndex: 101,
              borderStyle: "solid",
              ...(position === "top" && {
                borderLeftWidth: "8px",
                borderRightWidth: "8px",
                borderTopWidth: "8px",
                borderBottomWidth: 0,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: "#111827", // gray-900
                borderBottomColor: "transparent",
              }),
              ...(position === "bottom" && {
                borderLeftWidth: "8px",
                borderRightWidth: "8px",
                borderBottomWidth: "8px",
                borderTopWidth: 0,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: "#111827", // gray-900
                borderTopColor: "transparent",
              }),
              ...(position === "left" && {
                borderTopWidth: "8px",
                borderBottomWidth: "8px",
                borderLeftWidth: "8px",
                borderRightWidth: 0,
                borderTopColor: "transparent",
                borderBottomColor: "transparent",
                borderLeftColor: "#111827", // gray-900
                borderRightColor: "transparent",
              }),
              ...(position === "right" && {
                borderTopWidth: "8px",
                borderBottomWidth: "8px",
                borderRightWidth: "8px",
                borderLeftWidth: 0,
                borderTopColor: "transparent",
                borderBottomColor: "transparent",
                borderRightColor: "#111827", // gray-900
                borderLeftColor: "transparent",
              }),
            }}
          />
        </div>
      )}
    </>
  );
}
