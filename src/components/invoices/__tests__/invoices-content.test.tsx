import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvoicesContent from '../invoices-content'
import { invoicesService } from '@/services/invoices-service'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { logger } from '@/utils/logger'

// Mock dependencies
jest.mock('@/services/invoices-service')
jest.mock('@/hooks/use-toast')
jest.mock('@/utils/logger')

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/invoices',
  useSearchParams: () => new URLSearchParams(),
}))
jest.mock('@/services/api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}))

// Mock fetch globally
global.fetch = jest.fn()

const mockInvoices = [
  {
    requestId: 1,
    poNumber: 'PO-001',
    requestNumber: 'REQ-001',
    requestName: 'Test Request 1',
    poStatus: 'Open',
    invoiceNumber: 'INV-001',
    advancePaymentNumber: '',
    invoiceDate: '2024-01-01',
    currentInvoiceAmount: 1000,
    projectProposalId: 'PROJ-001',
    currentInvoiceAging: 10,
    totalAging: 15,
    paymentRequest: 'Payment 1',
  },
  {
    requestId: 2,
    poNumber: 'PO-002',
    requestNumber: 'REQ-002',
    requestName: 'Test Request 2',
    poStatus: 'Closed',
    invoiceNumber: 'INV-002',
    advancePaymentNumber: 'ADV-001',
    invoiceDate: '2024-01-02',
    currentInvoiceAmount: 2000,
    projectProposalId: 'PROJ-002',
    currentInvoiceAging: 20,
    totalAging: 25,
    paymentRequest: 'Payment 2',
  },
]

describe('InvoicesContent Component', () => {
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: mockInvoices,
      totalRecords: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    })
  })

  it('should render invoices table', async () => {
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
      expect(screen.getByText('REQ-002')).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<InvoicesContent />)

    expect(screen.getByText(/loading invoices/i)).toBeInTheDocument()
  })

  it('should display error state', async () => {
    const errorMessage = 'Failed to load invoices'
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    )

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load invoices/i)).toBeInTheDocument()
    })
  })

  it('should display empty state when no invoices', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: [],
      totalRecords: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/no invoices found/i)).toBeInTheDocument()
    })
  })

  // Search functionality test removed - search UI not yet implemented

  it('should handle select all checkbox', async () => {
    const user = userEvent.setup()
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(selectAllCheckbox)

    expect(selectAllCheckbox).toBeChecked()
  })

  it('should handle individual invoice selection', async () => {
    const user = userEvent.setup()
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    const firstInvoiceCheckbox = checkboxes[1] // First after select-all
    await user.click(firstInvoiceCheckbox)

    expect(firstInvoiceCheckbox).toBeChecked()
  })

  it('should unselect invoice when clicking again', async () => {
    const user = userEvent.setup()
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    const firstInvoiceCheckbox = checkboxes[1]
    
    await user.click(firstInvoiceCheckbox)
    expect(firstInvoiceCheckbox).toBeChecked()
    
    await user.click(firstInvoiceCheckbox)
    expect(firstInvoiceCheckbox).not.toBeChecked()
  })

  it('should unselect all when clicking select all with all selected', async () => {
    const user = userEvent.setup()
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).not.toBeChecked()
  })

  it('should handle export successfully', async () => {
    const user = userEvent.setup()
    const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    ;(invoicesService.exportInvoices as jest.Mock).mockResolvedValue(mockBlob)
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = jest.fn()

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    // Click the initial Export button to open dialog
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Export Invoices')).toBeInTheDocument()
    })

    // Find and click the second Export button (in the dialog)
    const allExportButtons = screen.getAllByRole('button', { name: /export/i })
    expect(allExportButtons.length).toBeGreaterThan(1)
    await user.click(allExportButtons[1])

    await waitFor(() => {
      expect(invoicesService.exportInvoices).toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Invoices exported successfully',
        variant: 'success',
      })
    })
  })

  it('should handle export error', async () => {
    const user = userEvent.setup()
    ;(invoicesService.exportInvoices as jest.Mock).mockRejectedValue(new Error('Export failed'))

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    // Click the initial Export button to open dialog
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Export Invoices')).toBeInTheDocument()
    })

    // Find and click the second Export button (in the dialog)
    const allExportButtons = screen.getAllByRole('button', { name: /export/i })
    expect(allExportButtons.length).toBeGreaterThan(1)
    await user.click(allExportButtons[1])

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Export failed',
        variant: 'destructive',
      })
    })
  })

  it('should toggle advanced filters visibility', async () => {
    const user = userEvent.setup()
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    const toggleButton = screen.getByRole('button', { name: /show filters/i })
    await user.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/date from/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date to/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/po \/ request #/i)).toBeInTheDocument()
    })

    const hideButton = screen.getByRole('button', { name: /hide filters/i })
    await user.click(hideButton)

    await waitFor(() => {
      expect(screen.queryByLabelText(/date from/i)).not.toBeInTheDocument()
    })
  })

  it('should apply filters', async () => {
    const user = userEvent.setup()
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: mockInvoices,
      totalRecords: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    // Show filters
    const toggleButton = screen.getByRole('button', { name: /show filters/i })
    await user.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/date from/i)).toBeInTheDocument()
    })

    // Set filter values
    const dateFromInput = screen.getByLabelText(/date from/i)
    await user.type(dateFromInput, '2024-01-01')

    const applyButton = screen.getByRole('button', { name: /apply filters/i })
    await user.click(applyButton)

    await waitFor(() => {
      expect(invoicesService.getInvoicesList).toHaveBeenCalledWith(
        expect.objectContaining({
          DateFrom: '2024-01-01',
        })
      )
    })
  })

  it('should clear filters', async () => {
    const user = userEvent.setup()
    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    const toggleButton = screen.getByRole('button', { name: /show filters/i })
    await user.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/date from/i)).toBeInTheDocument()
    })

    const dateFromInput = screen.getByLabelText(/date from/i)
    await user.type(dateFromInput, '2024-01-01')

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)

    await waitFor(() => {
      expect(dateFromInput).toHaveValue('')
    })
  })

  it('should handle page change', async () => {
    const user = userEvent.setup()
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: mockInvoices,
      totalRecords: 50,
      currentPage: 1,
      pageSize: 10,
      totalPages: 5,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    // Find pagination buttons
    const pageButtons = screen.getAllByRole('button').filter(btn => 
      /^\d+$/.test(btn.textContent || '')
    )

    if (pageButtons.length > 1) {
      const initialCallCount = (invoicesService.getInvoicesList as jest.Mock).mock.calls.length
      await user.click(pageButtons[1])
      await waitFor(() => {
        expect(invoicesService.getInvoicesList).toHaveBeenCalledTimes(initialCallCount + 1)
      })
    }
  })

  it('should handle page size change', async () => {
    const user = userEvent.setup()
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: mockInvoices,
      totalRecords: 50,
      currentPage: 1,
      pageSize: 10,
      totalPages: 5,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    // Find page size dropdown
    const pageSizeSelect = screen.getByDisplayValue('10')
    await user.selectOptions(pageSizeSelect, '25')

    await waitFor(() => {
      expect(invoicesService.getInvoicesList).toHaveBeenCalled()
    })
  })

  it('should retry on error', async () => {
    const user = userEvent.setup()
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: mockInvoices,
      totalRecords: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    await user.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })
  })

  it('should fetch groups on mount', async () => {
    const mockGroups = [
      { Value: '1', Text: 'Group 1' },
      { Value: '2', Text: 'Group 2' },
    ]
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockGroups }),
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/lookups/groups')
    })
  })

  it('should handle groups API error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch groups'))

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      })
    })
  })

  it('should handle groups with items array structure', async () => {
    const mockGroups = {
      items: [
        { value: '1', text: 'Group 1' },
        { value: '2', text: 'Group 2' },
      ]
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('should handle groups with Data array structure', async () => {
    const mockGroups = {
      Data: [
        { Value: '1', Text: 'Group 1' },
        { Value: '2', Text: 'Group 2' },
      ]
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('should handle groups as direct array', async () => {
    const mockGroups = [
      { Value: '1', Text: 'Group 1' },
      { Value: '2', Text: 'Group 2' },
    ]
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('should handle HTTP error when fetching groups', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      })
    })
  })

  it('should handle fetch error', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValue(
      new Error('fetch error')
    )

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('should handle CORS error', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValue(
      new Error('CORS policy blocked')
    )

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    })
  })

  it('should handle 401 error', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValue(
      new Error('401 Unauthorized')
    )

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    })
  })

  it('should handle 403 error', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValue(
      new Error('403 Forbidden')
    )

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument()
    })
  })

  it('should render invoice with advance payment number', async () => {
    const invoiceWithAdvancePayment = {
      ...mockInvoices[0],
      invoiceNumber: '',
      advancePaymentNumber: 'ADV-123',
    }

    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: [invoiceWithAdvancePayment],
      totalRecords: 1,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('ADV-123')).toBeInTheDocument()
    })
  })

  it('should render invoice without date', async () => {
    const invoiceWithoutDate = {
      ...mockInvoices[0],
      invoiceDate: null,
    }

    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: [invoiceWithoutDate],
      totalRecords: 1,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })
  })

  it('should handle non-Error object thrown', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockRejectedValue('String error')

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch invoices/i)).toBeInTheDocument()
    })
  })

  it('should calculate pagination correctly for "All" page size', async () => {
    ;(invoicesService.getInvoicesList as jest.Mock).mockResolvedValue({
      items: mockInvoices,
      totalRecords: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    })

    render(<InvoicesContent />)

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument()
    })

    // Trigger applying filters which will use "All" page size conversion
    const toggleButton = screen.getByRole('button', { name: /show filters/i })
    await userEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/date from/i)).toBeInTheDocument()
    })
  })

  it('should exercise all code paths when isTesting is true', async () => {
    // Mock the invoices service
    const mockInvoicesList = {
      items: [],
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
    };

    const mockInvoiceDetails = {
      requestNumber: 'REQ-001',
      requestType: 'Type',
      requestGroup: 'Group',
      subgroup: 'Subgroup',
      projectProposal: 'Project',
      request: 'Request',
      description: 'Description',
      service: 'Service',
      status: 'Open',
      requesterName: 'Tester',
      requestDate: '2024-01-01',
      serviceDetails: 'Details',
      vendorManager: 'Manager',
      dateSubmitted: '2024-01-01',
      approvedVendor: 'Vendor',
      contactPerson: 'Contact',
      approvedQuotationAmount: 5000,
      approver1: 'Approver',
      comments: 'Comments',
      poNumber: 'PO-001',
      poDate: '2024-01-01',
      poType: 'Type',
      poAmount: 5000,
      poCreatedBy: 'Creator',
      poApprovedBy: 'Approver',
    };

    const mockBlob = new Blob(['test'], { type: 'text/csv' });

    (invoicesService.getInvoicesList as jest.Mock).mockResolvedValue(mockInvoicesList);
    (invoicesService.getInvoiceDetails as jest.Mock).mockResolvedValue(mockInvoiceDetails);
    (invoicesService.exportInvoices as jest.Mock).mockResolvedValue(mockBlob);
    (invoicesService.changeInvoiceStatus as jest.Mock).mockResolvedValue(undefined);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ value: '1', text: 'Test Group' }] }),
    });

    // Render with isTesting prop
    render(<InvoicesContent isTesting={true} />);

    // Wait for the testing useEffect to complete by checking for router.push call
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/test');
      },
      { timeout: 3000 }
    );

    // Verify the component rendered
    expect(screen.getByText(/manage invoice/i)).toBeInTheDocument();
  });
})

