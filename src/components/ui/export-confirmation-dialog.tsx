'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileDown } from 'lucide-react';

interface ExportConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: (exportAll: boolean) => void;
  onCancel: () => void;
  recordCount?: number;
}

export function ExportConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  recordCount = 0
}: ExportConfirmationDialogProps) {
  const [exportAll, setExportAll] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(exportAll);
    setExportAll(false); // Reset checkbox for next time
  };

  const handleCancel = () => {
    setExportAll(false); // Reset checkbox
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileDown className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Export Payment Cycle Report
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Choose export options for your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="exportAll"
                checked={exportAll}
                onChange={(e) => setExportAll(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="exportAll" className="flex-1 cursor-pointer">
                <div className="font-medium text-gray-900">Export All Records</div>
                <div className="text-sm text-gray-600 mt-1">
                  {exportAll 
                    ? `Export all records (ignoring pagination)`
                    : `Export current page only (${recordCount} record${recordCount !== 1 ? 's' : ''})`
                  }
                </div>
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
