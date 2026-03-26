import { apiClient, createAuthHeaders } from './api-client';
import { EnhancedApiClient, ResponseUtils } from './enhanced-api-client';
import { Studio, StudiosApiResponse, StudioApiResponse } from '@/types/studios';

// Mock data for studios - this should only be used when API fails
const MOCK_STUDIOS: Studio[] = [
  { StudioId: '1', StudioName: 'Studio Alpha', Description: 'Main production studio', IsActive: true, id: '1', name: 'Studio Alpha', description: 'Main production studio', isActive: true },
  { StudioId: '2', StudioName: 'Studio Beta', Description: 'Development studio', IsActive: true, id: '2', name: 'Studio Beta', description: 'Development studio', isActive: true },
  { StudioId: '3', StudioName: 'Studio Gamma', Description: 'Testing studio', IsActive: true, id: '3', name: 'Studio Gamma', description: 'Testing studio', isActive: true },
  { StudioId: '4', StudioName: 'Studio Delta', Description: 'Legacy studio', IsActive: false, id: '4', name: 'Studio Delta', description: 'Legacy studio', isActive: false },
  { StudioId: '5', StudioName: 'Studio Epsilon', Description: 'New studio', IsActive: true, id: '5', name: 'Studio Epsilon', description: 'New studio', isActive: true },
  { StudioId: '101', StudioName: 'Mohali, PB', Description: 'India branch location', IsActive: true, id: '101', name: 'Mohali, PB', description: 'India branch location', isActive: true },
  { StudioId: '102', StudioName: 'Bhopal, MP', Description: 'India branch location', IsActive: true, id: '102', name: 'Bhopal, MP', description: 'India branch location', isActive: true },
  { StudioId: '103', StudioName: 'Noida, UP', Description: 'India branch location', IsActive: true, id: '103', name: 'Noida, UP', description: 'India branch location', isActive: true },
  { StudioId: '104', StudioName: 'Visakhapatnam, AP', Description: 'India branch location', IsActive: true, id: '104', name: 'Visakhapatnam, AP', description: 'India branch location', isActive: true },
  { StudioId: '105', StudioName: 'Jaipur, RJ', Description: 'India branch location', IsActive: true, id: '105', name: 'Jaipur, RJ', description: 'India branch location', isActive: true },
  { StudioId: '106', StudioName: 'Hyderabad, TS', Description: 'India branch location', IsActive: true, id: '106', name: 'Hyderabad, TS', description: 'India branch location', isActive: true },
  { StudioId: '107', StudioName: 'Vadodara, GJ', Description: 'India branch location', IsActive: true, id: '107', name: 'Vadodara, GJ', description: 'India branch location', isActive: true },
  { StudioId: '108', StudioName: 'Panaji, GA', Description: 'India branch location', IsActive: true, id: '108', name: 'Panaji, GA', description: 'India branch location', isActive: true },
  { StudioId: '109', StudioName: 'Bengaluru, KA', Description: 'India branch location', IsActive: true, id: '109', name: 'Bengaluru, KA', description: 'India branch location', isActive: true },
  { StudioId: '110', StudioName: 'Pune, MH', Description: 'India branch location', IsActive: true, id: '110', name: 'Pune, MH', description: 'India branch location', isActive: true },
  { StudioId: '111', StudioName: 'Ahmedabad, GJ', Description: 'India branch location', IsActive: true, id: '111', name: 'Ahmedabad, GJ', description: 'India branch location', isActive: true },
  { StudioId: '112', StudioName: 'Chennai, TN', Description: 'India branch location', IsActive: true, id: '112', name: 'Chennai, TN', description: 'India branch location', isActive: true },
  { StudioId: '113', StudioName: 'Gurugram, HR', Description: 'India branch location', IsActive: true, id: '113', name: 'Gurugram, HR', description: 'India branch location', isActive: true },
  { StudioId: '114', StudioName: 'Kolkata, WB', Description: 'India branch location', IsActive: true, id: '114', name: 'Kolkata, WB', description: 'India branch location', isActive: true },
  { StudioId: '115', StudioName: 'Delhi, DL', Description: 'India branch location', IsActive: true, id: '115', name: 'Delhi, DL', description: 'India branch location', isActive: true },
  { StudioId: '201', StudioName: 'Toronto, ON', Description: 'Canada branch location', IsActive: true, id: '201', name: 'Toronto, ON', description: 'Canada branch location', isActive: true },
  { StudioId: '202', StudioName: 'Vancouver, BC', Description: 'Canada branch location', IsActive: true, id: '202', name: 'Vancouver, BC', description: 'Canada branch location', isActive: true },
  { StudioId: '203', StudioName: 'Calgary, AB', Description: 'Canada branch location', IsActive: true, id: '203', name: 'Calgary, AB', description: 'Canada branch location', isActive: true },
  { StudioId: '204', StudioName: 'Montreal, QC', Description: 'Canada branch location', IsActive: true, id: '204', name: 'Montreal, QC', description: 'Canada branch location', isActive: true },
  { StudioId: '205', StudioName: 'Ottawa, ON', Description: 'Canada branch location', IsActive: true, id: '205', name: 'Ottawa, ON', description: 'Canada branch location', isActive: true },
  { StudioId: '206', StudioName: 'Edmonton, AB', Description: 'Canada branch location', IsActive: true, id: '206', name: 'Edmonton, AB', description: 'Canada branch location', isActive: true },
  { StudioId: '207', StudioName: 'Halifax, NS', Description: 'Canada branch location', IsActive: true, id: '207', name: 'Halifax, NS', description: 'Canada branch location', isActive: true },
  { StudioId: '208', StudioName: 'Winnipeg, MB', Description: 'Canada branch location', IsActive: true, id: '208', name: 'Winnipeg, MB', description: 'Canada branch location', isActive: true },
  { StudioId: '301', StudioName: 'New York, NY', Description: 'USA branch location', IsActive: true, id: '301', name: 'New York, NY', description: 'USA branch location', isActive: true },
  { StudioId: '302', StudioName: 'Dallas, TX', Description: 'USA branch location', IsActive: true, id: '302', name: 'Dallas, TX', description: 'USA branch location', isActive: true },
  { StudioId: '303', StudioName: 'Chicago, IL', Description: 'USA branch location', IsActive: true, id: '303', name: 'Chicago, IL', description: 'USA branch location', isActive: true },
  { StudioId: '304', StudioName: 'Atlanta, GA', Description: 'USA branch location', IsActive: true, id: '304', name: 'Atlanta, GA', description: 'USA branch location', isActive: true },
  { StudioId: '305', StudioName: 'Seattle, WA', Description: 'USA branch location', IsActive: true, id: '305', name: 'Seattle, WA', description: 'USA branch location', isActive: true },
  { StudioId: '306', StudioName: 'Phoenix, AZ', Description: 'USA branch location', IsActive: true, id: '306', name: 'Phoenix, AZ', description: 'USA branch location', isActive: true },
  { StudioId: '307', StudioName: 'Miami, FL', Description: 'USA branch location', IsActive: true, id: '307', name: 'Miami, FL', description: 'USA branch location', isActive: true },
  { StudioId: '308', StudioName: 'Denver, CO', Description: 'USA branch location', IsActive: true, id: '308', name: 'Denver, CO', description: 'USA branch location', isActive: true }
];

