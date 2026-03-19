import { useState, useEffect, useCallback } from 'react';
import { studiosService } from '@/services/studios-service';
import { Studio } from '@/types/studios';

interface UseStudiosState {
  studios: Studio[];
  loading: boolean;
  error: string | null;
}

interface UseStudiosReturn extends UseStudiosState {
  fetchStudios: (activeOnly?: boolean) => Promise<void>;
  refreshStudios: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing studios state and API operations
 * @param activeOnly - Whether to fetch only active studios (default: true)
 * @returns Studio state and operations
 */
export function useStudios(activeOnly: boolean = true): UseStudiosReturn {
  const [state, setState] = useState<UseStudiosState>({
    studios: [],
    loading: false,
    error: null
  });

  /**
   * Fetch studios from API
   * @param activeOnly - Whether to fetch only active studios
   */
  const fetchStudios = useCallback(async (activeOnly: boolean = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 useStudios: Calling studiosService.getStudios');
      const response = await studiosService.getStudios(activeOnly);
      console.log('🔍 useStudios: Response received', response);
      
      if (response.success) {
        console.log('🔍 useStudios: API call successful, data:', response.data);
        
        // Additional validation to ensure we have valid studio objects with required properties
        const validStudios = response.data.filter((studio: any) => {
          // Check if studio has either a name or StudioName property
          const hasName = !!(studio.name || studio.StudioName || studio.studioname || studio.Name);
          // Check if studio has either an id or StudioId property
          const hasId = !!(studio.id || studio.StudioId || studio.studioid);
          
          // Only include studios with both a name and id
          return hasName && hasId;
        });
        
        console.log('🔍 useStudios: Valid studios after filtering:', validStudios.length);
        
        setState(prev => ({ 
          ...prev, 
          studios: validStudios,
          loading: false 
        }));
      } else {
        console.log('🔍 useStudios: API call failed', response.message);
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to fetch studios',
          loading: false 
        }));
      }
    } catch (error) {
      console.error('🔍 useStudios: Exception caught', error);
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while fetching studios',
        loading: false 
      }));
    }
  }, []);

  /**
   * Refresh studios data with current settings
   */
  const refreshStudios = useCallback(async () => {
    await fetchStudios(activeOnly);
  }, [fetchStudios, activeOnly]);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load studios on mount
  useEffect(() => {
    fetchStudios(activeOnly);
  }, [fetchStudios, activeOnly]);

  return {
    ...state,
    fetchStudios,
    refreshStudios,
    clearError
  };
}