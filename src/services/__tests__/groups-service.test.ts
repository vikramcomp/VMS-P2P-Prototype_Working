import { groupsService, getFormattedGroups, getFormattedRoles, getFormattedModules, getRoleData } from '../groups-service'
import { GroupSearchParams, AddGroupRequest, UpdateGroupRequest } from '@/types/groups'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch as any

// Mock EnhancedApiClient
jest.mock('../enhanced-api-client', () => ({
  EnhancedApiClient: {
    fetchWithTransform: jest.fn(),
    getResponseData: jest.fn((response) => response?.Data || response?.data),
    getRecords: jest.fn((response) => response?.Data?.Records || response?.data?.records || []),
  },
  ResponseUtils: {
    transformRecords: jest.fn((records, mapping) => records),
  },
}))

// Mock api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

// Mock response-transformer
jest.mock('@/utils/response-transformer', () => ({
  transformApiResponse: jest.fn((response) => response),
}))

describe('Groups Service', () => {
  const { EnhancedApiClient } = require('../enhanced-api-client')
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com'
  })

  describe('Service Instance', () => {
    it('should be defined as an instance', () => {
      expect(groupsService).toBeDefined()
      expect(typeof groupsService).toBe('object')
    })

    it('should have all required methods', () => {
      expect(groupsService.getGroups).toBeDefined()
      expect(groupsService.getGroupById).toBeDefined()
      expect(groupsService.addGroup).toBeDefined()
      expect(groupsService.updateGroup).toBeDefined()
      expect(groupsService.deleteGroup).toBeDefined()
      expect(groupsService.deleteMultipleGroups).toBeDefined()
      expect(groupsService.changeGroupStatus).toBeDefined()
      expect(groupsService.getGroupsLookup).toBeDefined()
      expect(groupsService.getRolesLookup).toBeDefined()
      expect(groupsService.getModulesLookup).toBeDefined()
      expect(groupsService.exportGroups).toBeDefined()
    })
  })

  describe('getGroups', () => {
    it('should fetch groups with default parameters', async () => {
      const mockResponse = {
        Data: {
          Records: [
            { CategoryId: 1, CategoryName: 'Test Group', CategoryDescription: 'Description', Status: 'Active' }
          ],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await groupsService.getGroups()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/groups/getgroups',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toBeDefined()
    })

    it('should fetch groups with search text', async () => {
      const mockResponse = {
        Data: {
          Records: [{ CategoryId: 1, CategoryName: 'Finance', CategoryDescription: 'Desc', Status: 'Active' }],
          TotalRecords: 1,
          TotalPages: 1
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const params: GroupSearchParams = { searchText: 'Finance' }
      await groupsService.getGroups(params)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.SearchText).toBe('Finance')
    })

    it('should handle page size "All"', async () => {
      const mockResponse = {
        Data: {
          Records: [],
          TotalRecords: 0
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await groupsService.getGroups({ pageSize: 'All' })

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.PageSize).toBe(1000)
      expect(callBody.IgnorePaging).toBe(true)
    })

    it('should return mock data when API returns invalid response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      })

      const result = await groupsService.getGroups()
      
      expect(result.Data).toBeDefined()
      expect(result.Data.Records).toBeInstanceOf(Array)
    })

    it('should return mock data on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

      const result = await groupsService.getGroups()
      
      expect(result.Data).toBeDefined()
      expect(result.Data.Records).toBeInstanceOf(Array)
    })

    it('should handle HTTP error status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      const result = await groupsService.getGroups()
      
      expect(result.Data).toBeDefined()
      expect(result.Data.Records).toBeInstanceOf(Array)
    })

    it('should apply sorting in mock data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await groupsService.getGroups({
        sortColumn: 'CategoryName',
        sortType: 'desc'
      })
      
      expect(result.Data.SortColumn).toBe('CategoryName')
      expect(result.Data.SortType).toBe('desc')
    })

    it('should apply search filter in mock data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await groupsService.getGroups({
        searchText: 'Finance'
      })
      
      const records = result.Data.Records
      expect(records.length).toBeGreaterThan(0)
    })

    it('should apply pagination in mock data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await groupsService.getGroups({
        pageNumber: 1,
        pageSize: 2
      })
      
      expect(result.Data.CurrentPage).toBe(1)
      expect(result.Data.PageSize).toBe(2)
    })
  })

  describe('transformApiDataToGroups', () => {
    it('should transform API response to groups array', () => {
      const apiResponse = {
        Data: {
          Records: [
            { CategoryId: 1, CategoryName: 'Test', CategoryDescription: 'Desc', Status: 'Active', StudioName: 'Studio A' }
          ]
        }
      }

      EnhancedApiClient.getRecords.mockReturnValueOnce(apiResponse.Data.Records)

      const result = groupsService.transformApiDataToGroups(apiResponse)

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(1)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
    })

    it('should return empty array for invalid records', () => {
      const apiResponse = { Data: { Records: null } }
      
      EnhancedApiClient.getRecords.mockReturnValueOnce(null)

      const result = groupsService.transformApiDataToGroups(apiResponse)

      expect(result).toEqual([])
    })
  })

  describe('calculatePaginationInfo', () => {
    it('should calculate pagination for numeric page size', () => {
      const result = groupsService.calculatePaginationInfo(25, 2, 10)

      expect(result.showingFrom).toBe(11)
      expect(result.showingTo).toBe(20)
      expect(result.totalPages).toBe(3)
    })

    it('should handle "All" page size', () => {
      const result = groupsService.calculatePaginationInfo(50, 1, 'All')

      expect(result.showingFrom).toBe(1)
      expect(result.showingTo).toBe(50)
      expect(result.totalPages).toBe(1)
    })

    it('should handle zero records', () => {
      const result = groupsService.calculatePaginationInfo(0, 1, 10)

      expect(result.showingFrom).toBe(0)
      expect(result.showingTo).toBe(0)
      expect(result.totalPages).toBe(1)
    })

    it('should handle last page with partial records', () => {
      const result = groupsService.calculatePaginationInfo(25, 3, 10)

      expect(result.showingFrom).toBe(21)
      expect(result.showingTo).toBe(25)
    })
  })

  describe('addGroup', () => {
    it('should add a new group successfully', async () => {
      const mockGroupData: AddGroupRequest = {
        CategoryName: 'New Group',
        CategoryDescription: 'Description',
        StudioId: 1
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ CategoryId: 123 }),
      })

      const result = await groupsService.addGroup(mockGroupData)

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/groups',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should return simulated success on network error', async () => {
      const mockGroupData: AddGroupRequest = {
        CategoryName: 'New Group',
        CategoryDescription: 'Description'
      }

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await groupsService.addGroup(mockGroupData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('simulated')
    })

    it('should handle API error', async () => {
      const mockGroupData: AddGroupRequest = {
        CategoryName: 'New Group',
        CategoryDescription: 'Description'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      })

      const result = await groupsService.addGroup(mockGroupData)

      expect(result.success).toBe(true)
    })
  })

  describe('getGroupById', () => {
    it('should fetch group by ID successfully', async () => {
      const mockGroup = {
        data: {
          Records: [{ CategoryId: 1, CategoryName: 'Test Group' }],
          TotalRecords: 1
        }
      }

      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockGroup)
      EnhancedApiClient.getResponseData.mockReturnValueOnce(mockGroup.data)

      const result = await groupsService.getGroupById(1)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should return mock data when API fails', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('Network error'))

      const result = await groupsService.getGroupById(1)

      expect(result.success).toBe(true)
      expect(result.message).toContain('mock data')
    })

    it('should return mock data for specific group IDs', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('404'))

      const result = await groupsService.getGroupById(2)

      expect(result).toBeDefined()
    })

    it('should handle group not found', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('404'))

      const result = await groupsService.getGroupById(999)

      expect(result).toBeDefined()
    })
  })

  describe('updateGroup', () => {
    it('should update group successfully', async () => {
      const mockUpdateData: UpdateGroupRequest = {
        CategoryName: 'Updated Group',
        CategoryDescription: 'Updated Description'
      }

      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({ success: true })

      const result = await groupsService.updateGroup(1, mockUpdateData)

      expect(result.success).toBe(true)
      expect(EnhancedApiClient.fetchWithTransform).toHaveBeenCalledWith(
        'https://api.test.com/groups/1',
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('should return simulated success on network error', async () => {
      const mockUpdateData: UpdateGroupRequest = {
        CategoryName: 'Updated Group'
      }

      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('Failed to fetch'))

      const result = await groupsService.updateGroup(1, mockUpdateData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('simulated')
    })
  })

  describe('deleteGroup', () => {
    it('should delete group successfully', async () => {
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({ success: true })

      const result = await groupsService.deleteGroup(1)

      expect(result.success).toBe(true)
    })

    it('should handle network error', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new TypeError('fetch failed'))

      const result = await groupsService.deleteGroup(1)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to delete group')
    })

    it('should fallback to POST method on 405 error', async () => {
      EnhancedApiClient.fetchWithTransform
        .mockRejectedValueOnce(new Error('405 Method Not Allowed'))
        .mockResolvedValueOnce({ success: true })

      const result = await groupsService.deleteGroup(1)

      expect(EnhancedApiClient.fetchWithTransform).toHaveBeenCalledTimes(2)
    })
  })

  describe('deleteMultipleGroups', () => {
    it('should delete multiple groups successfully', async () => {
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({ success: true })

      const result = await groupsService.deleteMultipleGroups([1, 2, 3])

      expect(result.success).toBe(true)
      expect(result.message).toContain('3 groups')
    })

    it('should handle single group deletion', async () => {
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({ success: true })

      const result = await groupsService.deleteMultipleGroups([1])

      expect(result.message).toContain('1 group')
    })

    it('should handle network error', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new TypeError('fetch failed'))

      const result = await groupsService.deleteMultipleGroups([1, 2])

      expect(result.success).toBe(false)
    })
  })

  describe('changeGroupStatus', () => {
    it('should activate groups successfully', async () => {
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({ success: true })

      const result = await groupsService.changeGroupStatus([1, 2], 1)

      expect(result.success).toBe(true)
      expect(result.message).toContain('activated')
    })

    it('should deactivate groups successfully', async () => {
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({ success: true })

      const result = await groupsService.changeGroupStatus([1, 2], 0)

      expect(result.success).toBe(true)
      expect(result.message).toContain('deactivated')
    })

    it('should handle network error', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new TypeError('fetch failed'))

      const result = await groupsService.changeGroupStatus([1], 1)

      expect(result.success).toBe(false)
    })
  })

  describe('getGroupsLookup', () => {
    it('should fetch groups lookup successfully', async () => {
      const mockData = { items: [] }
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockData)

      const result = await groupsService.getGroupsLookup()

      expect(result).toBeDefined()
    })

    it('should return default value on error', async () => {
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API error'))

      const result = await groupsService.getGroupsLookup()
      
      expect(result).toBeDefined()
      expect(result.data).toBeDefined()
      expect(result.data.records).toEqual([])
    })
  })

  describe('getRolesLookup', () => {
    it('should fetch roles lookup successfully', async () => {
      const mockData = { items: [] }
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockData)

      const result = await groupsService.getRolesLookup()

      expect(result).toBeDefined()
    })
  })

  describe('getModulesLookup', () => {
    it('should fetch modules lookup successfully', async () => {
      const mockData = { items: [] }
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockData)

      const result = await groupsService.getModulesLookup()

      expect(result).toBeDefined()
    })
  })

  describe('exportGroups', () => {
    it('should export groups as blob', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => 'application/vnd.ms-excel'
        },
        blob: async () => mockBlob,
      })

      const result = await groupsService.exportGroups()

      expect(result).toBeInstanceOf(Blob)
    })

    it('should handle export error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Export failed',
      })

      await expect(groupsService.exportGroups()).rejects.toThrow('Export failed')
    })
  })

  describe('Helper Functions', () => {
    describe('getFormattedGroups', () => {
      it('should format groups from data.records', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({
          data: {
            records: [
              { value: 1, text: 'Group 1' },
              { value: 2, text: 'Group 2' }
            ]
          }
        })

        const result = await getFormattedGroups()

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ id: 1, name: 'Group 1' })
      })

      it('should handle direct array response', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce([
          { value: 1, text: 'Group 1' }
        ])

        const result = await getFormattedGroups()

        expect(result).toHaveLength(1)
      })

      it('should handle PascalCase Data.Records', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({
          Data: {
            Records: [{ Value: 1, Text: 'Group 1' }]
          }
        })

        const result = await getFormattedGroups()

        expect(result).toHaveLength(1)
      })

      it('should handle empty response', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({})

        const result = await getFormattedGroups()

        expect(result).toEqual([])
      })

      it('should handle error', async () => {
        EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API error'))

        const result = await getFormattedGroups()

        expect(result).toEqual([])
      })
    })

    describe('getFormattedRoles', () => {
      it('should format roles from data.records', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({
          data: {
            records: [{ roleId: 1, roleName: 'Admin' }]
          }
        })

        const result = await getFormattedRoles()

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Admin')
      })

      it('should handle error', async () => {
        EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API error'))

        const result = await getFormattedRoles()

        expect(result).toEqual([])
      })
    })

    describe('getFormattedModules', () => {
      it('should filter and format active modules', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({
          data: {
            records: [
              { moduleId: 1, moduleName: 'Module 1', status: 1 },
              { moduleId: 2, moduleName: 'Module 2', status: 0 },
              { moduleId: 3, moduleName: 'Module 3', status: 1 }
            ]
          }
        })

        const result = await getFormattedModules()

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('Module 1')
        expect(result[1].name).toBe('Module 3')
      })

      it('should handle PascalCase Status', async () => {
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce({
          Data: {
            Records: [
              { ModuleId: 1, ModuleName: 'Module 1', Status: 1 }
            ]
          }
        })

        const result = await getFormattedModules()

        expect(result).toHaveLength(1)
      })

      it('should handle error', async () => {
        EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API error'))

        const result = await getFormattedModules()

        expect(result).toEqual([])
      })
    })

    describe('getRoleData', () => {
      it('should fetch role data successfully', async () => {
        const mockData = { roles: [] }
        EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockData)

        const result = await getRoleData()

        expect(result).toBeDefined()
      })

      it('should handle error', async () => {
        EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API error'))

        await expect(getRoleData()).rejects.toThrow()
      })
    })
  })
})
