# Testing Documentation

## Overview

This project uses Jest and React Testing Library for unit and integration testing. The test suite is configured to meet SonarQube's 80% coverage requirement.

## Test Structure

```
src/
├── components/
│   ├── invoices/
│   │   └── __tests__/
│   │       └── invoices-content.test.tsx
│   └── ui/
│       └── __tests__/
│           ├── button.test.tsx
│           ├── pagination.test.tsx
│           └── tooltip.test.tsx
├── services/
│   └── __tests__/
│       ├── api-client.test.ts
│       ├── auth-service.test.ts
│       └── invoices-service.test.ts
└── utils/
    └── __tests__/
        ├── cn.test.ts
        ├── error-handler.test.ts
        └── logger.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run tests in CI environment
```bash
npm run test:ci
```

## Coverage Thresholds

The project is configured with the following minimum coverage thresholds:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

These thresholds are enforced in `jest.config.js` and must be met for the build to pass.

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Service Tests

```typescript
import { myService } from '../my-service'

jest.mock('../api-client')

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await myService.getData()
    expect(result).toEqual(mockData)
  })
})
```

### Utility Tests

```typescript
import { myUtil } from '../my-util'

describe('MyUtil', () => {
  it('should perform calculation correctly', () => {
    const result = myUtil.calculate(5, 10)
    expect(result).toBe(15)
  })
})
```

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Follow the AAA pattern in your tests
3. **Mocking**: Mock external dependencies and API calls
4. **Async Testing**: Use `waitFor` for async operations
5. **User Interactions**: Use `@testing-library/user-event` for realistic user interactions
6. **Cleanup**: Tests are automatically cleaned up between runs
7. **Coverage**: Aim for meaningful tests, not just coverage numbers

## Mocked Dependencies

The following are automatically mocked in `jest.setup.js`:
- `next/navigation` (useRouter, useSearchParams, usePathname)
- `localStorage`
- `fetch`
- `window.matchMedia`

## SonarQube Integration

To view coverage report in SonarQube format:

```bash
npm run test:coverage
```

The coverage report will be generated in:
- `coverage/` - HTML report
- `coverage/lcov.info` - LCOV format for SonarQube

## Debugging Tests

### Run a specific test file
```bash
npm test -- invoices-service.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should fetch"
```

### Debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

The test suite runs automatically in CI with:
- Coverage report generation
- Threshold enforcement
- Failed test reporting

## Troubleshooting

### Tests timing out
Increase timeout in jest.config.js:
```javascript
testTimeout: 10000
```

### Module not found errors
Check `moduleNameMapper` in jest.config.js

### Mock not working
Ensure mocks are cleared in `beforeEach`:
```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
