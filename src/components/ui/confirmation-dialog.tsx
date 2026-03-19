'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info' | 'success';
  confirmButtonStyle?: string;
  confirmButtonBgColor?: string;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
  variant = 'warning',
  confirmButtonStyle,
  confirmButtonBgColor
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          icon: AlertTriangle
        };
      case 'warning':
        return {
          iconColor: 'text-amber-600',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: AlertTriangle
        };
      case 'success':
        return {
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          icon: CheckCircle
        };
      default:
        return {
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: AlertTriangle
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`flex-1 ${confirmButtonStyle || styles.confirmButton}`}
              style={confirmButtonBgColor ? { backgroundColor: confirmButtonBgColor } : undefined}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}