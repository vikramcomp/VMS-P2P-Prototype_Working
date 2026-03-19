/**
 * API Response Transformation Test Utility
 * 
 * Provides testing and validation for the global response transformation system.
 * Use this utility to test the transformation of API responses and ensure
 * backward compatibility during the transition.
 */

import { 
  transformApiResponse, 
  createResponseAccessor, 
  pascalToCamel, 
  isPascalCase,
  getCompatibleValue 
} from './response-transformer';

/**
 * Test data samples representing different API response formats
 */
export const TestData = {
  // Original PascalCase API response
  pascalCaseResponse: {
    IsSuccess: true,
    Message: "Data retrieved successfully",
    Data: {
      Records: [
        {
          UserId: 118,
          FullName: "John Doe",
          Email: "john.doe@example.com",
          RoleName: "Admin",
          Status: "Active",
          CategoryId: 1,
          CategoryName: "IT Department"
        },
        {
          UserId: 119,
          FullName: "Jane Smith",
          Email: "jane.smith@example.com",
          RoleName: "User",
          Status: "Inactive",
          CategoryId: 2,
          CategoryName: "HR Department"
        }
      ],
      TotalRecords: 2,
      CurrentPage: 1,
      PageSize: 10,
      TotalPages: 1
    }
  },

  // New camelCase API response
  camelCaseResponse: {
    isSuccess: true,
    message: "Data retrieved successfully",
    data: {
      records: [
        {
          userId: 118,
          fullName: "John Doe",
          email: "john.doe@example.com",
          roleName: "Admin",
          status: "Active",
          categoryId: 1,
          categoryName: "IT Department"
        },
        {
          userId: 119,
          fullName: "Jane Smith",
          email: "jane.smith@example.com",
          roleName: "User",
          status: "Inactive",
          categoryId: 2,
          categoryName: "HR Department"
        }
      ],
      totalRecords: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    }
  },

  // Mixed format response (transition period)
  mixedResponse: {
    IsSuccess: true,
    message: "Mixed format response",
    Data: {
      records: [
        {
          UserId: 120,
          fullName: "Mixed Format User",
          Email: "mixed@example.com",
          roleName: "Tester"
        }
      ],
      TotalRecords: 1,
      currentPage: 1
    }
  }
};

/**
 * Test results interface
 */
interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

/**
 * Transformation test suite
 */
export class TransformationTester {
  private results: TestResult[] = [];

  /**
   * Run all transformation tests
   */
  runAllTests(): TestResult[] {
    this.results = [];
    
    this.testPascalToCamelConversion();
    this.testPascalCaseDetection();
    this.testResponseTransformation();
    this.testBackwardCompatibility();
    this.testResponseAccessor();
    this.testNestedObjectTransformation();
    this.testArrayTransformation();
    this.testCompatibleValueAccess();
    
    return this.results;
  }

  /**
   * Test basic PascalCase to camelCase conversion
   */
  private testPascalToCamelConversion(): void {
    const testCases = [
      { input: 'UserId', expected: 'userId' },
      { input: 'FullName', expected: 'fullName' },
      { input: 'IsSuccess', expected: 'isSuccess' },
      { input: 'Data', expected: 'data' },
      { input: 'A', expected: 'a' },
      { input: '', expected: '' },
      { input: 'ID', expected: 'iD' }, // Edge case
    ];

    testCases.forEach(({ input, expected }) => {
      const result = pascalToCamel(input);
      this.results.push({
        test: `PascalToCamel: ${input} -> ${expected}`,
        passed: result === expected,
        message: result === expected ? 'Passed' : `Expected ${expected}, got ${result}`,
        data: { input, expected, result }
      });
    });
  }

