/**
 * Auth context mock for testing
 * Provides a mock implementation of the AuthContext provider
 */

import React from 'react';

// This stub will be replaced when proper testing is set up
// We would typically import the real AuthContext from the app
const AuthContext = React.createContext<any>(null);

// Mock implementation of vi.fn()
const mockFn = () => {
  const fn = () => {};
  fn.mockResolvedValue = () => fn;
  return fn;
};

/**
 * Creates a mock auth context value
 * @param options Custom options to override defaults
 */
export const createAuthMock = (options: any = {}) => {
  return {
    // Default mock values
    user: null,
    session: null,
    isLoading: false,
    signIn: mockFn(),
    signOut: mockFn(),
    signUp: mockFn(),
    // Override with custom values
    ...options
  };
};

/**
 * A mock AuthProvider component for testing
 */
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  mockValue?: any;
}> = ({ children, mockValue = {} }) => {
  const authValue = createAuthMock(mockValue);
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Example usage:
 * 
 * render(
 *   <MockAuthProvider mockValue={{
 *     user: { id: '123', email: 'test@example.com' },
 *     isLoading: false
 *   }}>
 *     <ComponentToTest />
 *   </MockAuthProvider>
 * );
 */ 