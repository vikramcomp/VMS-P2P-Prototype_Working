import { renderHook, act } from '@testing-library/react';
import { useToast } from '../use-toast';

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('toast', () => {
    it('should add a toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test'
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
      expect(result.current.toasts[0].description).toBe('This is a test');
    });

    it('should add toast with variant', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Success',
          description: 'Operation completed',
          variant: 'success'
        });
      });

      expect(result.current.toasts[0].variant).toBe('success');
    });

    it('should add destructive toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Error',
          description: 'Something went wrong',
          variant: 'destructive'
        });
      });

      expect(result.current.toasts[0].variant).toBe('destructive');
    });

    it('should add warning toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Warning',
          description: 'Please be careful',
          variant: 'warning'
        });
      });

      expect(result.current.toasts[0].variant).toBe('warning');
    });

    it('should limit toasts to TOAST_LIMIT', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Toast 1' });
        result.current.toast({ title: 'Toast 2' });
      });

      // Based on TOAST_LIMIT = 1 in the hook
      expect(result.current.toasts).toHaveLength(1);
    });

    it('should generate unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Toast 1' });
      });

      const firstId = result.current.toasts[0].id;

      act(() => {
        result.current.dismiss();
      });

      act(() => {
        result.current.toast({ title: 'Toast 2' });
      });

      const secondId = result.current.toasts[0].id;

      expect(firstId).not.toBe(secondId);
    });
  });

  describe('dismiss', () => {
    it('should dismiss specific toast', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;

      act(() => {
        const { id } = result.current.toast({ title: 'Test Toast' });
        toastId = id;
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss(toastId);
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should dismiss all toasts when no ID provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Toast 1' });
      });

      act(() => {
        result.current.dismiss();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should set open to false when dismissing', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;

      act(() => {
        const { id } = result.current.toast({ title: 'Test Toast' });
        toastId = id;
      });

      act(() => {
        result.current.dismiss(toastId);
      });

      const toast = result.current.toasts.find(t => t.id === toastId);
      expect(toast?.open).toBe(false);
    });
  });

  describe('Toast updates', () => {
    it('should update existing toast', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;

      act(() => {
        const { id } = result.current.toast({ title: 'Original' });
        toastId = id;
      });

      act(() => {
        result.current.toast({
          id: toastId,
          title: 'Updated',
          description: 'New description'
        });
      });

      expect(result.current.toasts[0].title).toBe('Updated');
      expect(result.current.toasts[0].description).toBe('New description');
    });

    it('should update toast variant', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;

      act(() => {
        const { id } = result.current.toast({ 
          title: 'Test',
          variant: 'default'
        });
        toastId = id;
      });

      act(() => {
        result.current.toast({
          id: toastId,
          variant: 'success'
        });
      });

      expect(result.current.toasts[0].variant).toBe('success');
    });
  });

  describe('Toast with action', () => {
    it('should add toast with action element', () => {
      const { result } = renderHook(() => useToast());

      const actionElement = { type: 'button', props: { children: 'Undo' } };

      act(() => {
        result.current.toast({
          title: 'Action Toast',
          action: actionElement as any
        });
      });

      expect(result.current.toasts[0].action).toBeDefined();
    });
  });

  describe('Multiple toasts', () => {
    it('should handle adding multiple toasts in sequence', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'First' });
      });

      act(() => {
        result.current.dismiss();
      });

      act(() => {
        result.current.toast({ title: 'Second' });
      });

      expect(result.current.toasts[0].title).toBe('Second');
    });
  });

  describe('Toast removal', () => {
    it('should remove toast after timeout', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Temporary' });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not throw error when dismissing non-existent toast', () => {
      const { result } = renderHook(() => useToast());

      expect(() => {
        act(() => {
          result.current.dismiss('non-existent-id');
        });
      }).not.toThrow();
    });
  });

  describe('Toast state management', () => {
    it('should maintain toast state correctly', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Persistent',
          description: 'This should stay'
        });
      });

      const initialToast = result.current.toasts[0];

      expect(initialToast).toBeDefined();
      expect(initialToast.title).toBe('Persistent');
      expect(initialToast.description).toBe('This should stay');
    });

    it('should handle rapid toast additions', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.toast({ title: `Toast ${i}` });
        }
      });

      // Should respect TOAST_LIMIT
      expect(result.current.toasts.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle toast with only title', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Only Title' });
      });

      expect(result.current.toasts[0].title).toBe('Only Title');
      expect(result.current.toasts[0].description).toBeUndefined();
    });

    it('should handle toast with only description', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ description: 'Only Description' });
      });

      expect(result.current.toasts[0].description).toBe('Only Description');
      expect(result.current.toasts[0].title).toBeUndefined();
    });

    it('should handle toast with empty strings', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: '', description: '' });
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });
});
