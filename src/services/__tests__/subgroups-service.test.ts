import { subgroupsService } from '../subgroups-service';
import { 
  SubgroupsSearchParams, 
  AddSubgroupRequest,
  UpdateSubgroupRequest 
} from '@/types/subgroups';

// Mock fetch globally
global.fetch = jest.fn();

// Mock auth-service
jest.mock('../auth-service', () => ({
  authService: {
    getToken: jest.fn(() => 'test-token'),
  },
}));

describe('SubgroupsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://api.test';
  });

  describe('getSubgroups', () => {
    it('should fetch subgroups with default parameters', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              SubgroupId: 1,
              SubgroupName: 'Amazon AWS',
              SubgroupDescription: 'Cloud Services',
              Status: 1
            }
          ],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1,
          SortColumn: '',
          SortType: ''
        },
        Message: 'success',
        IsSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await subgroupsService.getSubgroups();

      expect(result.Data.Records).toHaveLength(1);
      expect(result.Data.Records[0].SubgroupName).toBe('Amazon AWS');
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        Data: {
          Records: [],
          TotalRecords: 50,
          TotalPages: 5,
          PageSize: 10,
          CurrentPage: 2,
          SortColumn: '',
          SortType: ''
        },
        IsSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const params: SubgroupsSearchParams = {
        pageNumber: 2,
        pageSize: 10
      };

      const result = await subgroupsService.getSubgroups(params);

      expect(result.Data.CurrentPage).toBe(2);
      expect(result.Data.PageSize).toBe(10);
    });

    it('should handle search term', async () => {
      const mockResponse = {
        Data: {
          Records: [
            { SubgroupId: 1, SubgroupName: 'Cloud', SubgroupDescription: 'Cloud', Status: 1 }
          ],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1
        },
        IsSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      await subgroupsService.getSubgroups({ searchTerm: 'Cloud' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('searchTerm=Cloud'),
        expect.any(Object)
      );
    });

    it('should handle "All" page size', async () => {
      const mockResponse = {
        Data: {
          Records: [],
          TotalRecords: 100,
          TotalPages: 1,
          PageSize: 1000,
          CurrentPage: 1
        },
        IsSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      await subgroupsService.getSubgroups({ pageSize: 'All' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=1000'),
        expect.any(Object)
      );
    });

    it('should handle camelCase response', async () => {
      const mockResponse = {
        data: {
          records: [
            { subgroupId: 1, subgroupName: 'Test', subgroupDescription: 'Desc', status: 1 }
          ],
          totalRecords: 1,
          currentPage: 1,
          pageSize: 10
        },
        isSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await subgroupsService.getSubgroups();

      expect(result.Data.Records[0].SubgroupName).toBe('Test');
    });

    it('should fallback to mock data on 500 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      const result = await subgroupsService.getSubgroups();

      expect(result.Data.Records.length).toBeGreaterThan(0);
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle network error with mock fallback', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await subgroupsService.getSubgroups();

      expect(result.Data.Records.length).toBeGreaterThan(0);
    });
  });

  describe('addSubgroup', () => {
    it('should add subgroup successfully', async () => {
      const mockResponse = {
        success: true,
        data: { SubgroupId: 1 }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const subgroupData: AddSubgroupRequest = {
        SubgroupName: 'New Subgroup',
        SubgroupDescription: 'Description',
        Status: 1
      };

      const result = await subgroupsService.addSubgroup(subgroupData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
    });

    it('should handle add errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad request')
      });

      const result = await subgroupsService.addSubgroup({
        SubgroupName: 'Test',
        SubgroupDescription: 'Desc',
        Status: 1
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getSubgroupById', () => {
    it('should fetch subgroup by ID', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              SubgroupId: 22,
              SubgroupName: 'Amazon AWS',
              SubgroupDescription: 'Cloud',
              Status: 1
            }
          ]
        },
        IsSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await subgroupsService.getSubgroupById(22);

      expect(result.Data.SubgroupId).toBe(22);
      expect(result.Data.SubgroupName).toBe('Amazon AWS');
    });

    it('should handle direct data structure', async () => {
      const mockResponse = {
        Data: {
          SubgroupId: 30,
          SubgroupName: 'Amenities',
          SubgroupDescription: 'Desc',
          Status: 1
        },
        IsSuccess: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await subgroupsService.getSubgroupById(30);

      expect(result.Data.SubgroupName).toBe('Amenities');
    });

    it('should fallback to mock data on 500 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      const result = await subgroupsService.getSubgroupById(22);

      expect(result.Data.SubgroupId).toBe(22);
      expect(result.IsSuccess).toBe(true);
    });
  });

  describe('updateSubgroup', () => {
    it('should update subgroup successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      const updateData: UpdateSubgroupRequest = {
        SubgroupName: 'Updated Name',
        SubgroupDescription: 'Updated Desc',
        Status: 1
      };

      const result = await subgroupsService.updateSubgroup(1, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('updated successfully');
    });

    it('should handle update errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not found')
      });

      const result = await subgroupsService.updateSubgroup(999, {
        SubgroupName: 'Test',
        SubgroupDescription: 'Test',
        Status: 1
      });

      expect(result.success).toBe(false);
    });
  });

  describe('deleteSubgroup', () => {
    it('should delete subgroup successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      });

      const result = await subgroupsService.deleteSubgroup(1);

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });

    it('should handle delete errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error')
      });

      const result = await subgroupsService.deleteSubgroup(1);

      expect(result.success).toBe(false);
    });
  });

  describe('changeSubgroupStatus', () => {
    it('should activate subgroups', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      });

      const result = await subgroupsService.changeSubgroupStatus([1, 2], 1);

      expect(result.success).toBe(true);
      expect(result.message).toContain('activated');
    });

    it('should deactivate subgroup', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      });

      const result = await subgroupsService.changeSubgroupStatus([1], 0);

      expect(result.success).toBe(true);
      expect(result.message).toContain('deactivated');
    });

    it('should handle status change errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad request')
      });

      const result = await subgroupsService.changeSubgroupStatus([1], 1);

      expect(result.success).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should get status label', () => {
      expect(subgroupsService.getStatusLabel(1)).toBe('Active');
      expect(subgroupsService.getStatusLabel(0)).toBe('In-Active');
    });

    it('should get status display with className', () => {
      const activeStatus = subgroupsService.getStatusDisplay(1);
      expect(activeStatus.label).toBe('Active');
      expect(activeStatus.className).toContain('green');

      const inactiveStatus = subgroupsService.getStatusDisplay(0);
      expect(inactiveStatus.label).toBe('In-Active');
      expect(inactiveStatus.className).toContain('red');
    });
  });
});
