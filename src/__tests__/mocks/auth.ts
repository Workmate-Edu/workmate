export default {
  providers: [],
  adapter: {
    connect: jest.fn(),
    createUser: jest.fn(),
    getUser: jest.fn()
  },
  session: { strategy: 'jwt' },
  secret: 'test-secret'
}
