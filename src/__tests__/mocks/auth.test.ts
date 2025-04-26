import authMock from './auth'

describe('Auth Mock', () => {
  it('should provide mock auth config', () => {
    expect(authMock).toHaveProperty('session')
    expect(authMock).toHaveProperty('secret')
    expect(authMock.adapter).toBeDefined()
  })
})