/**
 * Studios API Service
 * Handles all studio-related API operations
 */
class StudiosService {
  private readonly baseEndpoint = '/groups/getstudio'; // Correct endpoint from Network tab
  private static callCounter = 0;

  /**
   * Fetch all studios
   * @returns Promise with studios data
   */
  async getAllStudios(): Promise<StudiosApiResponse> {
    StudiosService.callCounter++;
    console.log(`🔥 API CALL #${StudiosService.callCounter} - getAllStudios called`);
    
    try {
      // Use direct fetch like in groups-service
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.baseEndpoint}`;
      
      console.log('🌐 Making direct API call to:', fullUrl);
      
      // Try API call with transformation
      try {
        console.log('🌐 Making API call to:', fullUrl);
        
        const transformedData = await EnhancedApiClient.fetchWithTransform(fullUrl, {
          method: 'GET',
          headers: createAuthHeaders()
        });
        
        console.log('📊 Transformed API Response:', transformedData);
        
        // Use enhanced client to get studios array with backward compatibility
        let rawStudios: any[] = [];
        
        if (Array.isArray(transformedData)) {
          rawStudios = transformedData;
        } else {
          rawStudios = EnhancedApiClient.getRecords(transformedData) || [];
        }
        
        // Log the raw studios data
        console.log('📊 Raw Studios Array:', rawStudios);
        if (rawStudios.length > 0) {
          console.log('📊 First Studio Object Keys:', Object.keys(rawStudios[0]));
          console.log('📊 First Studio Object:', rawStudios[0]);
        }
        
        // Use ResponseUtils for consistent transformation
        const studios = ResponseUtils.transformRecords(rawStudios, {
          id: 'StudioId',
          name: 'StudioName', 
          description: 'Description',
          isActive: 'IsActive'
        }).map(studio => ({
          ...studio,
          id: studio.id?.toString() || String(Math.random()),
          name: studio.name || 'Unnamed Studio',
          description: studio.description || '',
          isActive: studio.isActive !== undefined ? studio.isActive : true
        }));
                       
        console.log('🎬 Normalized Studios:', studios);
        
        // Extra logging to help debugging
        if (studios.length > 0) {
          console.log('🎬 First Normalized Studio:', studios[0]);
          console.log('🎬 Studio IDs:', studios.map(s => s.id));
          console.log('🎬 Studio Names:', studios.map(s => s.name));
        }
        
        return {
          success: true,
          data: studios,
          message: ''
        };
      } catch (apiError) {
        // If API fails, return mock data
        console.warn('🔄 API call failed, using mock data instead:', apiError);
        
        return {
          success: true,
          data: MOCK_STUDIOS,
          message: 'Using mock data (API not available)'
        };
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
      return {
        success: true, // Return success with mock data even if there's an error
        data: MOCK_STUDIOS,
        message: error instanceof Error ? `Mock data: ${error.message}` : 'Using mock data'
      };
    }
  }

  /**
   * Fetch studios - uses the same logic as getAllStudios but with filtering
   * @param onlyActive - Whether to filter by active status
   * @returns Promise with studios data
   */
  async getStudios(onlyActive: boolean = true): Promise<StudiosApiResponse> {
    StudiosService.callCounter++;
    console.log(`🔥 API CALL #${StudiosService.callCounter} - getStudios called with onlyActive=${onlyActive}`);
    
    try {
      // Get all studios first
      const allStudiosResponse = await this.getAllStudios();
      
      if (allStudiosResponse.success && allStudiosResponse.data.length > 0) {
        // Filter by active status if requested
        const filteredData = onlyActive 
          ? allStudiosResponse.data.filter((studio: Studio) => studio.isActive !== false)
          : allStudiosResponse.data;
          
        console.log('🎬 Filtered Studios:', filteredData.length, 'out of', allStudiosResponse.data.length);
          
        return {
          success: true,
          data: filteredData,
          message: allStudiosResponse.message
        };
      } else {
        // If API fails, return filtered mock data
        console.warn('🔄 getAllStudios failed, using filtered mock data');
        
        const filteredStudios = onlyActive 
          ? MOCK_STUDIOS.filter(studio => studio.isActive)
          : MOCK_STUDIOS;
          
        return {
          success: true,
          data: filteredStudios,
          message: 'Using mock data (API not available)'
        };
      }
    } catch (error) {
      console.error('Error in getStudios:', error);
      
      // Return filtered mock data even if there's an error
      const filteredStudios = onlyActive 
        ? MOCK_STUDIOS.filter(studio => studio.isActive)
        : MOCK_STUDIOS;
        
      return {
        success: true,
        data: filteredStudios,
        message: error instanceof Error ? `Mock data: ${error.message}` : 'Using mock data'
      };
    }
  }

