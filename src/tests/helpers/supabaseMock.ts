/**
 * Supabase client mock for testing
 * Import this file in tests that need to mock Supabase client functionality
 */

// This will be properly typed when vitest is installed
const vi = {
  fn: () => {
    const mockFn = (...args: any[]) => mockFn.mock.calls.push(args);
    mockFn.mock = { calls: [] };
    mockFn.mockReturnThis = () => mockFn;
    mockFn.mockResolvedValue = (value: any) => {
      mockFn.mockImplementation(() => Promise.resolve(value));
      return mockFn;
    };
    mockFn.mockImplementation = (implementation: any) => {
      mockFn._implementation = implementation;
      return mockFn;
    };
    return mockFn;
  }
};

/**
 * Creates a mock Supabase client for testing
 * @param options Custom mock options to override defaults
 */
export const createSupabaseMock = (options: any = {}) => {
  const {
    auth = {},
    data = [],
    error = null,
    storage = {}
  } = options;

  // Default auth methods
  const defaultAuth = {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    ...auth
  };

  // Default storage methods
  const defaultStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock-url.com/image.jpg' } }),
      ...storage
    })
  };

  // Create the mock
  return {
    auth: defaultAuth,
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn().mockImplementation(callback => Promise.resolve(callback({ data, error }))),
    storage: defaultStorage
  };
};

/**
 * Mocks the Supabase module for testing
 * @param customMock Custom mock options
 */
export const mockSupabaseModule = (customMock: any = {}) => {
  const mock = createSupabaseMock(customMock);
  
  // This would be used with vitest
  // vi.mock('../../services/supabase', () => ({
  //   supabase: mock
  // }));
  
  return mock;
};

/**
 * Example usage:
 * 
 * // Mock successful user retrieval
 * mockSupabaseModule({
 *   auth: {
 *     getUser: vi.fn().mockResolvedValue({
 *       data: { 
 *         user: { 
 *           id: '123', 
 *           email: 'test@example.com' 
 *         } 
 *       },
 *       error: null
 *     })
 *   },
 *   data: [{ id: '1', name: 'Test Property' }],
 *   error: null
 * });
 */ 