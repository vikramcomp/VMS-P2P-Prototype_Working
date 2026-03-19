import { logger } from '../logger'

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('info', () => {
    it('should not log in test environment (NODE_ENV=test)', () => {
      logger.info('Test info message')
      // Logger only logs in development/production, not in test
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should log error messages with data', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', { error })
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message')
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should log warning messages with data', () => {
      const data = { warning: 'test' }
      logger.warn('Warning message', data)
      expect(consoleWarnSpy).toHaveBeenCalled()
    })
  })

  describe('debug', () => {
    it('should not log in test environment', () => {
      logger.debug('Test debug message')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })
})
