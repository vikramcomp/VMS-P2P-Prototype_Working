'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export interface ImportButtonProps {
  onImportClick: () => void;
  disabled?: boolean;
}

/**
 * Reusable Import Button
 * Provides consistent trigger for Import Modal across all modules
 */
export const ImportButton: React.FC<ImportButtonProps> = ({
  onImportClick,
  disabled = false,
}) => {
  return (
    <Button
      type="button"
      onClick={onImportClick}
      disabled={disabled}
      className="gap-2 bg-vendor-600 hover:bg-vendor-700 text-white"
    >
      <Upload className="w-4 h-4" />
      Import
    </Button>
  );
};

export default ImportButton;
