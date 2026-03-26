'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
  ChevronDown,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  parseImportFile,
  buildErrorFileContent,
  downloadTextFile,
  isValidImportFile,
  ImportSummary,
  ImportErrorRow,
} from '@/utils/import-utils';

export interface ImportModalConfig {
  moduleName: string;
  title: string;
  description: string;
  columnAliases: Record<string, string[]>;
  requiredFields: string[];
  templateHeaders: string[];
  templateSample: (any[] | string)[];
  accept: '.xlsx,.csv';
}

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ImportModalConfig;
  onImport: (file: File, parsedRows: Record<string, unknown>[]) => Promise<void>;
  onDownloadTemplate?: () => void;
  isImporting?: boolean;
}

interface ImportState {
  file: File | null;
  isDragOver: boolean;
  summary: ImportSummary;
}

/**
 * Reusable Import Modal Component
 * Provides consistent import UI/UX across all modules (Vendors, Items, etc.)
 * Supports drag-and-drop file uploads, template downloads, and error reporting
 */
export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  config,
  onImport,
  onDownloadTemplate,
  isImporting = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ImportState>({
    file: null,
    isDragOver: false,
    summary: {
      status: 'idle',
      totalRecords: 0,
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      failedRows: [],
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState({
        file: null,
        isDragOver: false,
        summary: {
          status: 'idle',
          totalRecords: 0,
          processedCount: 0,
          successCount: 0,
          failedCount: 0,
          failedRows: [],
        },
      });
    }
  }, [isOpen]);

  const handleFileValidation = (file: File): boolean => {
    if (!isValidImportFile(file)) {
      toast({
        title: 'Invalid File Type',
        description: `Only .xlsx and .csv files are supported for ${config.moduleName} import.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!handleFileValidation(file)) return;

    setState((prev) => ({
      ...prev,
      file,
      summary: {
        status: 'idle',
        totalRecords: 0,
        processedCount: 0,
        successCount: 0,
        failedCount: 0,
        failedRows: [],
      },
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragOver: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragOver: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImportClick = async () => {
    if (!state.file || isImporting) return;

    try {
      setState((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          status: 'idle',
          totalRecords: 0,
          processedCount: 0,
        },
      }));

      const parsedRows = await parseImportFile(state.file);
      
      if (parsedRows.length === 0) {
        throw new Error('No data rows found in the selected file.');
      }

      setState((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          totalRecords: parsedRows.length,
        },
      }));

      // Call parent handler to perform module-specific validation and API calls
      await onImport(state.file, parsedRows);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import processing failed';
      toast({
        title: 'Import Failed',
        description: message,
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        summary: {
          status: 'error',
          totalRecords: 0,
          processedCount: 0,
          successCount: 0,
          failedCount: 0,
          failedRows: [],
        },
      }));
    }
  };

  const handleDownloadErrors = () => {
    if (state.summary.failedRows.length === 0) return;
    const content = buildErrorFileContent(state.summary.failedRows);
    downloadTextFile(
      content,
      `${config.moduleName.toLowerCase()}_import_errors_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleDownloadTemplate = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
    } else {
      // Fallback: build template from config
      const headers = config.templateHeaders;
      const sample = config.templateSample.join(',');
      const content = `${headers.join(',')}\n${sample}`;
      downloadTextFile(content, `${config.moduleName.toLowerCase()}_import_template.csv`);
    }
  };

  const handleRetry = () => {
    setState((prev) => ({
      ...prev,
      file: null,
      summary: {
        status: 'idle',
        totalRecords: 0,
        processedCount: 0,
        successCount: 0,
        failedCount: 0,
        failedRows: [],
      },
    }));
  };

  const getStatusColor = (status: ImportSummary['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'partial':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: ImportSummary['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'partial':
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{config.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              disabled={isImporting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {state.summary.status === 'idle' && !isImporting && (
              <>
                {/* Template Download Link */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Download Import Template
                  </button>
                  <p className="text-xs text-gray-600 mt-2">
                    Download a sample template to understand the required format
                  </p>
                </div>

                {/* File Upload Area */}
                {!state.file ? (
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                      state.isDragOver
                        ? 'border-vendor-600 bg-vendor-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-700 font-medium">Drag and drop your file here</p>
                    <p className="text-sm text-gray-500 mt-1">or click to select .xlsx or .csv file</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={config.accept}
                      onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={isImporting}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      ✓ File selected: {state.file.name}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Ready to import. Click the Import button below to proceed.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleImportClick}
                    disabled={!state.file || isImporting}
                    className="flex-1 bg-vendor-600 hover:bg-vendor-700"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import {config.moduleName}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    disabled={isImporting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {/* Progress and Summary Views */}
            {state.summary.totalRecords > 0 && (isImporting || state.summary.status !== 'idle') && (
              <div className="space-y-4">
                {/* Progress Indicator */}
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">Processing records...</p>
                      <p className="text-sm text-gray-600">
                        {state.summary.processedCount} / {state.summary.totalRecords}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-vendor-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(state.summary.processedCount / state.summary.totalRecords) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Summary Display */}
                {!isImporting && state.summary.status !== 'idle' && (
                  <div className={`p-4 rounded-lg border ${
                    state.summary.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : state.summary.status === 'partial'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`flex gap-3 mb-3 ${getStatusColor(state.summary.status)}`}>
                      {getStatusIcon(state.summary.status)}
                      <div>
                        <p className="font-semibold">
                          {state.summary.status === 'success'
                            ? 'Import Completed Successfully'
                            : state.summary.status === 'partial'
                            ? 'Import Partially Completed'
                            : 'Import Failed'}
                        </p>
                        <p className="text-sm mt-1">
                          Successfully created:{' '}
                          <span className="font-semibold">{state.summary.successCount}</span>
                        </p>
                        {state.summary.failedCount > 0 && (
                          <p className="text-sm">
                            Failed: <span className="font-semibold">{state.summary.failedCount}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Error Report Download */}
                    {state.summary.failedCount > 0 && (
                      <Button
                        onClick={handleDownloadErrors}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Error Report
                      </Button>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      {state.summary.failedCount > 0 && (
                        <Button
                          onClick={handleRetry}
                          variant="outline"
                          className="flex-1"
                        >
                          Try Again
                        </Button>
                      )}
                      <Button
                        onClick={onClose}
                        className="flex-1 bg-vendor-600 hover:bg-vendor-700"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportModal;
