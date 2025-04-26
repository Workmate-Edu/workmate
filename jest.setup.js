// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

jest.setTimeout(10000)

// Mock next-auth session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-user-id', role: 'teacher' }
  }))
}))

// Mock lib/auth instead of mongodb-adapter directly
jest.mock('@/lib/auth', () => ({
  default: {
    providers: [],
    adapter: {
      connect: jest.fn(),
      createUser: jest.fn(),
      getUser: jest.fn(),
    },
    session: { strategy: 'jwt' },
    secret: 'test-secret'
  }
}))