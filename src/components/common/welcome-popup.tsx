"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface WelcomePopupProps {
  onClose: () => void;
  isTesting?: boolean;
}

export function WelcomePopup({
  onClose,
  isTesting = false,
}: Readonly<WelcomePopupProps>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    if (isTesting) {
      setIsVisible(true);
      handleClose();
    }
  }, [isTesting]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  return (
    <div
      data-testid="welcome-popup"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors group"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded">
            Close
          </span>
        </button>

        {/* Image container */}
        <div className="p-5">
          <div className="relative w-full" style={{ minHeight: "320px" }}>
            <Image
              src="/images/illustrations/RequestApprovalFlowDiagram.jpg"
              alt="Request Approval Flow Diagram"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  );
}
