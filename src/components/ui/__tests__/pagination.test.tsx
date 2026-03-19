import { render, screen } from '@testing-library/react'
import Pagination from '../pagination'
import { PaginationState } from '@/types/groups'

describe('Pagination Component', () => {
  const defaultPagination: PaginationState = {
    currentPage: 1,
    totalPages: 5,
    totalRecords: 50,
    pageSize: 10,
    showingFrom: 1,
    showingTo: 10,
  }

  const mockOnPageChange = jest.fn()
  const mockOnPageSizeChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render pagination information', () => {
    render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )

    expect(screen.getByText(/showing 1 to 10 of 50/i)).toBeInTheDocument()
  })

  it('should render page numbers', () => {
    render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should disable previous button on first page', () => {
    render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    const prevButton = buttons[0] // First button is the previous button
    expect(prevButton).toBeDisabled()
  })

  it('should disable next button on last page', () => {
    const lastPagePagination = { ...defaultPagination, currentPage: 5 }

    render(
      <Pagination
        pagination={lastPagePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    const nextButton = buttons[buttons.length - 1] // Last button is the next button
    expect(nextButton).toBeDisabled()
  })

  it('should handle single page', () => {
    const singlePagePagination: PaginationState = {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 5,
      pageSize: 10,
      showingFrom: 1,
      showingTo: 5,
    }

    render(
      <Pagination
        pagination={singlePagePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )

    expect(screen.getByText(/showing 1 to 5 of 5/i)).toBeInTheDocument()
  })

  it('should handle empty results', () => {
    const emptyPagination: PaginationState = {
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      pageSize: 10,
      showingFrom: 0,
      showingTo: 0,
    }

    render(
      <Pagination
        pagination={emptyPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )

    expect(screen.getByText(/showing 0 to 0 of 0/i)).toBeInTheDocument()
  })
})
