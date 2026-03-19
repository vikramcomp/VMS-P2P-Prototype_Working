/**
 * Tests for Response Transformer (Workaround - Basic Coverage)
 */

import { 
  pascalToCamel, 
  transformApiResponse, 
  createResponseAccessor,
  isPascalCase,
  getCompatibleValue 
} from '../response-transformer';

describe('Response Transformer', () => {
  describe('pascalToCamel', () => {
    it('should convert PascalCase to camelCase', () => {
      expect(pascalToCamel('UserId')).toBe('userId');
      expect(pascalToCamel('FullName')).toBe('fullName');
      expect(pascalToCamel('IsActive')).toBe('isActive');
    });

    it('should handle single character', () => {
      expect(pascalToCamel('A')).toBe('a');
    });

    it('should handle empty string', () => {
      expect(pascalToCamel('')).toBe('');
    });

    it('should handle lowercase string', () => {
      expect(pascalToCamel('test')).toBe('test');
    });

    it('should handle all caps', () => {
      const result = pascalToCamel('API');
      expect(result.charAt(0)).toBe('a');
    });
  });

  describe('isPascalCase', () => {
    it('should identify PascalCase strings', () => {
      expect(isPascalCase('UserId')).toBe(true);
      expect(isPascalCase('FullName')).toBe(true);
    });

    it('should reject camelCase strings', () => {
      expect(isPascalCase('userId')).toBe(false);
      expect(isPascalCase('fullName')).toBe(false);
    });

    it('should reject lowercase strings', () => {
      expect(isPascalCase('test')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isPascalCase('')).toBe(false);
    });

    it('should reject strings with spaces', () => {
      expect(isPascalCase('User Id')).toBe(false);
    });
  });

  describe('transformApiResponse', () => {
    it('should transform simple object', () => {
      const input = { UserId: 1, FullName: 'John' };
      const result = transformApiResponse(input);
      expect(result.userId).toBe(1);
      expect(result.fullName).toBe('John');
    });

    it('should transform nested objects', () => {
      const input = { User: { UserId: 1 } };
      const result = transformApiResponse(input);
      expect(result.user).toBeDefined();
      expect(result.user.userId).toBe(1);
    });

    it('should transform arrays', () => {
      const input = { Records: [{ UserId: 1 }, { UserId: 2 }] };
      const result = transformApiResponse(input);
      expect(result.records).toHaveLength(2);
      expect(result.records[0].userId).toBe(1);
    });

    it('should handle null values', () => {
      const input = { UserId: null };
      const result = transformApiResponse(input);
      expect(result.userId).toBeNull();
    });

    it('should handle undefined values', () => {
      const input = { UserId: undefined };
      const result = transformApiResponse(input);
      expect(result.userId).toBeUndefined();
    });

    it('should preserve primitive types', () => {
      const input = { Count: 5, IsActive: true, Name: 'test' };
      const result = transformApiResponse(input);
      expect(result.count).toBe(5);
      expect(result.isActive).toBe(true);
      expect(result.name).toBe('test');
    });

    it('should handle empty object', () => {
      const result = transformApiResponse({});
      expect(result).toEqual({});
    });

    it('should handle arrays of primitives', () => {
      const input = { Values: [1, 2, 3] };
      const result = transformApiResponse(input);
      expect(result.values).toEqual([1, 2, 3]);
    });
  });

  describe('getCompatibleValue', () => {
    it('should get value from object', () => {
      const obj = { userId: 1, UserId: 1 };
      const result = getCompatibleValue(obj, 'userId');
      expect(result).toBe(1);
    });

    it('should fallback to PascalCase', () => {
      const obj = { UserId: 1 };
      const result = getCompatibleValue(obj, 'userId');
      expect(result).toBe(1);
    });

    it('should return undefined for missing key', () => {
      const obj = { name: 'test' };
      const result = getCompatibleValue(obj, 'age');
      expect(result).toBeUndefined();
    });

    it('should handle nested keys', () => {
      const obj = { user: { id: 1 } };
      const result = getCompatibleValue(obj, 'user');
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('Complex Transformations', () => {
    it('should handle deeply nested structures', () => {
      const input = {
        Data: {
          Records: [
            { User: { Profile: { FirstName: 'John' } } }
          ]
        }
      };
      const result = transformApiResponse(input);
      expect(result.data.records[0].user.profile.firstName).toBe('John');
    });

    it('should handle mixed case keys', () => {
      const input = { UserId: 1, userName: 'test' };
      const result = transformApiResponse(input);
      expect(result.userId).toBe(1);
      expect(result.userName).toBe('test');
    });

    it('should handle arrays of mixed types', () => {
      const input = { Items: [1, 'test', { Id: 1 }, null] };
      const result = transformApiResponse(input);
      expect(result.items).toHaveLength(4);
      expect(result.items[2].id).toBe(1);
    });
  });

  describe('Options Handling', () => {
    it('should respect excludeKeys option', () => {
      const input = { UserId: 1, FullName: 'John' };
      const result = transformApiResponse(input, { excludeKeys: ['UserId'] });
      expect(result.UserId).toBe(1);
      expect(result.fullName).toBe('John');
    });

    it('should respect maxDepth option', () => {
      const input = { Level1: { Level2: { Level3: { Value: 1 } } } };
      const result = transformApiResponse(input, { maxDepth: 2 });
      expect(result.level1).toBeDefined();
    });

    it('should handle backward compatibility mode', () => {
      const input = { UserId: 1 };
      const result = transformApiResponse(input, { backwardCompatibility: true });
      expect(result.userId).toBe(1);
    });
  });
});
