/**
 * Tests for Design System Constants
 */

import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BREAKPOINTS, 
  SHADOWS, 
  BORDER_RADIUS, 
  Z_INDEX,
  TRANSITIONS,
  COMPONENT_VARIANTS,
  STATUS_COLORS,
  VMS_CONSTANTS,
  ANIMATIONS,
  DESIGN_SYSTEM 
} from '../design-system';

describe('Design System Constants', () => {
  describe('COLORS', () => {
    it('should have primary colors', () => {
      expect(COLORS.primary).toBeDefined();
      expect(COLORS.primary['500']).toBeDefined();
      expect(typeof COLORS.primary['500']).toBe('string');
    });

    it('should have neutral colors', () => {
      expect(COLORS.neutral).toBeDefined();
      expect(COLORS.neutral['500']).toBeDefined();
    });

    it('should have success colors', () => {
      expect(COLORS.success).toBeDefined();
      expect(COLORS.success['500']).toBeDefined();
    });

    it('should have all color shades', () => {
      const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      shades.forEach(shade => {
        expect(COLORS.primary[shade]).toBeDefined();
      });
    });

    it('should have valid hex color format', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(hexRegex.test(COLORS.primary['500'])).toBe(true);
    });
  });

  describe('TYPOGRAPHY', () => {
    it('should exist', () => {
      expect(TYPOGRAPHY).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof TYPOGRAPHY).toBe('object');
    });
  });

  describe('SPACING', () => {
    it('should exist', () => {
      expect(SPACING).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof SPACING).toBe('object');
    });
  });

  describe('BREAKPOINTS', () => {
    it('should exist', () => {
      expect(BREAKPOINTS).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof BREAKPOINTS).toBe('object');
    });
  });

  describe('SHADOWS', () => {
    it('should exist', () => {
      expect(SHADOWS).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof SHADOWS).toBe('object');
    });
  });

  describe('BORDER_RADIUS', () => {
    it('should exist', () => {
      expect(BORDER_RADIUS).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof BORDER_RADIUS).toBe('object');
    });
  });

  describe('Z_INDEX', () => {
    it('should exist', () => {
      expect(Z_INDEX).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof Z_INDEX).toBe('object');
    });
  });

  describe('TRANSITIONS', () => {
    it('should exist', () => {
      expect(TRANSITIONS).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof TRANSITIONS).toBe('object');
    });
  });

  describe('Color Consistency', () => {
    it('should have consistent structure across color palettes', () => {
      const palettes = ['primary', 'neutral', 'success'];
      palettes.forEach(palette => {
        expect(COLORS[palette]).toBeDefined();
        expect(typeof COLORS[palette]).toBe('object');
      });
    });
  });

  describe('COMPONENT_VARIANTS', () => {
    it('should have button variants', () => {
      expect(COMPONENT_VARIANTS.button).toBeDefined();
      expect(COMPONENT_VARIANTS.button.sizes).toBeDefined();
      expect(COMPONENT_VARIANTS.button.variants).toBeDefined();
    });

    it('should have card variants', () => {
      expect(COMPONENT_VARIANTS.card).toBeDefined();
      expect(COMPONENT_VARIANTS.card.variants).toBeDefined();
    });

    it('should have badge variants', () => {
      expect(COMPONENT_VARIANTS.badge).toBeDefined();
      expect(COMPONENT_VARIANTS.badge.variants).toBeDefined();
    });
  });

  describe('STATUS_COLORS', () => {
    it('should have status color mappings', () => {
      expect(STATUS_COLORS.active).toBeDefined();
      expect(STATUS_COLORS.inactive).toBeDefined();
      expect(STATUS_COLORS.pending).toBeDefined();
      expect(STATUS_COLORS.approved).toBeDefined();
    });
  });

  describe('VMS_CONSTANTS', () => {
    it('should have navigation constants', () => {
      expect(VMS_CONSTANTS.sidebarWidth).toBeDefined();
      expect(VMS_CONSTANTS.headerHeight).toBeDefined();
    });

    it('should have layout constants', () => {
      expect(VMS_CONSTANTS.maxContentWidth).toBeDefined();
      expect(VMS_CONSTANTS.containerPadding).toBeDefined();
    });

    it('should have form constants', () => {
      expect(VMS_CONSTANTS.inputHeight).toBeDefined();
      expect(VMS_CONSTANTS.labelSpacing).toBeDefined();
    });
  });

  describe('ANIMATIONS', () => {
    it('should have animation presets', () => {
      expect(ANIMATIONS.fadeIn).toBeDefined();
      expect(ANIMATIONS.slideIn).toBeDefined();
      expect(ANIMATIONS.scaleIn).toBeDefined();
    });
  });

  describe('DESIGN_SYSTEM', () => {
    it('should export combined design system', () => {
      expect(DESIGN_SYSTEM).toBeDefined();
      expect(DESIGN_SYSTEM.colors).toBe(COLORS);
      expect(DESIGN_SYSTEM.typography).toBe(TYPOGRAPHY);
      expect(DESIGN_SYSTEM.spacing).toBe(SPACING);
    });

    it('should include all sub-systems', () => {
      expect(DESIGN_SYSTEM.colors).toBeDefined();
      expect(DESIGN_SYSTEM.typography).toBeDefined();
      expect(DESIGN_SYSTEM.spacing).toBeDefined();
      expect(DESIGN_SYSTEM.shadows).toBeDefined();
      expect(DESIGN_SYSTEM.componentVariants).toBeDefined();
      expect(DESIGN_SYSTEM.vmsConstants).toBeDefined();
    });
  });

  describe('Export Validation', () => {
    it('should export all constants', () => {
      expect(COLORS).not.toBeNull();
      expect(TYPOGRAPHY).not.toBeNull();
      expect(SPACING).not.toBeNull();
      expect(BREAKPOINTS).not.toBeNull();
      expect(SHADOWS).not.toBeNull();
      expect(BORDER_RADIUS).not.toBeNull();
      expect(Z_INDEX).not.toBeNull();
      expect(TRANSITIONS).not.toBeNull();
      expect(COMPONENT_VARIANTS).not.toBeNull();
      expect(STATUS_COLORS).not.toBeNull();
      expect(VMS_CONSTANTS).not.toBeNull();
      expect(ANIMATIONS).not.toBeNull();
    });
  });
});
