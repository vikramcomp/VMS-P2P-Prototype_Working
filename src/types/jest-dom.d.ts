/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
    }
  }
}

export {}
