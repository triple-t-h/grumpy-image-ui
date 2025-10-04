# Testing Setup

This project uses Mocha with Chai for testing TypeScript code.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run when files change)
npm run test:watch

# Type check test files
npm run typecheck:test
```

## Test Structure

Tests are located in the `tests/` directory and follow this structure:

- `tests/` - Root test directory
  - `core/` - Tests for core functionality
  - `*.test.ts` - Individual test files

## Writing Tests

### Basic Test Example

```typescript
import { expect } from 'chai'

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = someFunction(input)
    
    // Assert
    expect(result).to.equal('expected')
  })
})
```

### Testing Application Code

To test your actual application code, import it using the configured path aliases:

```typescript
import { someFunction } from '@core/utils'
import { createImageStore } from '@stores/image-store'
```

## Configuration Files

- `.mocharc.json` - Mocha configuration
- `tsconfig.test.json` - TypeScript configuration for tests
- Path aliases are configured for easy imports from `src/`

## Available Assertions

The project uses Chai for assertions. Common patterns:

```typescript
expect(value).to.be.true
expect(value).to.equal('expected')
expect(array).to.have.length(3)
expect(object).to.have.property('key')
expect(() => func()).to.throw()
```

For more assertion methods, see [Chai documentation](https://www.chaijs.com/api/bdd/).
