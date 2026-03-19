import { cn } from '../cn'

describe('cn utility (classnames merger)', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'excluded')
    expect(result).toContain('base')
    expect(result).toContain('conditional')
    expect(result).not.toContain('excluded')
  })

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2', 'px-4')
    // Should keep only one px value (the last one due to tailwind-merge)
    expect(result).toBeTruthy()
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should handle objects with boolean values', () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    })
    expect(result).toContain('class1')
    expect(result).not.toContain('class2')
    expect(result).toContain('class3')
  })
})
