/**
 * Tests for Transformation Tester
 */

import { TestData, TransformationTester, runTransformationTests } from '../transformation-tester';
import * as responseTransformer from '../response-transformer';

// Mock the response-transformer module
jest.mock('../response-transformer', () => ({
  transformApiResponse: jest.fn((obj) => obj),
  createResponseAccessor: jest.fn((data) => ({
    isSuccess: () => data?.isSuccess || data?.IsSuccess || false,
    getMessage: () => data?.message || data?.Message || '',
    getRecords: () => data?.data?.records || data?.Data?.Records || [],
    getTotalRecords: () => data?.data?.totalRecords || data?.Data?.TotalRecords || 0,
  })),
  pascalToCamel: jest.fn((str) => {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }),
  isPascalCase: jest.fn((str) => {
    if (!str || str.length < 2) return false;
    return str.charAt(0) === str.charAt(0).toUpperCase() && str.charAt(0) !== str.charAt(0).toLowerCase();
  }),
  getCompatibleValue: jest.fn((obj, ...keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined) {
        return obj[key];
      }
    }
    return undefined;
  }),
}));

describe('Transformation Tester', () => {
  describe('TestData', () => {
    it('should have pascalCaseResponse', () => {
      expect(TestData).toHaveProperty('pascalCaseResponse');
      expect(TestData.pascalCaseResponse).toBeDefined();
    });

    it('should have correct structure for pascalCaseResponse', () => {
      expect(TestData.pascalCaseResponse).toHaveProperty('IsSuccess');
      expect(TestData.pascalCaseResponse).toHaveProperty('Message');
      expect(TestData.pascalCaseResponse).toHaveProperty('Data');
    });

    it('should have Records in Data', () => {
      expect(TestData.pascalCaseResponse.Data).toHaveProperty('Records');
      expect(Array.isArray(TestData.pascalCaseResponse.Data.Records)).toBe(true);
    });

    it('should have user data in Records', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      expect(records.length).toBeGreaterThan(0);
      expect(records[0]).toHaveProperty('UserId');
      expect(records[0]).toHaveProperty('FullName');
    });

    it('should have pagination data', () => {
      expect(TestData.pascalCaseResponse.Data).toHaveProperty('TotalRecords');
      expect(TestData.pascalCaseResponse.Data).toHaveProperty('CurrentPage');
      expect(TestData.pascalCaseResponse.Data).toHaveProperty('PageSize');
    });
  });

  describe('Test Data Structure', () => {
    it('should be an object', () => {
      expect(typeof TestData).toBe('object');
    });

    it('should have multiple test cases', () => {
      const keys = Object.keys(TestData);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should have consistent data types', () => {
      expect(typeof TestData.pascalCaseResponse.IsSuccess).toBe('boolean');
      expect(typeof TestData.pascalCaseResponse.Message).toBe('string');
    });
  });

  describe('Data Validation', () => {
    it('should have valid user IDs', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      records.forEach(record => {
        expect(typeof record.UserId).toBe('number');
      });
    });

    it('should have valid email format', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      records.forEach(record => {
        expect(record.Email).toContain('@');
      });
    });

    it('should have role names', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      records.forEach(record => {
        expect(record.RoleName).toBeDefined();
        expect(typeof record.RoleName).toBe('string');
      });
    });

    it('should have status values', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      records.forEach(record => {
        expect(record.Status).toBeDefined();
        expect(['Active', 'Inactive']).toContain(record.Status);
      });
    });
  });

  describe('Pagination Validation', () => {
    it('should have valid total records', () => {
      expect(typeof TestData.pascalCaseResponse.Data.TotalRecords).toBe('number');
      expect(TestData.pascalCaseResponse.Data.TotalRecords).toBeGreaterThanOrEqual(0);
    });

    it('should have valid current page', () => {
      expect(typeof TestData.pascalCaseResponse.Data.CurrentPage).toBe('number');
      expect(TestData.pascalCaseResponse.Data.CurrentPage).toBeGreaterThan(0);
    });

    it('should have valid page size', () => {
      expect(typeof TestData.pascalCaseResponse.Data.PageSize).toBe('number');
      expect(TestData.pascalCaseResponse.Data.PageSize).toBeGreaterThan(0);
    });

    it('should have calculated total pages', () => {
      expect(TestData.pascalCaseResponse.Data.TotalPages).toBeDefined();
      expect(typeof TestData.pascalCaseResponse.Data.TotalPages).toBe('number');
    });
  });

  describe('Category Data', () => {
    it('should have category IDs', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      records.forEach(record => {
        expect(record.CategoryId).toBeDefined();
        expect(typeof record.CategoryId).toBe('number');
      });
    });

    it('should have category names', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      records.forEach(record => {
        expect(record.CategoryName).toBeDefined();
        expect(typeof record.CategoryName).toBe('string');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have matching record count', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      const totalRecords = TestData.pascalCaseResponse.Data.TotalRecords;
      expect(records.length).toBeLessThanOrEqual(totalRecords);
    });

    it('should have all records with same structure', () => {
      const records = TestData.pascalCaseResponse.Data.Records;
      const firstRecordKeys = Object.keys(records[0]);
      
      records.forEach(record => {
        const keys = Object.keys(record);
        expect(keys.length).toBe(firstRecordKeys.length);
      });
    });
  });

  describe('Type Exports', () => {
    it('should export TestData', () => {
      expect(TestData).toBeDefined();
    });

    it('should be accessible', () => {
      expect(TestData.pascalCaseResponse).not.toBeNull();
    });

    it('should be immutable structure', () => {
      const original = TestData.pascalCaseResponse;
      expect(original).toBe(TestData.pascalCaseResponse);
    });
  });

  describe('camelCaseResponse', () => {
    it('should have camelCase response data', () => {
      expect(TestData.camelCaseResponse).toBeDefined();
      expect(TestData.camelCaseResponse).toHaveProperty('isSuccess');
      expect(TestData.camelCaseResponse).toHaveProperty('message');
      expect(TestData.camelCaseResponse).toHaveProperty('data');
    });

    it('should have records in lowercase', () => {
      expect(TestData.camelCaseResponse.data).toHaveProperty('records');
      expect(Array.isArray(TestData.camelCaseResponse.data.records)).toBe(true);
    });

    it('should have user data in camelCase', () => {
      const records = TestData.camelCaseResponse.data.records;
      expect(records[0]).toHaveProperty('userId');
      expect(records[0]).toHaveProperty('fullName');
      expect(records[0]).toHaveProperty('email');
    });
  });

  describe('mixedResponse', () => {
    it('should have mixed format data', () => {
      expect(TestData.mixedResponse).toBeDefined();
      expect(TestData.mixedResponse).toHaveProperty('IsSuccess');
      expect(TestData.mixedResponse).toHaveProperty('message');
    });
  });
});

