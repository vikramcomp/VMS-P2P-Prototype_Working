import { invoicesService, getInvoicesList, exportInvoices } from '../invoices-service'
import { authService } from '../auth-service'
import { buildApiUrl } from '../api-client'

// Mock dependencies
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}))

jest.mock('../auth-service', () => ({
  authService: {
    getToken: jest.fn(),
  },
}))

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/utils/error-handler', () => ({
  errorHandler: {
    handleError: jest.fn((error) => error),
  },
}))

describe('Invoices Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('getInvoicesList', () => {
    it('should fetch invoices successfully with valid response', async () => {
      const mockToken = 'test-token'
      const mockInvoices = [
        {
          requestId: 1,
          poNumber: 'PO-001',
          requestNumber: 'REQ-001',
          requestName: 'Test Request',
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
      ]

      ;(authService.getToken as jest.Mock).mockReturnValue(mockToken)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          Data: {
            Records: mockInvoices,
            TotalRecords: 1,
            CurrentPage: 1,
            PageSize: 10,
            TotalPages: 1,
          },
        }),
      })

      const result = await getInvoicesList({
        SearchText: '',
        SearchColumn: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
      })

      expect(result.items).toHaveLength(1)
      expect(result.totalRecords).toBe(1)
      expect(result.items[0].requestId).toBe(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('invoices'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('should handle direct array response', async () => {
      const mockInvoices = [
        { requestId: 1, poNumber: 'PO-001' },
        { requestId: 2, poNumber: 'PO-002' },
      ]

      ;(authService.getToken as jest.Mock).mockReturnValue('token')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockInvoices,
      })

      const result = await getInvoicesList()

      expect(result.items).toHaveLength(2)
      expect(result.totalRecords).toBe(2)
    })

    it('should handle API error', async () => {
      ;(authService.getToken as jest.Mock).mockReturnValue('token')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Error message',
      })

      await expect(getInvoicesList()).rejects.toThrow()
    })

    it('should build URL with query parameters', async () => {
      ;(authService.getToken as jest.Mock).mockReturnValue('token')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      })

      await getInvoicesList({
        SearchText: 'test',
        SearchColumn: 'requestNumber',
        PageSize: 20,
        PageNumber: 2,
        IgnorePaging: false,
        SortColumn: 'requestNumber',
        SortType: 'desc',
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('SearchText=test'),
        expect.any(Object)
      )
    })

    it('should handle request without token', async () => {
      ;(authService.getToken as jest.Mock).mockReturnValue(null)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      })

      await getInvoicesList()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })

    it('should handle network error', async () => {
      ;(authService.getToken as jest.Mock).mockReturnValue('token')
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(getInvoicesList()).rejects.toThrow()
    })
  })

  describe('exportInvoices', () => {
    it('should export invoices successfully', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' })
      ;(authService.getToken as jest.Mock).mockReturnValue('token')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      const result = await exportInvoices({
        SearchText: '',
        SearchColumn: '',
        PageSize: 100,
        PageNumber: 1,
        IgnorePaging: true,
        SortColumn: '',
        SortType: 'asc',
      })

      expect(result).toBe(mockBlob)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('invoices/export'),
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('should handle export error', async () => {
      ;(authService.getToken as jest.Mock).mockReturnValue('token')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(
        exportInvoices({
          SearchText: '',
          SearchColumn: '',
          PageSize: 100,
          PageNumber: 1,
          IgnorePaging: true,
          SortColumn: '',
          SortType: 'asc',
        })
      ).rejects.toThrow()
    })
  })

  describe('invoicesService object', () => {
    it('should export service methods', () => {
      expect(invoicesService).toHaveProperty('getInvoicesList')
      expect(invoicesService).toHaveProperty('exportInvoices')
      expect(typeof invoicesService.getInvoicesList).toBe('function')
      expect(typeof invoicesService.exportInvoices).toBe('function')
    })
  })
})