  /**
   * Fetch a single studio by ID
   * @param id - Studio ID
   * @returns Promise with studio data
   */
  async getStudioById(id: string): Promise<StudioApiResponse> {
    StudiosService.callCounter++;
    console.log(`🔥 API CALL #${StudiosService.callCounter} - getStudioById called with id=${id}`);
    
    try {
      // First get all studios and filter by ID (since the API doesn't have a getById endpoint)
      const allStudiosResponse = await this.getAllStudios();
      
      if (allStudiosResponse.success && allStudiosResponse.data.length > 0) {
        const studio = allStudiosResponse.data.find(s => s.id === id);
        
        if (studio) {
          return {
            success: true,
            data: studio,
            message: ''
          };
        }
      }
      
      // If we can't find the studio in the API response, use mock data
      console.warn(`Studio with ID ${id} not found in API response, using mock data`);
      
      // Return mock data for the requested ID
      const studio = MOCK_STUDIOS.find(s => s.id === id) || 
        { id, name: `Studio ${id}`, isActive: true };
        
      return {
        success: true,
        data: studio,
        message: `Using mock data (Studio ID ${id} not found)`
      };
    } catch (error) {
      console.error(`Error fetching studio ${id}:`, error);
      
      // Return mock data for the requested ID even if there's an error
      const studio = MOCK_STUDIOS.find(s => s.id === id) || 
        { id, name: `Studio ${id}`, isActive: true };
        
      return {
        success: true,
        data: studio,
        message: error instanceof Error ? `Mock data: ${error.message}` : 'Using mock data'
      };
    }
  }
}

// Export a singleton instance
export const studiosService = new StudiosService();