import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import ViewEditApprovalForm from '../view-edit-approval-form';
import { getFormattedGroups, getFormattedRequestTypes } from '@/services/groups-service';
import { subgroupsService } from '@/services/subgroups-service';
import { servicesService } from '@/services/services-service';
import { serviceDetailsService } from '@/services/service-details-service';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/services/groups-service', () => ({
  getFormattedGroups: jest.fn(),
  getFormattedRequestTypes: jest.fn(),
}));

jest.mock('@/services/subgroups-service', () => ({
  subgroupsService: {
    getSubgroupsByGroupId: jest.fn(),
  },
}));

jest.mock('@/services/services-service', () => ({
  servicesService: {
    getServices: jest.fn(),
  },
}));

jest.mock('@/services/service-details-service', () => ({
  serviceDetailsService: {
    getServiceDetails: jest.fn(),
  },
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

describe('ViewEditApprovalForm', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockInitialData = {
    requestNumber: 'REQ001',
    groupName: 'Test Group',
    subgroupName: 'Test Subgroup',
    projectProposalId: 'PROJ001',
    service: 'Test Service',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    serviceDetails: 'Test Service Detail',
    requestDescription: 'Test Description',
    requestTypeName: 'Type A',
    currencyId: 1,
  };

  const mockGroups = [
    { id: 1, name: 'Test Group' },
    { id: 2, name: 'Group 2' },
  ];

  const mockSubgroups = [
    { id: 1, name: 'Test Subgroup' },
    { id: 2, name: 'Subgroup 2' },
  ];

  const mockRequestTypes = [
    { id: 1, name: 'Type A' },
    { id: 2, name: 'Type B' },
  ];

  const mockServices = [
    { serviceId: 1, serviceName: 'Test Service' },
    { serviceId: 2, serviceName: 'Service 2' },
  ];

  const mockServiceDetails = [
    { serviceDetailsId: 1, serviceDetailsName: 'Test Service Detail' },
    { serviceDetailsId: 2, serviceDetailsName: 'Detail 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    (getFormattedGroups as jest.Mock).mockResolvedValue(mockGroups);
    (getFormattedRequestTypes as jest.Mock).mockResolvedValue(mockRequestTypes);
    (subgroupsService.getSubgroupsByGroupId as jest.Mock).mockResolvedValue(mockSubgroups);
    (servicesService.getServices as jest.Mock).mockResolvedValue({
      Data: { Records: mockServices },
    });
    (serviceDetailsService.getServiceDetails as jest.Mock).mockResolvedValue({
      Data: { Records: mockServiceDetails },
    });
  });

  describe('Initial Rendering', () => {
    it('renders the component with view mode by default', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('View Request Approval')).toBeInTheDocument();
      });
    });

    it('loads dropdown options on mount', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(getFormattedGroups).toHaveBeenCalled();
        expect(getFormattedRequestTypes).toHaveBeenCalled();
        expect(servicesService.getServices).toHaveBeenCalled();
      });
    });

    it('displays initial data after loading', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('REQ001')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('switches to edit mode when edit button is clicked', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Edit Request Approval')).toBeInTheDocument();
      });
    });

    it('enables form fields in edit mode', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      const groupSelect = screen.getByLabelText(/Request Group/i);
      expect(groupSelect).toBeDisabled();

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(groupSelect).not.toBeDisabled();
      });
    });

    it('shows action buttons in edit mode', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Reject')).toBeInTheDocument();
      });
    });
  });

  describe('Form Field Updates', () => {
    it('updates select dropdowns', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        const groupSelect = screen.getByLabelText(/Request Group/i);
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText(/Request Group/i);
      fireEvent.change(groupSelect, { target: { value: '2' } });

      expect(groupSelect).toHaveValue('2');
    });

    it('updates textarea fields', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      const descriptionTextarea = screen.getByLabelText(/Request Description/i);
      fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });

      expect(descriptionTextarea).toHaveValue('New description');
    });
  });

  describe('Dependent Dropdowns', () => {
    it('fetches subgroups when group changes', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        const groupSelect = screen.getByLabelText(/Request Group/i);
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText(/Request Group/i);
      fireEvent.change(groupSelect, { target: { value: '2' } });

      await waitFor(() => {
        expect(subgroupsService.getSubgroupsByGroupId).toHaveBeenCalledWith(2);
      });
    });

    it('fetches service details when service changes', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThan(0);
      });

      const selects = screen.getAllByRole('combobox');
      const serviceSelect = selects.find(select => select.getAttribute('id') === 'serviceId');
      expect(serviceSelect).toBeDefined();
      
      fireEvent.change(serviceSelect!, { target: { value: '2' } });

      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalled();
      });
    });

    it('resets subgroup when group changes', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        const groupSelect = screen.getByLabelText(/Request Group/i);
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText(/Request Group/i);
      fireEvent.change(groupSelect, { target: { value: '2' } });

      const subgroupSelect = screen.getByLabelText(/Subgroup/i);
      expect(subgroupSelect).toHaveValue('-1');
    });
  });

  describe('Cancel Functionality', () => {
    it('exits edit mode when cancel is clicked', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.getByText('View Request Approval')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('shows approve toast when approve is clicked', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Approve'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Approve Request',
          })
        );
      });
    });

    it('shows reject toast when reject is clicked', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Reject')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Reject'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reject Request',
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('calls router.back when back button is clicked', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Go back to Request Approvals/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText(/Go back to Request Approvals/i));

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('shows toast when groups fail to load', async () => {
      (getFormattedGroups as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to load groups',
            variant: 'destructive',
          })
        );
      });
    });

    it('shows toast when request types fail to load', async () => {
      (getFormattedRequestTypes as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to load request types',
            variant: 'destructive',
          })
        );
      });
    });

    it('shows toast when services fail to load', async () => {
      (servicesService.getServices as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to load services',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Data Population', () => {
    it('populates form with initial data', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('REQ001')).toBeInTheDocument();
        expect(screen.getByDisplayValue('PROJ001')).toBeInTheDocument();
      });
    });

    it('handles PascalCase API response', async () => {
      const pascalCaseData = {
        RequestNumber: 'REQ002',
        GroupName: 'Test Group',
        ProjectProposalId: 'PROJ002',
      };

      render(<ViewEditApprovalForm requestId={1} initialData={pascalCaseData} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('REQ002')).toBeInTheDocument();
      });
    });

    it('handles missing optional fields', async () => {
      const minimalData = {
        requestNumber: 'REQ003',
      };

      render(<ViewEditApprovalForm requestId={1} initialData={minimalData} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('REQ003')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly for input fields', async () => {
      const dataWithDates = {
        ...mockInitialData,
        startDate: '2025-01-15T10:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
      };

      render(<ViewEditApprovalForm requestId={1} initialData={dataWithDates} />);

      await waitFor(() => {
        const startDateInput = screen.getByLabelText(/Start Date/i);
        expect(startDateInput).toHaveValue('2025-01-15');
      });
    });
  });

  describe('Field Validation', () => {
    it('disables request number field', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={mockInitialData} />);

      await waitFor(() => {
        const requestNumberInput = screen.getByLabelText(/Request #/i);
        expect(requestNumberInput).toBeDisabled();
      });
    });

    it('disables subgroup when no group is selected', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={{}} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).toBeDisabled();
      });
    });

    it('disables service details when no service is selected', async () => {
      render(<ViewEditApprovalForm requestId={1} initialData={{}} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        const serviceDetailsSelect = screen.getByLabelText(/Service Details/i);
        expect(serviceDetailsSelect).toBeDisabled();
      });
    });
  });
});