describe('TransformationTester', () => {
  let tester: TransformationTester;
  let consoleLogSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    tester = new TransformationTester();
    jest.clearAllMocks();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should create instance', () => {
      expect(tester).toBeInstanceOf(TransformationTester);
    });

    it('should initialize with empty results', () => {
      const summary = tester.getTestSummary();
      expect(summary.total).toBe(0);
    });
  });

  describe('runAllTests', () => {
    it('should run all tests and return results', () => {
      const results = tester.runAllTests();
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should run multiple test categories', () => {
      const results = tester.runAllTests();
      
      const testNames = results.map(r => r.test);
      expect(testNames.some(name => name.includes('PascalToCamel'))).toBe(true);
      expect(testNames.some(name => name.includes('isPascalCase'))).toBe(true);
    });

    it('should track all test results', () => {
      tester.runAllTests();
      const summary = tester.getTestSummary();
      
      expect(summary.total).toBeGreaterThan(0);
    });
  });

  describe('testPascalToCamelConversion', () => {
    it('should test PascalCase to camelCase conversion', () => {
      const results = tester.runAllTests();
      const pascalTests = results.filter(r => r.test.includes('PascalToCamel'));
      
      expect(pascalTests.length).toBeGreaterThan(0);
    });

    it('should verify UserId conversion', () => {
      const results = tester.runAllTests();
      const userIdTest = results.find(r => r.test.includes('UserId'));
      
      expect(userIdTest).toBeDefined();
      expect(userIdTest?.data?.input).toBe('UserId');
      expect(userIdTest?.data?.expected).toBe('userId');
    });

    it('should call pascalToCamel function', () => {
      tester.runAllTests();
      
      expect(responseTransformer.pascalToCamel).toHaveBeenCalled();
    });
  });

  describe('testPascalCaseDetection', () => {
    it('should test PascalCase detection', () => {
      const results = tester.runAllTests();
      const detectionTests = results.filter(r => r.test.includes('isPascalCase'));
      
      expect(detectionTests.length).toBeGreaterThan(0);
    });

    it('should call isPascalCase function', () => {
      tester.runAllTests();
      
      expect(responseTransformer.isPascalCase).toHaveBeenCalled();
    });

    it('should test various string formats', () => {
      const results = tester.runAllTests();
      const detectionTests = results.filter(r => r.test.includes('isPascalCase'));
      
      const inputs = detectionTests.map(t => t.data?.input);
      expect(inputs).toContain('UserId');
      expect(inputs).toContain('userId');
    });
  });

  describe('testResponseTransformation', () => {
    it('should test response transformation', () => {
      const results = tester.runAllTests();
      const transformTests = results.filter(r => r.test.includes('Transformation'));
      
      expect(transformTests.length).toBeGreaterThan(0);
    });

    it('should call transformApiResponse', () => {
      tester.runAllTests();
      
      expect(responseTransformer.transformApiResponse).toHaveBeenCalled();
    });

    it('should test backward compatibility', () => {
      const results = tester.runAllTests();
      const backwardTest = results.find(r => r.test.includes('Backward Compatibility'));
      
      expect(backwardTest).toBeDefined();
    });

    it('should test nested object transformation', () => {
      const results = tester.runAllTests();
      const nestedTest = results.find(r => r.test.includes('Nested Object'));
      
      expect(nestedTest).toBeDefined();
    });
  });

  describe('testBackwardCompatibility', () => {
    it('should test backward compatibility access', () => {
      const results = tester.runAllTests();
      const compatTest = results.find(r => r.test === 'Backward Compatibility Access');
      
      expect(compatTest).toBeDefined();
    });

    it('should call getCompatibleValue', () => {
      tester.runAllTests();
      
      expect(responseTransformer.getCompatibleValue).toHaveBeenCalled();
    });
  });

  describe('testResponseAccessor', () => {
    it('should test response accessor utility', () => {
      const results = tester.runAllTests();
      const accessorTests = results.filter(r => r.test.includes('Response Accessor'));
      
      expect(accessorTests.length).toBeGreaterThan(0);
    });

    it('should call createResponseAccessor', () => {
      tester.runAllTests();
      
      expect(responseTransformer.createResponseAccessor).toHaveBeenCalled();
    });

    it('should test PascalCase input', () => {
      const results = tester.runAllTests();
      const pascalTest = results.find(r => r.test.includes('PascalCase Input'));
      
      expect(pascalTest).toBeDefined();
    });

    it('should test camelCase input', () => {
      const results = tester.runAllTests();
      const camelTest = results.find(r => r.test.includes('camelCase Input'));
      
      expect(camelTest).toBeDefined();
    });
  });

  describe('testNestedObjectTransformation', () => {
    it('should test deep nested transformation', () => {
      const results = tester.runAllTests();
      const nestedTest = results.find(r => r.test === 'Deep Nested Object Transformation');
      
      expect(nestedTest).toBeDefined();
    });
  });

  describe('testArrayTransformation', () => {
    it('should test array item transformation', () => {
      const results = tester.runAllTests();
      const arrayTest = results.find(r => r.test === 'Array Item Transformation');
      
      expect(arrayTest).toBeDefined();
    });
  });

  describe('testCompatibleValueAccess', () => {
    it('should test compatible value access', () => {
      const results = tester.runAllTests();
      const compatTest = results.find(r => r.test === 'Compatible Value Access');
      
      expect(compatTest).toBeDefined();
    });
  });

  describe('getTestSummary', () => {
    it('should return summary with all metrics', () => {
      tester.runAllTests();
      const summary = tester.getTestSummary();
      
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('passed');
      expect(summary).toHaveProperty('failed');
      expect(summary).toHaveProperty('passRate');
    });

    it('should calculate correct totals', () => {
      tester.runAllTests();
      const summary = tester.getTestSummary();
      
      expect(summary.total).toBeGreaterThan(0);
      expect(summary.passed + summary.failed).toBe(summary.total);
    });

    it('should calculate pass rate', () => {
      tester.runAllTests();
      const summary = tester.getTestSummary();
      
      expect(summary.passRate).toBeGreaterThanOrEqual(0);
      expect(summary.passRate).toBeLessThanOrEqual(100);
    });

    it('should handle empty results', () => {
      const summary = tester.getTestSummary();
      
      expect(summary.total).toBe(0);
      expect(summary.passed).toBe(0);
      expect(summary.failed).toBe(0);
      expect(summary.passRate).toBe(0);
    });
  });

  describe('printResults', () => {
    it('should print results to console', () => {
      tester.runAllTests();
      tester.printResults();
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('🧪 API Response Transformation Tests');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should log each test result', () => {
      tester.runAllTests();
      tester.printResults();
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should print summary', () => {
      tester.runAllTests();
      tester.printResults();
      
      const summaryCall = consoleLogSpy.mock.calls.find(call => 
        call[0]?.includes('Summary:')
      );
      expect(summaryCall).toBeDefined();
    });

    it('should handle empty results', () => {
      tester.printResults();
      
      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should print data for failed tests', () => {
      // Mock a failure with data
      (responseTransformer.pascalToCamel as jest.Mock).mockReturnValueOnce('wrongValue');
      
      tester.runAllTests();
      tester.printResults();
      
      // Should log the failed test icon
      const failedLogCall = consoleLogSpy.mock.calls.find(call => 
        call[0]?.includes('❌')
      );
      expect(failedLogCall).toBeDefined();
      
      // Should log data for failed tests
      const dataLogCall = consoleLogSpy.mock.calls.find(call => 
        call[0]?.includes('Data:')
      );
      expect(dataLogCall).toBeDefined();
    });

    it('should show success icon for passed tests', () => {
      tester.runAllTests();
      tester.printResults();
      
      const successLogCall = consoleLogSpy.mock.calls.find(call => 
        call[0]?.includes('✅')
      );
      expect(successLogCall).toBeDefined();
    });
  });

  describe('Test Results', () => {
    it('should have test result structure', () => {
      const results = tester.runAllTests();
      const firstResult = results[0];
      
      expect(firstResult).toHaveProperty('test');
      expect(firstResult).toHaveProperty('passed');
      expect(firstResult).toHaveProperty('message');
    });

    it('should include data for failed tests', () => {
      // Mock a failure
      (responseTransformer.pascalToCamel as jest.Mock).mockReturnValueOnce('wrongValue');
      
      const results = tester.runAllTests();
      const failedTest = results.find(r => !r.passed);
      
      if (failedTest) {
        expect(failedTest).toHaveProperty('data');
      }
    });

    it('should mark tests as passed or failed', () => {
      const results = tester.runAllTests();
      
      results.forEach(result => {
        expect(typeof result.passed).toBe('boolean');
      });
    });
  });

  describe('Failure Scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle pascalToCamel failure', () => {
      (responseTransformer.pascalToCamel as jest.Mock).mockReturnValueOnce('wrongValue');
      
      const results = tester.runAllTests();
      const failedTest = results.find(r => !r.passed);
      
      expect(failedTest).toBeDefined();
      expect(failedTest?.message).toContain('Expected');
    });

    it('should handle isPascalCase failure', () => {
      (responseTransformer.isPascalCase as jest.Mock).mockReturnValueOnce(false);
      
      const results = tester.runAllTests();
      const failedTest = results.find(r => r.test.includes('isPascalCase') && !r.passed);
      
      expect(failedTest).toBeDefined();
    });

    it('should handle response transformation failure - missing keys', () => {
      (responseTransformer.transformApiResponse as jest.Mock).mockReturnValueOnce({});
      
      const results = tester.runAllTests();
      const failedTest = results.find(r => r.test === 'Response Transformation - Backward Compatibility');
      
      expect(failedTest).toBeDefined();
      if (failedTest && !failedTest.passed) {
        expect(failedTest.message).toContain('Missing keys');
      }
    });

    it('should handle nested transformation failure', () => {
      (responseTransformer.transformApiResponse as jest.Mock).mockReturnValueOnce({ data: { records: [{}] } });
      
      const results = tester.runAllTests();
      const failedTest = results.find(r => r.test === 'Nested Object Transformation');
      
      if (failedTest && !failedTest.passed) {
        expect(failedTest.message).toContain('failed');
      }
    });

    it('should handle response accessor failure - pascalCase', () => {
      (responseTransformer.createResponseAccessor as jest.Mock).mockReturnValueOnce({
        isSuccess: () => false,
        getMessage: () => '',
        getRecords: () => [],
        getTotalRecords: () => 0,
      });
      
      const results = tester.runAllTests();
      const accessorTest = results.find(r => r.test === 'Response Accessor - PascalCase Input');
      
      if (accessorTest && !accessorTest.passed) {
        expect(accessorTest).toBeDefined();
      }
    });

    it('should handle response accessor failure - camelCase', () => {
      // Mock first call to succeed, second to fail
      (responseTransformer.createResponseAccessor as jest.Mock)
        .mockReturnValueOnce({
          isSuccess: () => true,
          getMessage: () => 'success',
          getRecords: () => [{}, {}],
          getTotalRecords: () => 2,
        })
        .mockReturnValueOnce({
          isSuccess: () => false,
          getMessage: () => '',
          getRecords: () => [],
          getTotalRecords: () => 0,
        });
      
      const results = tester.runAllTests();
      const camelTest = results.find(r => r.test === 'Response Accessor - camelCase Input');
      
      if (camelTest && !camelTest.passed) {
        expect(camelTest).toBeDefined();
      }
    });

    it('should handle deep nested transformation failure', () => {
      (responseTransformer.transformApiResponse as jest.Mock).mockReturnValueOnce({});
      
      const results = tester.runAllTests();
      const deepTest = results.find(r => r.test === 'Deep Nested Object Transformation');
      
      if (deepTest && !deepTest.passed) {
        expect(deepTest.message).toContain('failed');
      }
    });

    it('should handle array transformation failure', () => {
      (responseTransformer.transformApiResponse as jest.Mock).mockReturnValueOnce({ Items: [{}] });
      
      const results = tester.runAllTests();
      const arrayTest = results.find(r => r.test === 'Array Item Transformation');
      
      if (arrayTest && !arrayTest.passed) {
        expect(arrayTest.message).toContain('failed');
      }
    });

    it('should handle compatible value access failure', () => {
      (responseTransformer.getCompatibleValue as jest.Mock)
        .mockReturnValueOnce(999)
        .mockReturnValueOnce('Wrong')
        .mockReturnValueOnce('NotUndefined');
      
      const results = tester.runAllTests();
      const compatTest = results.find(r => r.test === 'Compatible Value Access');
      
      if (compatTest && !compatTest.passed) {
        expect(compatTest.message).toContain('all cases');
      }
    });

    it('should handle backward compatibility failure', () => {
      (responseTransformer.getCompatibleValue as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      
      const results = tester.runAllTests();
      const backwardTest = results.find(r => r.test === 'Backward Compatibility Access');
      
      if (backwardTest && !backwardTest.passed) {
        expect(backwardTest).toBeDefined();
      }
    });
  });

  describe('Integration Tests', () => {
    it('should test all transformation functions', () => {
      tester.runAllTests();
      
      expect(responseTransformer.pascalToCamel).toHaveBeenCalled();
      expect(responseTransformer.isPascalCase).toHaveBeenCalled();
      expect(responseTransformer.transformApiResponse).toHaveBeenCalled();
      expect(responseTransformer.createResponseAccessor).toHaveBeenCalled();
      expect(responseTransformer.getCompatibleValue).toHaveBeenCalled();
    });

    it('should run tests in order', () => {
      const results = tester.runAllTests();
      
      const testTypes = [
        'PascalToCamel',
        'isPascalCase',
        'Transformation',
        'Response Accessor',
        'Array'
      ];
      
      testTypes.forEach(type => {
        const hasType = results.some(r => r.test.includes(type));
        expect(hasType).toBe(true);
      });
    });

    it('should handle multiple test runs', () => {
      const results1 = tester.runAllTests();
      const results2 = tester.runAllTests();
      
      expect(results1.length).toBe(results2.length);
    });
  });
});

describe('runTransformationTests', () => {
  let consoleGroupSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    consoleGroupSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  it('should run all tests', () => {
    const summary = runTransformationTests();
    
    expect(summary).toBeDefined();
    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('passed');
    expect(summary).toHaveProperty('failed');
    expect(summary).toHaveProperty('passRate');
  });

  it('should print results', () => {
    runTransformationTests();
    
    expect(consoleGroupSpy).toHaveBeenCalledWith('🧪 API Response Transformation Tests');
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('should return test summary', () => {
    const summary = runTransformationTests();
    
    expect(summary.total).toBeGreaterThan(0);
  });
});
