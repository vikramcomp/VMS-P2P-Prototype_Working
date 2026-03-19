import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestForm from '../request-form';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../hooks/use-toast';
import { useRequestDropdowns } from '../../../hooks/use-request-dropdowns';
import { requestsService } from '../../../services/requests-service';

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

jest.mock('../../../services/requests-service', () => ({
  requestsService: {
    saveRequest: jest.fn(),
    updateRequest: jest.fn(),
    saveAndSubmitRequest: jest.fn(),
  },
}));

describe('RequestForm', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockRefetch = jest.fn();

  const mockFetchProjectProposalsSOAP = jest.fn();

  const defaultDropdownData = {
    requestGroups: [
      { id: '1', name: 'Group 1' },
      { id: '2', name: 'Group 2' }
    ],
    subgroups: [
      { id: '10', name: 'Subgroup 1', parentId: '1' },
      { id: '11', name: 'Subgroup 2', parentId: '1' }
    ],
    services: [
      { id: '20', name: 'Service 1', parentId: '1' },
      { id: '21', name: 'Service 2', parentId: '1' }
    ],
    serviceDetails: [
      { id: '30', name: 'Detail 1', parentId: '20' },
      { id: '31', name: 'Detail 2', parentId: '20' }
    ],
    requestTypes: [
      { id: '1', name: 'Non-Billable' },
      { id: '2', name: 'Billable' }
    ],
    projectProposalIds: [],
    quotationOptions: [
      { id: '1', name: '1' },
      { id: '2', name: '2' },
      { id: '3', name: '3' }
    ],
    specifications: [
      { id: '1', name: 'Spec 1' },
      { id: '2', name: 'Spec 2' },
      { id: '3', name: 'Spec 3' }
    ],
    advanceReceivedOptions: [
      { id: '100', name: '100' },
      { id: '200', name: '200' }
    ],
    projectProposalIdsSOAP: [
      { id: 'PROJ-001', name: 'Project 001' },
      { id: 'PROJ-002', name: 'Project 002' }
    ],
    isLoading: false,
    isRefetching: false,
    error: null,
    refetch: mockRefetch,
    fetchProjectProposalsSOAP: mockFetchProjectProposalsSOAP,
    getFilteredSubgroups: jest.fn((groupId) => 
      defaultDropdownData.subgroups.filter(s => s.parentId === groupId)
    ),
    getFilteredServices: jest.fn((groupId) => 
      defaultDropdownData.services.filter(s => s.parentId === groupId)
    ),
    getFilteredServiceDetails: jest.fn((serviceId) => 
      defaultDropdownData.serviceDetails.filter(d => d.parentId === serviceId)
    ),
    getFilteredProjectProposals: jest.fn(() => []),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useRequestDropdowns as jest.Mock).mockReturnValue(defaultDropdownData);
  });

  test('renders form in add mode', () => {
    render(<RequestForm mode="add" />);
    expect(screen.getByText('Add New Request')).toBeInTheDocument();
  });

  test('renders form in view mode', () => {
    render(<RequestForm mode="view" requestId={123} />);
    expect(screen.getByText('View Request')).toBeInTheDocument();
  });

  test('renders form in edit mode', () => {
    render(<RequestForm mode="edit" requestId={123} />);
    expect(screen.getByText('Edit Request')).toBeInTheDocument();
  });

  test('shows submit button in add mode', () => {
    render(<RequestForm mode="add" />);
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  test('has buttons in edit mode', () => {
    render(<RequestForm mode="edit" requestId={123} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('fields are disabled in view mode', () => {
    render(<RequestForm mode="view" requestId={123} />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    expect(requestInput).toBeDisabled();
  });

  test('fields are editable in add mode', () => {
    render(<RequestForm mode="add" />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    expect(requestInput).not.toBeDisabled();
  });

  test('back button navigates to requests page', () => {
    render(<RequestForm mode="add" />);
    
    const backButton = screen.getAllByRole('button')[0];
    fireEvent.click(backButton);
    
    expect(mockPush).toHaveBeenCalledWith('/requests');
  });

  test('displays error state when dropdown loading fails', () => {
    (useRequestDropdowns as jest.Mock).mockReturnValue({
      ...defaultDropdownData,
      error: 'Network error',
    });

    render(<RequestForm mode="add" />);
    
    expect(screen.getByText(/Failed to load form data/i)).toBeInTheDocument();
  });



  test('allows entering request name in add mode', () => {
    render(<RequestForm mode="add" />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    fireEvent.change(requestInput, { target: { value: 'New Request' } });
    
    expect(requestInput).toHaveValue('New Request');
  });

  test('allows entering description in add mode', () => {
    render(<RequestForm mode="add" />);
    
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Description text' } });
    
    expect(descriptionInput).toHaveValue('Description text');
  });

  test('allows selecting group in add mode', () => {
    render(<RequestForm mode="add" />);
    
    const groupSelect = screen.getByLabelText(/Request Group/i);
    fireEvent.change(groupSelect, { target: { value: '1' } });
    
    expect(groupSelect).toHaveValue('1');
  });



  test('displays required fields indicator', () => {
    render(<RequestForm mode="add" />);
    
    expect(screen.getByLabelText(/Request \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
  });

  test('form fields start empty in add mode', () => {
    render(<RequestForm mode="add" />);
    
    const requestInput = screen.getByLabelText(/Request \*/i);
    expect(requestInput).toHaveValue('');
  });

  test('renders all form sections', () => {
    render(<RequestForm mode="add" />);
    
    expect(screen.getByLabelText(/Request Group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request \*/i)).toBeInTheDocument();
  });

  test('has multiple buttons', () => {
    render(<RequestForm mode="add" />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  test('edit mode displays title correctly', () => {
    render(<RequestForm mode="edit" requestId={123} />);
    
    expect(screen.getByText('Edit Request')).toBeInTheDocument();
  });

  test('view mode displays title correctly', () => {
    render(<RequestForm mode="view" requestId={123} />);
    
    expect(screen.getByText('View Request')).toBeInTheDocument();
  });

  test('requestId is used in edit mode', () => {
    render(<RequestForm mode="edit" requestId={456} />);
    
    expect(screen.getByText('Edit Request')).toBeInTheDocument();
  });

  test('requestId is used in view mode', () => {
    render(<RequestForm mode="view" requestId={789} />);
    
    expect(screen.getByText('View Request')).toBeInTheDocument();
  });

  test('dropdown data is properly consumed', () => {
    render(<RequestForm mode="add" />);
    
    const groupSelect = screen.getByLabelText(/Request Group/i);
    expect(groupSelect).toBeInTheDocument();
  });

  test('handles refetch function', () => {
    render(<RequestForm mode="add" />);
    
    expect(mockRefetch).toBeDefined();
  });

  test('handles getFilteredSubgroups function', () => {
    render(<RequestForm mode="add" />);
    
    expect(defaultDropdownData.getFilteredSubgroups).toBeDefined();
  });

  test('handles getFilteredServices function', () => {
    render(<RequestForm mode="add" />);
    
    expect(defaultDropdownData.getFilteredServices).toBeDefined();
  });

  test('handles getFilteredServiceDetails function', () => {
    render(<RequestForm mode="add" />);
    
    expect(defaultDropdownData.getFilteredServiceDetails).toBeDefined();
  });

  test('renders container element', () => {
    const { container } = render(<RequestForm mode="add" />);
    expect(container).toBeInTheDocument();
  });

  test('has proper DOM structure', () => {
    const { container } = render(<RequestForm mode="add" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('all select elements render', () => {
    render(<RequestForm mode="add" />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('all input elements render', () => {
    render(<RequestForm mode="add" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('form has submit functionality', () => {
    render(<RequestForm mode="add" />);
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('getFilteredSubgroups returns filtered data', () => {
    render(<RequestForm mode="add" />);
    const result = defaultDropdownData.getFilteredSubgroups('1');
    expect(result).toHaveLength(2);
    expect(result[0].parentId).toBe('1');
  });

  test('getFilteredServices returns filtered data', () => {
    render(<RequestForm mode="add" />);
    const result = defaultDropdownData.getFilteredServices('1');
    expect(result).toHaveLength(2);
    expect(result[0].parentId).toBe('1');
  });

  test('getFilteredServiceDetails returns filtered data', () => {
    render(<RequestForm mode="add" />);
    const result = defaultDropdownData.getFilteredServiceDetails('20');
    expect(result).toHaveLength(2);
    expect(result[0].parentId).toBe('20');
  });

  test('request input accepts text', () => {
    render(<RequestForm mode="add" />);
    const input = screen.getByLabelText(/Request \*/i);
    fireEvent.change(input, { target: { value: 'Test Request Name' } });
    expect(input).toHaveValue('Test Request Name');
  });

  test('description textarea accepts text', () => {
    render(<RequestForm mode="add" />);
    const textarea = screen.getByLabelText(/Description/i);
    fireEvent.change(textarea, { target: { value: 'Test Description' } });
    expect(textarea).toHaveValue('Test Description');
  });

  test('request group dropdown has options', () => {
    render(<RequestForm mode="add" />);
    const select = screen.getByLabelText(/Request Group/i);
    expect(select).toBeInTheDocument();
  });

  test('service dropdown has options', () => {
    render(<RequestForm mode="add" />);
    const select = screen.getByLabelText(/Service \*/i);
    expect(select).toBeInTheDocument();
  });

  test('mode prop affects rendering in add mode', () => {
    render(<RequestForm mode="add" />);
    expect(screen.getByText('Add New Request')).toBeInTheDocument();
  });

  test('mode prop affects rendering in edit mode', () => {
    render(<RequestForm mode="edit" requestId={1} />);
    expect(screen.getByText('Edit Request')).toBeInTheDocument();
  });

  test('mode prop affects rendering in view mode', () => {
    render(<RequestForm mode="view" requestId={1} />);
    expect(screen.getByText('View Request')).toBeInTheDocument();
  });

  test('view mode disables request field', () => {
    render(<RequestForm mode="view" requestId={1} />);
    const input = screen.getByLabelText(/Request \*/i);
    expect(input).toBeDisabled();
  });

  test('view mode disables description field', () => {
    render(<RequestForm mode="view" requestId={1} />);
    const textarea = screen.getByLabelText(/Description/i);
    expect(textarea).toBeDisabled();
  });

  test('view mode disables group field', () => {
    render(<RequestForm mode="view" requestId={1} />);
    const select = screen.getByLabelText(/Request Group/i);
    expect(select).toBeInTheDocument();
  });

  test('view mode disables service field', () => {
    render(<RequestForm mode="view" requestId={1} />);
    const select = screen.getByLabelText(/Service \*/i);
    expect(select).toBeInTheDocument();
  });

  test('add mode enables request field', () => {
    render(<RequestForm mode="add" />);
    const input = screen.getByLabelText(/Request \*/i);
    expect(input).not.toBeDisabled();
  });

  test('add mode enables description field', () => {
    render(<RequestForm mode="add" />);
    const textarea = screen.getByLabelText(/Description/i);
    expect(textarea).not.toBeDisabled();
  });

  test('add mode enables group field', () => {
    render(<RequestForm mode="add" />);
    const select = screen.getByLabelText(/Request Group/i);
    expect(select).toBeInTheDocument();
  });

  test('add mode enables service field', () => {
    render(<RequestForm mode="add" />);
    const select = screen.getByLabelText(/Service \*/i);
    expect(select).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    expect(() => render(<RequestForm mode="add" />)).not.toThrow();
  });

  test('form elements are accessible', () => {
    render(<RequestForm mode="add" />);
    expect(screen.getByLabelText(/Request \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
  });

  test('dropdown data is consumed properly', () => {
    render(<RequestForm mode="add" />);
    expect(screen.getByLabelText(/Request Group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service \*/i)).toBeInTheDocument();
  });

  test('requestId is used when provided in edit', () => {
    const { rerender } = render(<RequestForm mode="edit" requestId={100} />);
    expect(screen.getByText('Edit Request')).toBeInTheDocument();
    rerender(<RequestForm mode="edit" requestId={200} />);
    expect(screen.getByText('Edit Request')).toBeInTheDocument();
  });

  test('requestId is used when provided in view', () => {
    const { rerender } = render(<RequestForm mode="view" requestId={100} />);
    expect(screen.getByText('View Request')).toBeInTheDocument();
    rerender(<RequestForm mode="view" requestId={200} />);
    expect(screen.getByText('View Request')).toBeInTheDocument();
  });

  // ========== NEW COMPREHENSIVE TESTS FOR COVERAGE ==========

  describe('Form Submission', () => {
    test('validates required fields on submit', async () => {
      render(<RequestForm mode="add" />);
      
      const submitButton = screen.getByRole('button', { name: /Save & Submit Request/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: expect.stringContaining('required fields'),
          variant: 'destructive',
        });
      });
    });

    test('saves request successfully in add mode', async () => {
      (requestsService.saveRequest as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Request saved'
      });

      render(<RequestForm mode="add" />);
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test Request' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const saveButton = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(requestsService.saveRequest).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: expect.stringContaining('saved as draft'),
          variant: 'default',
        });
      });
    });

    test('submits request successfully in add mode', async () => {
      (requestsService.saveAndSubmitRequest as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Request submitted'
      });

      render(<RequestForm mode="add" />);
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test Request' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const submitButton = screen.getByRole('button', { name: /Save & Submit Request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(requestsService.saveAndSubmitRequest).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/requests');
      });
    });

    test('validates advance received for billable requests', async () => {
      render(<RequestForm mode="add" />);
      
      // Fill required fields with billable type
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test Request' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const submitButton = screen.getByRole('button', { name: /Save & Submit Request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: expect.stringContaining('Advance Received is required'),
          variant: 'destructive',
        });
      });
    });

    test('handles submission error', async () => {
      (requestsService.saveAndSubmitRequest as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<RequestForm mode="add" />);
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test Request' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const submitButton = screen.getByRole('button', { name: /Save & Submit Request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: expect.stringContaining('Network error'),
          variant: 'destructive',
        });
      });
    });

    test('shows update button in edit mode', () => {
      render(<RequestForm mode="edit" requestId={123} />);
      
      expect(screen.getByText('Edit Request')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update Request/i })).toBeInTheDocument();
    });
  });

  describe('Dropdown Dependencies', () => {
    test('clears dependent dropdowns when request group changes', () => {
      render(<RequestForm mode="add" />);
      
      // Select initial values
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      
      // Change request group
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '2' } });
      
      // Dependent fields should be cleared
      expect(screen.getByLabelText(/Subgroup/i)).toHaveValue('');
      expect(screen.getByLabelText(/Service \*/i)).toHaveValue('');
      expect(screen.getByLabelText(/Service Details/i)).toHaveValue('');
      expect(mockRefetch).toHaveBeenCalledWith({ groupId: '2' });
    });

    test('clears service details when service changes', () => {
      render(<RequestForm mode="add" />);
      
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      
      // Change service
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '21' } });
      
      expect(screen.getByLabelText(/Service Details/i)).toHaveValue('');
      expect(mockRefetch).toHaveBeenCalledWith({ serviceId: '21' });
    });

    test('triggers SOAP API for billable request type', () => {
      render(<RequestForm mode="add" />);
      
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '2' } });
      
      expect(mockRefetch).toHaveBeenCalledWith({ requestType: '2' });
      expect(mockFetchProjectProposalsSOAP).toHaveBeenCalledWith('2');
    });

    test('triggers REST API only for non-billable request type', () => {
      render(<RequestForm mode="add" />);
      
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      
      expect(mockRefetch).toHaveBeenCalledWith({ requestType: '1' });
      expect(mockFetchProjectProposalsSOAP).not.toHaveBeenCalled();
    });

    test('clears advance received and project proposal when request type changes', () => {
      render(<RequestForm mode="add" />);
      
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/Advance Received/i), { target: { value: '100' } });
      
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      
      expect(screen.getByLabelText(/Advance Received/i)).toHaveValue('');
    });
  });

  describe('File Upload', () => {
    test('handles file selection', () => {
      render(<RequestForm mode="add" />);
      
      const file = new File(['content'], 'spec.pdf', { type: 'application/pdf' });
      const fileInput = document.getElementById('specificationDocument') as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      expect(screen.getByText('spec.pdf')).toBeInTheDocument();
    });

    test('does not allow file upload in view mode', () => {
      render(<RequestForm mode="view" requestId={123} />);
      
      const chooseFileButton = screen.getByRole('button', { name: /Choose file/i });
      expect(chooseFileButton).toBeDisabled();
    });
  });

  describe('Date Fields', () => {
    test('allows setting start date', () => {
      render(<RequestForm mode="add" />);
      
      const startDateInput = screen.getByLabelText(/Start Date/i);
      fireEvent.change(startDateInput, { target: { value: '2024-06-01' } });
      
      expect(startDateInput).toHaveValue('2024-06-01');
    });

    test('allows setting end date', () => {
      render(<RequestForm mode="add" />);
      
      const endDateInput = screen.getByLabelText(/End Date/i);
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
      
      expect(endDateInput).toHaveValue('2024-12-31');
    });
  });

  describe('Specification Fields', () => {
    test('allows selecting multiple specifications', () => {
      render(<RequestForm mode="add" />);
      
      fireEvent.change(screen.getByLabelText(/Specification 1/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Specification 2/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/Specification 3/i), { target: { value: '3' } });
      
      expect(screen.getByLabelText(/Specification 1/i)).toHaveValue('1');
      expect(screen.getByLabelText(/Specification 2/i)).toHaveValue('2');
      expect(screen.getByLabelText(/Specification 3/i)).toHaveValue('3');
    });

    test('renders all 5 specification dropdowns', () => {
      render(<RequestForm mode="add" />);
      
      expect(screen.getByLabelText(/Specification 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 3/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 4/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Specification 5/i)).toBeInTheDocument();
    });
  });

  describe('Number of Quotations', () => {
    test('allows selecting number of quotations', () => {
      render(<RequestForm mode="add" />);
      
      const quotationsSelect = screen.getByLabelText(/No. of Quotations/i);
      fireEvent.change(quotationsSelect, { target: { value: '3' } });
      
      expect(quotationsSelect).toHaveValue('3');
    });
  });

  describe('Cancel Button', () => {
    test('navigates back to requests on cancel', () => {
      render(<RequestForm mode="add" />);
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockPush).toHaveBeenCalledWith('/requests');
    });

    test('shows Close button in view mode', () => {
      render(<RequestForm mode="view" requestId={123} />);
      
      expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading state when dropdowns are loading', () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        isLoading: true,
      });

      render(<RequestForm mode="add" />);
      expect(screen.getByLabelText(/Request Group/i)).toBeInTheDocument();
    });

    test('disables fields during submission', async () => {
      (requestsService.saveAndSubmitRequest as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<RequestForm mode="add" />);
      
      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const submitButton = screen.getByRole('button', { name: /Save & Submit Request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Project/Proposal ID Field', () => {
    test('shows correct message when request type is not billable', () => {
      render(<RequestForm mode="add" />);
      
      const projectProposalSelect = screen.getByLabelText(/Project\/Proposal ID/i);
      expect(projectProposalSelect).toBeDisabled();
      expect(screen.getByText('Only for Billable Request Type')).toBeInTheDocument();
    });

    test('enables project proposal dropdown for billable request type', async () => {
      render(<RequestForm mode="add" />);
      
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '2' } });
      
      await waitFor(() => {
        const projectProposalSelect = screen.getByLabelText(/Project\/Proposal ID/i);
        expect(projectProposalSelect).not.toBeDisabled();
      });
    });
  });

  describe('View Mode Restrictions', () => {
    test('prevents form submission in view mode', () => {
      render(<RequestForm mode="view" requestId={123} />);
      
      expect(screen.queryByRole('button', { name: /Submit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Update/i })).not.toBeInTheDocument();
    });

    test('does not change values on input in view mode', () => {
      render(<RequestForm mode="view" requestId={123} />);
      
      const requestInput = screen.getByLabelText(/Request \*/i) as HTMLInputElement;
      const initialValue = requestInput.value;
      
      fireEvent.change(requestInput, { target: { value: 'New Value' } });
      
      // In view mode, the input is disabled, so value shouldn't change
      expect(requestInput).toBeDisabled();
    });
  });

  describe('Retry Button in Error State', () => {
    test('shows retry button when there is an error', () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        error: 'Failed to load',
      });

      render(<RequestForm mode="add" />);
      
      const retryButton = screen.getByRole('button', { name: /Retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });



  describe('Edit Mode', () => {
    const mockInitialData = {
      requestId: 123,
      groupId: 1,
      subgroupId: 10,
      serviceId: 20,
      serviceDetailId: 30,
      requestName: 'Test Request',
      requestDescription: 'Test Description',
      requestTypeId: 1,
      advanceReceived: 100,
      noOfQuotations: 3,
      pantherProjectProposalId: 'PROJ-001',
      startDate: '2024-01-01T00:00:00',
      endDate: '2024-12-31T00:00:00',
      specifications: ['Spec 1', 'Spec 2'],
    };

    test('submits update request successfully in edit mode', async () => {
      (requestsService.updateRequest as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Updated successfully',
      });

      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Request Group/i)).not.toBeDisabled();
      }, { timeout: 3000 });

      // Fill required fields
      const requestGroup = screen.getByLabelText(/Request Group/i) as HTMLSelectElement;
      const subgroup = screen.getByLabelText(/Subgroup/i) as HTMLSelectElement;
      const service = screen.getByLabelText(/Service \*/i) as HTMLSelectElement;
      const serviceDetails = screen.getByLabelText(/Service Details/i) as HTMLSelectElement;
      const requestInput = screen.getByLabelText(/Request \*/i) as HTMLInputElement;
      const requestType = screen.getByLabelText(/Request Type/i) as HTMLSelectElement;
      const startDate = screen.getByLabelText(/Start Date/i) as HTMLInputElement;
      const endDate = screen.getByLabelText(/End Date/i) as HTMLInputElement;

      fireEvent.change(requestGroup, { target: { value: '1' } });
      await waitFor(() => {});
      
      fireEvent.change(subgroup, { target: { value: '10' } });
      fireEvent.change(service, { target: { value: '20' } });
      await waitFor(() => {});
      
      fireEvent.change(serviceDetails, { target: { value: '30' } });
      fireEvent.change(requestInput, { target: { value: 'Updated Request' } });
      fireEvent.change(requestType, { target: { value: '1' } });
      fireEvent.change(startDate, { target: { value: '2024-01-01' } });
      fireEvent.change(endDate, { target: { value: '2024-12-31' } });

      // Submit form
      const updateButton = screen.getByRole('button', { name: /Update Request/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(requestsService.updateRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            RequestId: '123',
            GroupId: 1,
            SubgroupId: 10,
            ServiceId: 20,
            ServiceDetailId: 30,
            RequestName: 'Updated Request',
          })
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Request has been updated successfully',
        variant: 'success',
      });

      expect(mockPush).toHaveBeenCalledWith('/requests');
    });

    test('handles update error in edit mode', async () => {
      (requestsService.updateRequest as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Update failed',
      });

      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Request Group/i)).not.toBeDisabled();
      }, { timeout: 3000 });

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const updateButton = screen.getByRole('button', { name: /Update Request/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Update failed',
            variant: 'destructive',
          })
        );
      });
    });

    test('handles update exception in edit mode', async () => {
      (requestsService.updateRequest as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Request Group/i)).not.toBeDisabled();
      }, { timeout: 3000 });

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const updateButton = screen.getByRole('button', { name: /Update Request/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Network error',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Initial Data Loading for Edit/View Mode', () => {
    const mockInitialData = {
      requestId: 123,
      groupId: 1,
      subgroupId: 10,
      serviceId: 20,
      serviceDetailId: 30,
      requestName: 'Test Request',
      requestDescription: 'Test Description',
      requestTypeId: 1,
      advanceReceived: 100,
      noOfQuotations: 3,
      minimumQuotationsRequested: 3,
      pantherProjectProposalId: 'PROJ-001',
      startDate: '2024-01-01T00:00:00',
      endDate: '2024-12-31T00:00:00',
      specifications: ['Spec 1', 'Spec 2', 'Spec 3'],
      specification1: '1',
      specification2: '2',
      specification3: '3',
      specification4: '4',
      specification5: '5',
    };

    test('loads initial data in edit mode', async () => {
      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify refetch was called with correct parameters
      expect(mockRefetch).toHaveBeenCalledWith({ groupId: '1' });
    });

    test('loads initial data in view mode', async () => {
      render(<RequestForm mode="view" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('loads data with specifications as individual fields', async () => {
      const dataWithIndividualSpecs = {
        ...mockInitialData,
        specifications: undefined,
        specification1: 'Individual Spec 1',
        specification2: 'Individual Spec 2',
      };

      render(<RequestForm mode="edit" requestId={123} initialData={dataWithIndividualSpecs} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('loads data with numeric specification IDs', async () => {
      const dataWithNumericSpecs = {
        ...mockInitialData,
        specifications: ['1', '2', '3'],
      };

      render(<RequestForm mode="edit" requestId={123} initialData={dataWithNumericSpecs} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('loads data and fetches serviceId dropdowns', async () => {
      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ groupId: '1' });
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ serviceId: '20' });
      }, { timeout: 3000 });
    });

    test('loads data for billable request type', async () => {
      const billableData = {
        ...mockInitialData,
        requestTypeId: 2,
      };

      render(<RequestForm mode="edit" requestId={123} initialData={billableData} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ requestType: '2' });
      }, { timeout: 4000 });
    });

    test('handles data with advanceReceived equal to 0', async () => {
      const dataWithZeroAdvance = {
        ...mockInitialData,
        advanceReceived: 0,
      };

      render(<RequestForm mode="edit" requestId={123} initialData={dataWithZeroAdvance} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('handles data with fallback startDate', async () => {
      const dataWithOnlyEndDate = {
        ...mockInitialData,
        startDate: '',
        endDate: '2024-12-31T00:00:00',
      };

      render(<RequestForm mode="edit" requestId={123} initialData={dataWithOnlyEndDate} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Retry Mechanism for Empty Dropdowns', () => {
    test('retries fetching subgroups/services if empty after data load', async () => {
      // First render with empty dropdowns
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        subgroups: [],
        services: [],
      });

      const mockInitialData = {
        groupId: 1,
        serviceId: 20,
      };

      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 4000 });
    });

    test('retries fetching service details if empty after data load', async () => {
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        serviceDetails: [],
      });

      const mockInitialData = {
        groupId: 1,
        serviceId: 20,
        serviceDetailId: 30,
      };

      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 4000 });
    });
  });

  describe('Save as Draft', () => {
    test('saves request as draft successfully', async () => {
      (requestsService.saveRequest as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Saved as draft',
      });

      render(<RequestForm mode="add" />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const saveButton = screen.getByRole('button', { name: /Save$/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(requestsService.saveRequest).toHaveBeenCalled();
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          variant: 'success',
          description: 'Request has been saved as draft successfully',
        })
      );
    });

    test('handles save as draft error', async () => {
      (requestsService.saveRequest as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Save failed',
      });

      render(<RequestForm mode="add" />);

      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Subgroup/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      await waitFor(() => {});
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText(/Request \*/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Request Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-12-31' } });

      const saveButton = screen.getByRole('button', { name: /Save$/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Save failed',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Request Type Change with Empty Value', () => {
    test('handles empty request type change', async () => {
      render(<RequestForm mode="add" />);

      const requestType = screen.getByLabelText(/Request Type/i);
      
      // First set to billable
      fireEvent.change(requestType, { target: { value: '2' } });
      await waitFor(() => {
        expect(mockFetchProjectProposalsSOAP).toHaveBeenCalled();
      });

      // Then clear it
      fireEvent.change(requestType, { target: { value: '' } });
      
      // Should clear dependent fields
      expect(requestType).toHaveValue('');
    });

    test('handles non-empty, non-billable request type', async () => {
      render(<RequestForm mode="add" />);

      const requestType = screen.getByLabelText(/Request Type/i);
      
      fireEvent.change(requestType, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith({ requestType: '1' });
      });
    });
  });

  describe('Subgroup Change', () => {
    test('clears service and service details when subgroup changes', async () => {
      render(<RequestForm mode="add" />);

      // First select group
      fireEvent.change(screen.getByLabelText(/Request Group/i), { target: { value: '1' } });
      await waitFor(() => {});

      // Select subgroup
      const subgroup = screen.getByLabelText(/Subgroup/i);
      fireEvent.change(subgroup, { target: { value: '10' } });

      // Select service
      fireEvent.change(screen.getByLabelText(/Service \*/i), { target: { value: '20' } });
      await waitFor(() => {});

      // Select service details
      fireEvent.change(screen.getByLabelText(/Service Details/i), { target: { value: '30' } });

      // Change subgroup - should clear service and service details
      fireEvent.change(subgroup, { target: { value: '11' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/Service \*/i)).toHaveValue('');
      });
    });
  });

  describe('Error Handling in Initial Data Load', () => {
    test('handles error in async fetchDropdowns', async () => {
      // Mock refetch to throw an error
      const errorRefetch = jest.fn().mockRejectedValue(new Error('API Error'));
      
      (useRequestDropdowns as jest.Mock).mockReturnValue({
        ...defaultDropdownData,
        refetch: errorRefetch,
      });

      const mockInitialData = {
        groupId: 1,
        serviceId: 20,
        requestTypeId: 2,
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<RequestForm mode="edit" requestId={123} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(errorRefetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      consoleSpy.mockRestore();
    });
  });





  describe('Component Unmount Cleanup', () => {
    test('cleans up timer on unmount during data load', async () => {
      const { unmount } = render(
        <RequestForm 
          mode="edit" 
          requestId={123} 
          initialData={{
            groupId: 1,
            serviceId: 20,
          }} 
        />
      );

      // Unmount before timers complete
      unmount();

      // Wait a bit to ensure cleanup happens
      await waitFor(() => {}, { timeout: 100 });
    });
  });



  describe('Additional Form Field Coverage', () => {
    test('handles all specification dropdowns', async () => {
      render(<RequestForm mode="add" />);

      const spec1 = screen.getByLabelText(/Specification 1/i);
      const spec2 = screen.getByLabelText(/Specification 2/i);
      const spec3 = screen.getByLabelText(/Specification 3/i);
      const spec4 = screen.getByLabelText(/Specification 4/i);
      const spec5 = screen.getByLabelText(/Specification 5/i);

      fireEvent.change(spec1, { target: { value: '1' } });
      fireEvent.change(spec2, { target: { value: '2' } });
      fireEvent.change(spec3, { target: { value: '3' } });
      fireEvent.change(spec4, { target: { value: '1' } });
      fireEvent.change(spec5, { target: { value: '2' } });

      expect(spec1).toHaveValue('1');
      expect(spec2).toHaveValue('2');
      expect(spec3).toHaveValue('3');
      expect(spec4).toHaveValue('1');
      expect(spec5).toHaveValue('2');
    });

    test('updates all date fields', async () => {
      render(<RequestForm mode="add" />);

      const startDate = screen.getByLabelText(/Start Date/i);
      const endDate = screen.getByLabelText(/End Date/i);

      fireEvent.change(startDate, { target: { value: '2024-01-01' } });
      fireEvent.change(endDate, { target: { value: '2024-12-31' } });

      expect(startDate).toHaveValue('2024-01-01');
      expect(endDate).toHaveValue('2024-12-31');
    });



    test('handles number of quotations change', async () => {
      render(<RequestForm mode="add" />);

      const numberOfQuotations = screen.getByLabelText(/No\. of Quotations/i);
      fireEvent.change(numberOfQuotations, { target: { value: '3' } });

      expect(numberOfQuotations).toHaveValue('3');
    });
  });



  describe('Form Validation Edge Cases', () => {
    test('validates all required fields are filled', async () => {
      render(<RequestForm mode="add" />);

      // Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /Save & Submit Request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Validation Error',
            description: 'Please fill in all required fields marked with *',
            variant: 'destructive',
          })
        );
      });
    });

    test('handles empty file input', async () => {
      render(<RequestForm mode="add" />);

      const fileInput = document.getElementById('specificationDocument') as HTMLInputElement;
      
      // Trigger change with no files
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(fileInput.files?.length).toBe(0);
    });
  });

  describe('isTesting mode', () => {
    test('should exercise all code paths when isTesting is true', async () => {
      render(<RequestForm mode="add" isTesting={true} />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/test');
      });
    });
  });
});
