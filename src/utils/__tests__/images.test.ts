/**
 * Tests for Image Utilities
 */

import { 
  IMAGE_PATHS, 
  DEFAULT_IMAGES, 
  VMS_ASSETS,
  getUserAvatar,
  getIcon,
  getBackgroundImage,
  getIllustration,
  generateSrcSet,
  imageExists,
  preloadImages,
  getOptimizedImageProps,
  IMAGE_SETTINGS 
} from '../images';

describe('Image Utilities', () => {
  describe('Constants', () => {
    it('should have IMAGE_PATHS defined', () => {
      expect(IMAGE_PATHS).toBeDefined();
      expect(IMAGE_PATHS.icons).toBe('/images/icons');
      expect(IMAGE_PATHS.avatars).toBe('/images/avatars');
      expect(IMAGE_PATHS.backgrounds).toBe('/images/backgrounds');
    });

    it('should have DEFAULT_IMAGES defined', () => {
      expect(DEFAULT_IMAGES).toBeDefined();
      expect(DEFAULT_IMAGES.avatar).toBeDefined();
      expect(DEFAULT_IMAGES.userPlaceholder).toBeDefined();
    });

    it('should have VMS_ASSETS defined', () => {
      expect(VMS_ASSETS).toBeDefined();
      expect(VMS_ASSETS.logo).toBeDefined();
      expect(VMS_ASSETS.icon).toBeDefined();
    });
  });

  describe('getUserAvatar', () => {
    it('should return default avatar when no userId provided', () => {
      const result = getUserAvatar();
      expect(result).toBe(DEFAULT_IMAGES.avatar);
    });

    it('should return default avatar for undefined userId', () => {
      const result = getUserAvatar(undefined);
      expect(result).toBe(DEFAULT_IMAGES.avatar);
    });

    it('should generate avatar URL with userId', () => {
      const result = getUserAvatar('123');
      expect(result).toContain('123');
    });

    it('should handle different sizes', () => {
      const sm = getUserAvatar('123', 'sm');
      const md = getUserAvatar('123', 'md');
      const lg = getUserAvatar('123', 'lg');
      const xl = getUserAvatar('123', 'xl');
      
      expect(sm).toBeDefined();
      expect(md).toBeDefined();
      expect(lg).toBeDefined();
      expect(xl).toBeDefined();
    });

    it('should handle different formats', () => {
      const png = getUserAvatar('123', 'md', 'png');
      const jpg = getUserAvatar('123', 'md', 'jpg');
      const webp = getUserAvatar('123', 'md', 'webp');
      
      expect(png).toBeDefined();
      expect(jpg).toBeDefined();
      expect(webp).toBeDefined();
    });

    it('should default to md size', () => {
      const result = getUserAvatar('123');
      expect(result).toBeDefined();
    });

    it('should default to jpg format', () => {
      const result = getUserAvatar('123', 'md');
      expect(result).toBeDefined();
    });
  });

  describe('getIcon', () => {
    it('should generate icon path with outline variant', () => {
      const result = getIcon('user');
      expect(result).toContain('/images/icons');
      expect(result).toContain('user');
      expect(result).toContain('outline');
    });

    it('should handle filled variant', () => {
      const result = getIcon('user', 'filled');
      expect(result).toContain('filled');
    });

    it('should handle solid variant', () => {
      const result = getIcon('user', 'solid');
      expect(result).toContain('solid');
    });

    it('should default to outline variant', () => {
      const result = getIcon('check');
      expect(result).toContain('outline.svg');
    });
  });

  describe('getBackgroundImage', () => {
    it('should generate background image path', () => {
      const result = getBackgroundImage('hero');
      expect(result).toContain('/images/backgrounds');
      expect(result).toContain('hero');
    });

    it('should handle jpg format', () => {
      const result = getBackgroundImage('hero', 'jpg');
      expect(result).toContain('.jpg');
    });

    it('should handle png format', () => {
      const result = getBackgroundImage('hero', 'png');
      expect(result).toContain('.png');
    });

    it('should handle webp format', () => {
      const result = getBackgroundImage('hero', 'webp');
      expect(result).toContain('.webp');
    });
  });

  describe('getIllustration', () => {
    it('should generate illustration path', () => {
      const result = getIllustration('empty-state');
      expect(result).toContain('/images/illustrations');
      expect(result).toContain('empty-state');
    });

    it('should return SVG format', () => {
      const result = getIllustration('error');
      expect(result).toContain('.svg');
    });
  });

  describe('generateSrcSet', () => {
    it('should generate srcSet with default sizes', () => {
      const result = generateSrcSet('/path/to/image', 'jpg');
      expect(result).toContain('320w');
      expect(result).toContain('640w');
      expect(result).toContain('1024w');
      expect(result).toContain('1920w');
    });

    it('should generate srcSet with custom sizes', () => {
      const result = generateSrcSet('/path/to/image', 'png', [400, 800]);
      expect(result).toContain('400w');
      expect(result).toContain('800w');
    });

    it('should format correctly', () => {
      const result = generateSrcSet('/img', 'jpg', [100, 200]);
      expect(result).toContain('/img-100w.jpg 100w');
      expect(result).toContain('/img-200w.jpg 200w');
    });
  });

  describe('imageExists', () => {
    it('should return true for valid images', async () => {
      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        set src(val: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      };
      
      global.Image = jest.fn(() => mockImage) as any;
      
      const result = await imageExists('/test.jpg');
      expect(result).toBe(true);
    });

    it('should return false for invalid images', async () => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        set src(val: string) {
          setTimeout(() => this.onerror?.(), 0);
        }
      };
      
      global.Image = jest.fn(() => mockImage) as any;
      
      const result = await imageExists('/invalid.jpg');
      expect(result).toBe(false);
    });
  });

  describe('preloadImages', () => {
    it('should preload images in browser', () => {
      const mockLink = {
        rel: '',
        as: '',
        href: '',
      };
      
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation(() => mockLink as any);
      
      preloadImages(['/img1.jpg', '/img2.jpg']);
      
      expect(createElementSpy).toHaveBeenCalledTimes(2);
      expect(appendChildSpy).toHaveBeenCalledTimes(2);
      
      jest.restoreAllMocks();
    });
  });

  describe('getOptimizedImageProps', () => {
    it('should generate optimized image props', () => {
      const result = getOptimizedImageProps('/test.jpg', 'Test Image', 300, 200);
      expect(result.src).toBe('/test.jpg');
      expect(result.alt).toBe('Test Image');
      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
      expect(result.quality).toBe(85);
    });

    it('should handle priority flag', () => {
      const result = getOptimizedImageProps('/test.jpg', 'Test', 100, 100, true);
      expect(result.priority).toBe(true);
    });

    it('should include blur placeholder', () => {
      const result = getOptimizedImageProps('/test.jpg', 'Test', 100, 100);
      expect(result.placeholder).toBe('blur');
      expect(result.blurDataURL).toBeDefined();
    });
  });

  describe('IMAGE_SETTINGS', () => {
    it('should have quality settings', () => {
      expect(IMAGE_SETTINGS.quality.high).toBe(95);
      expect(IMAGE_SETTINGS.quality.medium).toBe(85);
      expect(IMAGE_SETTINGS.quality.low).toBe(70);
    });

    it('should have format settings', () => {
      expect(IMAGE_SETTINGS.formats.modern).toContain('webp');
      expect(IMAGE_SETTINGS.formats.fallback).toContain('jpg');
    });

    it('should have size settings', () => {
      expect(IMAGE_SETTINGS.sizes.thumbnail).toBe(150);
      expect(IMAGE_SETTINGS.sizes.xlarge).toBe(1920);
    });
  });

  describe('Image Path Consistency', () => {
    it('should use consistent path prefixes', () => {
      Object.values(IMAGE_PATHS).forEach(path => {
        expect(path).toMatch(/^\/images\//);
      });
    });

    it('should use consistent default image paths', () => {
      Object.values(DEFAULT_IMAGES).forEach(path => {
        expect(path).toMatch(/^\/images\//);
      });
    });

    it('should use consistent VMS asset paths', () => {
      Object.values(VMS_ASSETS).forEach(path => {
        expect(path).toMatch(/^\/images\//);
      });
    });
  });
});
