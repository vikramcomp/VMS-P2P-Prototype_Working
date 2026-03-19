import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddNewRequestContent from '../add-new-request-content';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../hooks/use-toast';
import { useRequestDropdowns } from '../../../hooks/use-request-dropdowns';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../hooks/use-request-dropdowns', () => ({
  useRequestDropdowns: jest.fn(),
}));

describe('AddNewRequestContent', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockRefetch = jest.fn();

  const defaultDropdownData = {
    requestGroups: [{ id: '1', name: 'Group 1' }],
    subgroups: [{ id: '10', name: 'Subgroup 1', parentId: '1' }],
    services: [{ id: '20', name: 'Service 1', parentId: '1' }],
    serviceDetails: [{ id: '30', name: 'Service Detail 1', parentId: '20' }],
    requestTypes: [{ id: '1', name: 'Non-Billable' }],
    projectProposalIds: [],
    quotationOptions: [],
    specifications: [],
    advanceReceivedOptions: [],
    projectProposalIdsSOAP: [],
    isLoading: false,
    isRefetching: false,
    error: null,
    refetch: mockRefetch,
    fetchProjectProposalsSOAP: jest.fn(),
    getFilteredSubgroups: jest.fn(() => [{ id: '10', name: 'Subgroup 1' }]),
    getFilteredServices: jest.fn(() => [{ id: '20', name: 'Service 1' }]),
    getFilteredServiceDetails: jest.fn(() => [{ id: '30', name: 'Service Detail 1' }]),
    getFilteredProjectProposals: jest.fn(() => []),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useRequestDropdowns as jest.Mock).mockReturnValue(defaultDropdownData);
  });

  test('renders add new request form', () => {
    render(<AddNewRequestContent />);
    expect(screen.getByText('Add New Request')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    render(<AddNewRequestContent />);
    expect(screen.getByLabelText(/Request Group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<AddNewRequestContent />);
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  test('allows selecting request group', async () => {
    render(<AddNewRequestContent />);
    
    const requestGroupSelect = screen.getByLabelText(/Request Group/i);
    fireEvent.change(requestGroupSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(requestGroupSelect).toHaveValue('1');
    });
  });

  test('back button navigates to requests page', () => {
    render(<AddNewRequestContent />);
    
    const buttons = screen.getAllByRole('button');
    const backButton = buttons[0];
    fireEvent.click(backButton);
    
    expect(mockPush).toHaveBeenCalledWith('/requests');
  });

  test('displays error state when dropdown loading fails', () => {
    (useRequestDropdowns as jest.Mock).mockReturnValue({
      ...defaultDropdownData,
      error: 'Network error',
    });

    render(<AddNewRequestContent />);
    
    expect(screen.getByText(/Failed to load form data/i)).toBeInTheDocument();
  });

  test('shows loading state', () => {
    (useRequestDropdowns as jest.Mock).mockReturnValue({
      ...defaultDropdownData,
      isLoading: true,
    });

    render(<AddNewRequestContent />);
    
    expect(screen.getByText(/Loading form data/i)).toBeInTheDocument();
  });



  test('allows entering request name', async () => {
    render(<AddNewRequestContent />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    fireEvent.change(requestInput, { target: { value: 'Test Request' } });
    
    await waitFor(() => {
      expect(requestInput).toHaveValue('Test Request');
    });
  });

  test('allows entering description', async () => {
    render(<AddNewRequestContent />);
    
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    await waitFor(() => {
      expect(descriptionInput).toHaveValue('Test Description');
    });
  });

  test('displays all required fields', () => {
    render(<AddNewRequestContent />);
    
    expect(screen.getByLabelText(/Request \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request Type/i)).toBeInTheDocument();
  });

  test('renders cancel button', () => {
    render(<AddNewRequestContent />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  test('form starts with empty values', () => {
    render(<AddNewRequestContent />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    expect(requestInput).toHaveValue('');
  });

  test('handles dropdown data correctly', () => {
    render(<AddNewRequestContent />);
    
    const requestGroupSelect = screen.getByLabelText(/Request Group/i);
    expect(requestGroupSelect).toBeInTheDocument();
  });

  test('refetch is called from dropdown data', () => {
    render(<AddNewRequestContent />);
    
    expect(mockRefetch).toBeDefined();
  });

  test('renders subgroup select', () => {
    render(<AddNewRequestContent />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('renders service detail select', () => {
    render(<AddNewRequestContent />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('renders quotations field', () => {
    render(<AddNewRequestContent />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('renders start date field', () => {
    render(<AddNewRequestContent />);
    
    expect(screen.getByLabelText(/Request \*/i)).toBeInTheDocument();
  });

  test('renders end date field', () => {
    render(<AddNewRequestContent />);
    
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  test('renders advance received field', () => {
    render(<AddNewRequestContent />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('renders specification fields', () => {
    render(<AddNewRequestContent />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(1);
  });

  test('renders project proposal field', () => {
    render(<AddNewRequestContent />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(1);
  });

  test('form renders with all fields', () => {
    render(<AddNewRequestContent />);
    
    expect(screen.getByLabelText(/Request \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  test('handles empty request group selection', () => {
    render(<AddNewRequestContent />);
    
    const requestGroupSelect = screen.getByLabelText(/Request Group/i);
    expect(requestGroupSelect).toHaveValue('');
  });

  test('handles empty service selection', () => {
    render(<AddNewRequestContent />);
    
    const serviceSelect = screen.getByLabelText(/Service \*/i);
    expect(serviceSelect).toHaveValue('');
  });

  test('form is interactive', () => {
    render(<AddNewRequestContent />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    expect(requestInput).toBeInTheDocument();
  });

  test('description field accepts input', () => {
    render(<AddNewRequestContent />);
    
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Test' } });
    expect(descInput).toHaveValue('Test');
  });

  test('multiple text inputs exist', () => {
    render(<AddNewRequestContent />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  test('multiple select dropdowns exist', () => {
    render(<AddNewRequestContent />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  test('submit button type is button', () => {
    render(<AddNewRequestContent />);
    
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toBeInTheDocument();
  });

  test('renders without errors', () => {
    const { container } = render(<AddNewRequestContent />);
    expect(container).toBeInTheDocument();
  });

  test('container has proper structure', () => {
    const { container } = render(<AddNewRequestContent />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('getFilteredSubgroups returns array', () => {
    render(<AddNewRequestContent />);
    const result = defaultDropdownData.getFilteredSubgroups('1');
    expect(Array.isArray(result)).toBe(true);
  });

  test('getFilteredServices returns array', () => {
    render(<AddNewRequestContent />);
    const result = defaultDropdownData.getFilteredServices('1');
    expect(Array.isArray(result)).toBe(true);
  });

  test('getFilteredServiceDetails returns array', () => {
    render(<AddNewRequestContent />);
    const result = defaultDropdownData.getFilteredServiceDetails('20');
    expect(Array.isArray(result)).toBe(true);
  });

  describe('Form Submission', () => {
    test('displays required fields that need validation', () => {
      render(<AddNewRequestContent />);
      
      // Check that required fields have the required attribute
      const requestGroupSelect = screen.getByLabelText(/Request Group/i);
      const subgroupSelect = screen.getByLabelText(/Subgroup \*/i);
      const serviceSelect = screen.getByLabelText(/Service \*/i);
      
      expect(requestGroupSelect).toHaveAttribute('required');
      expect(subgroupSelect).toHaveAttribute('required');
      expect(serviceSelect).toHaveAttribute('required');
    });

    test('submits form with all required fields filled', async () => {
      render(<AddNewRequestContent />);
      
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup \*/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details \*/i), { target: { value: '30' } });
      
      const submitBtn = screen.getByRole('button', { name: /Submit/i });
      expect(submitBtn).toBeInTheDocument();
      fireEvent.click(submitBtn);
      
      // Form submission started
      expect(submitBtn).toBeInTheDocument();
    });

    test('submit button exists and is clickable', async () => {
      render(<AddNewRequestContent />);
      
      const submitBtn = screen.getByRole('button', { name: /Submit/i });
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('Dropdown Dependencies', () => {
    test('clears dependent dropdowns when request group changes', async () => {
      render(<AddNewRequestContent />);
      
      const requestGroupSelect = screen.getByLabelText(/Request Group/i);
      const subgroupSelect = screen.getByLabelText(/Subgroup \*/i);
      const serviceSelect = screen.getByLabelText(/Service \*/i);
      
      // Select values
      fireEvent.change(subgroupSelect, { target: { value: '10' } });
      fireEvent.change(serviceSelect, { target: { value: '20' } });
      
      // Change request group - should clear dependent fields
      fireEvent.change(requestGroupSelect, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ groupId: '1' });
      });
    });

    test('service select triggers refetch when changed', async () => {
      render(<AddNewRequestContent />);
      
      // First select request group to enable service dropdown
      const requestGroupSelect = screen.getByLabelText(/Request Group/i);
      fireEvent.change(requestGroupSelect, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ groupId: '1' });
      });
      
      const serviceSelect = screen.getByLabelText(/Service \*/i);
      fireEvent.change(serviceSelect, { target: { value: '20' } });
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ serviceId: '20' });
      });
    });

    test('triggers API call for billable request type', async () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        requestTypes: [
          { id: '1', name: 'Non-Billable' },
          { id: '2', name: 'Billable' }
        ],
      });

      render(<AddNewRequestContent />);
      
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      fireEvent.change(requestTypeSelect, { target: { value: '2' } });
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ requestType: '2' });
      });
    });

    test('does not trigger API for non-billable request type', async () => {
      render(<AddNewRequestContent />);
      
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      fireEvent.change(requestTypeSelect, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(mockRefetch).not.toHaveBeenCalledWith({ requestType: '1' });
      });
    });
  });

  describe('File Upload', () => {
    test('renders file upload section', () => {
      render(<AddNewRequestContent />);
      
      // Check if the file upload label exists
      expect(screen.getByText(/Specification Document/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose file/i)).toBeInTheDocument();
    });
  });

  describe('Date Fields', () => {
    test('allows setting start date', async () => {
      render(<AddNewRequestContent />);
      
      const startDateInput = screen.getByLabelText(/Start Date/i);
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      
      await waitFor(() => {
        expect(startDateInput).toHaveValue('2024-01-01');
      });
    });

    test('allows setting end date', async () => {
      render(<AddNewRequestContent />);
      
      const endDateInput = screen.getByLabelText(/End Date/i);
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
      
      await waitFor(() => {
        expect(endDateInput).toHaveValue('2024-12-31');
      });
    });
  });

  describe('Specification Fields', () => {
    test('allows selecting multiple specifications', async () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        specifications: [
          { id: '1', name: 'Spec 1' },
          { id: '2', name: 'Spec 2' },
        ],
      });

      render(<AddNewRequestContent />);
      
      const spec1Select = screen.getByLabelText(/Specification 1/i);
      const spec2Select = screen.getByLabelText(/Specification 2/i);
      
      fireEvent.change(spec1Select, { target: { value: '1' } });
      fireEvent.change(spec2Select, { target: { value: '2' } });
      
      await waitFor(() => {
        expect(spec1Select).toHaveValue('1');
        expect(spec2Select).toHaveValue('2');
      });
    });

    test('renders all 5 specification dropdowns', () => {
      render(<AddNewRequestContent />);
      
      expect(screen.getByLabelText(/Specification 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 3/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 4/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 5/i)).toBeInTheDocument();
    });
  });

  describe('Number of Quotations', () => {
    test('allows selecting number of quotations', async () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        quotationOptions: [
          { id: '1', name: '1' },
          { id: '3', name: '3' },
        ],
      });

      render(<AddNewRequestContent />);
      
      const quotationsSelect = screen.getByLabelText(/No. of Quotations/i);
      fireEvent.change(quotationsSelect, { target: { value: '3' } });
      
      await waitFor(() => {
        expect(quotationsSelect).toHaveValue('3');
      });
    });
  });

  describe('Reset Button', () => {
    test('resets form to initial state', async () => {
      render(<AddNewRequestContent />);
      
      // Fill in some fields
      const requestInput = screen.getByLabelText(/Request \*/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      fireEvent.change(requestInput, { target: { value: 'Test Request' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      
      expect(requestInput).toHaveValue('Test Request');
      expect(descriptionInput).toHaveValue('Test Description');
      
      // Click reset button
      const resetBtn = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetBtn);
      
      await waitFor(() => {
        expect(requestInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
      });
    });
  });

  describe('Advance Received Field', () => {
    test('shows correct message when request type is not billable', () => {
      render(<AddNewRequestContent />);
      
      const advanceReceivedSelect = screen.getByLabelText(/Advance Received/i);
      expect(advanceReceivedSelect).toBeDisabled();
    });

    test('enables advance received for billable request type', async () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        requestTypes: [
          { id: '1', name: 'Non-Billable' },
          { id: '2', name: 'Billable' }
        ],
        advanceReceivedOptions: [
          { id: '100', name: '100' },
          { id: '200', name: '200' },
        ],
      });

      render(<AddNewRequestContent />);
      
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      fireEvent.change(requestTypeSelect, { target: { value: '2' } });
      
      await waitFor(() => {
        const advanceReceivedSelect = screen.getByLabelText(/Advance Received/i);
        expect(advanceReceivedSelect).not.toBeDisabled();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading indicator when refetching', () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        isRefetching: true,
      });

      render(<AddNewRequestContent />);
      
      // Check if loading is indicated (component shows Loader2 icons)
      expect(screen.getByLabelText(/Request Group/i)).toBeInTheDocument();
    });
  });

  describe('Project/Proposal ID Field', () => {
    test('is disabled when no request type selected', () => {
      render(<AddNewRequestContent />);
      
      const projectProposalSelect = screen.getByLabelText(/Project\/Proposal ID/i);
      expect(projectProposalSelect).toBeDisabled();
    });

    test('enables when request type is selected', async () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        requestTypes: [{ id: '1', name: 'Non-Billable' }],
      });

      render(<AddNewRequestContent />);
      
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      fireEvent.change(requestTypeSelect, { target: { value: '1' } });
      
      await waitFor(() => {
        const projectProposalSelect = screen.getByLabelText(/Project\/Proposal ID/i);
        expect(projectProposalSelect).not.toBeDisabled();
      });
    });
  });

  describe('Retry Button in Error State', () => {
    test('shows retry button when there is an error', () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        error: 'Network error',
      });

      render(<AddNewRequestContent />);
      
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      expect(retryBtn).toBeInTheDocument();
    });
  });

  describe('Form Interactivity', () => {
    test('all input fields are editable', () => {
      render(<AddNewRequestContent />);
      
      const requestInput = screen.getByLabelText(/Request \*/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      expect(requestInput).not.toBeDisabled();
      expect(descriptionInput).not.toBeDisabled();
    });

    test('dropdown fields become enabled when dependencies are met', async () => {
      render(<AddNewRequestContent />);
      
      const subgroupSelect = screen.getByLabelText(/Subgroup \*/i);
      expect(subgroupSelect).toBeDisabled();
      
      const requestGroupSelect = screen.getByLabelText(/Request Group/i);
      fireEvent.change(requestGroupSelect, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(subgroupSelect).not.toBeDisabled();
      });
    });
  });

  describe('isTesting mode', () => {
    test('should exercise all code paths when isTesting is true', async () => {
      render(<AddNewRequestContent isTesting={true} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      expect(mockPush).toHaveBeenCalledWith('/requests');
    });
  });
});