  /**
   * Test PascalCase detection
   */
  private testPascalCaseDetection(): void {
    const testCases = [
      { input: 'UserId', expected: true },
      { input: 'userId', expected: false },
      { input: 'IsSuccess', expected: true },
      { input: 'isSuccess', expected: false },
      { input: 'A', expected: false }, // Single character
      { input: 'AB', expected: true },
      { input: '', expected: false },
      { input: '123', expected: false },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = isPascalCase(input);
      this.results.push({
        test: `isPascalCase: ${input}`,
        passed: result === expected,
        message: result === expected ? 'Passed' : `Expected ${expected}, got ${result}`,
        data: { input, expected, result }
      });
    });
  }

  /**
   * Test full response transformation
   */
  private testResponseTransformation(): void {
    const transformed = transformApiResponse(TestData.pascalCaseResponse);
    
    // Should have both PascalCase and camelCase keys in backward compatibility mode
    const hasOriginalKeys = transformed.IsSuccess !== undefined && transformed.Data !== undefined;
    const hasTransformedKeys = transformed.isSuccess !== undefined && transformed.data !== undefined;
    
    this.results.push({
      test: 'Response Transformation - Backward Compatibility',
      passed: hasOriginalKeys && hasTransformedKeys,
      message: hasOriginalKeys && hasTransformedKeys 
        ? 'Both original and transformed keys present' 
        : 'Missing keys in transformation',
      data: { hasOriginalKeys, hasTransformedKeys, keys: Object.keys(transformed) }
    });

    // Test nested transformation
    const nestedTransformed = transformed.data?.records?.[0];
    const hasNestedOriginal = nestedTransformed?.UserId !== undefined;
    const hasNestedTransformed = nestedTransformed?.userId !== undefined;
    
    this.results.push({
      test: 'Nested Object Transformation',
      passed: hasNestedOriginal && hasNestedTransformed,
      message: hasNestedOriginal && hasNestedTransformed 
        ? 'Nested objects transformed correctly' 
        : 'Nested transformation failed',
      data: { nestedTransformed }
    });
  }

  /**
   * Test backward compatibility access
   */
  private testBackwardCompatibility(): void {
    const transformed = transformApiResponse(TestData.pascalCaseResponse);
    
    // Test accessing values with both naming conventions
    const successViaCamel = getCompatibleValue(transformed, 'isSuccess', 'IsSuccess');
    const successViaPascal = getCompatibleValue(transformed, 'isSuccess', 'IsSuccess');
    
    this.results.push({
      test: 'Backward Compatibility Access',
      passed: successViaCamel === true && successViaPascal === true,
      message: 'Can access values using both naming conventions',
      data: { successViaCamel, successViaPascal }
    });
  }

  /**
   * Test response accessor utility
   */
  private testResponseAccessor(): void {
    const accessor = createResponseAccessor(TestData.pascalCaseResponse);
    
    const isSuccess = accessor.isSuccess();
    const message = accessor.getMessage();
    const records = accessor.getRecords();
    const totalRecords = accessor.getTotalRecords();
    
    this.results.push({
      test: 'Response Accessor - PascalCase Input',
      passed: isSuccess === true && message === "Data retrieved successfully" && records.length === 2 && totalRecords === 2,
      message: 'Response accessor handles PascalCase input correctly',
      data: { isSuccess, message, recordsLength: records.length, totalRecords }
    });

    // Test with camelCase input
    const camelAccessor = createResponseAccessor(TestData.camelCaseResponse);
    const camelSuccess = camelAccessor.isSuccess();
    const camelRecords = camelAccessor.getRecords();
    
    this.results.push({
      test: 'Response Accessor - camelCase Input',
      passed: camelSuccess === true && camelRecords.length === 2,
      message: 'Response accessor handles camelCase input correctly',
      data: { camelSuccess, recordsLength: camelRecords.length }
    });
  }

  /**
   * Test nested object transformation
   */
  private testNestedObjectTransformation(): void {
    const deepNested = {
      Level1: {
        Level2: {
          Level3: {
            UserId: 123,
            UserData: {
              FirstName: "Deep",
              LastName: "Nested"
            }
          }
        }
      }
    };

    const transformed = transformApiResponse(deepNested);
    const hasDeepAccess = transformed.level1?.level2?.level3?.userId === 123;
    const hasOriginalAccess = transformed.Level1?.Level2?.Level3?.UserId === 123;
    
    this.results.push({
      test: 'Deep Nested Object Transformation',
      passed: hasDeepAccess && hasOriginalAccess,
      message: hasDeepAccess && hasOriginalAccess ? 'Deep nesting handled correctly' : 'Deep nesting failed',
      data: { hasDeepAccess, hasOriginalAccess, transformed }
    });
  }

  /**
   * Test array transformation
   */
  private testArrayTransformation(): void {
    const arrayData = {
      Items: [
        { UserId: 1, UserName: "User1" },
        { UserId: 2, UserName: "User2" }
      ]
    };

    const transformed = transformApiResponse(arrayData);
    const arrayTransformed = transformed.items?.[0]?.userId === 1 && transformed.items?.[0]?.userName === "User1";
    const originalPresent = transformed.Items?.[0]?.UserId === 1;
    
    this.results.push({
      test: 'Array Item Transformation',
      passed: arrayTransformed && originalPresent,
      message: arrayTransformed && originalPresent ? 'Array items transformed correctly' : 'Array transformation failed',
      data: { arrayTransformed, originalPresent, transformed }
    });
  }

  /**
   * Test compatible value access
   */
  private testCompatibleValueAccess(): void {
    const testObj = { userId: 123, UserName: "Test" };
    
    const userIdValue = getCompatibleValue(testObj, 'userId');
    const userNameValue = getCompatibleValue(testObj, 'userName', 'UserName');
    const missingValue = getCompatibleValue(testObj, 'nonExistent');
    
    this.results.push({
      test: 'Compatible Value Access',
      passed: userIdValue === 123 && userNameValue === "Test" && missingValue === undefined,
      message: 'Compatible value access works for all cases',
      data: { userIdValue, userNameValue, missingValue }
    });
  }

  /**
   * Get test summary
   */
  getTestSummary(): { total: number; passed: number; failed: number; passRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    
    return { total, passed, failed, passRate };
  }

  /**
   * Print test results to console
   */
  printResults(): void {
    console.group('🧪 API Response Transformation Tests');
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
      if (!result.passed && result.data) {
        console.log('   Data:', result.data);
      }
    });
    
    const summary = this.getTestSummary();
    console.log(`\n📊 Summary: ${summary.passed}/${summary.total} tests passed (${summary.passRate.toFixed(1)}%)`);
    
    console.groupEnd();
  }
}

/**
 * Quick test function for development
 */
export const runTransformationTests = (): void => {
  const tester = new TransformationTester();
  tester.runAllTests();
  tester.printResults();
  return tester.getTestSummary();
};