// src/shared/components/FacebookLoginButton.tsx
// Facebook Login Component for Data Deletion Testing
// Permite a los usuarios hacer login con Facebook y probar el proceso de eliminación

import React, { useState, useEffect } from 'react';
import facebookAuth from '../../services/facebookAuthService';

interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface FacebookLoginButtonProps {
  onLogin?: (user: FacebookUser) => void;
  onLogout?: () => void;
  onError?: (error: string) => void;
  onDataDeletionRequest?: (confirmationCode: string) => void;
  className?: string;
  testMode?: boolean; // For development/testing
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onLogin,
  onLogout,
  onError,
  onDataDeletionRequest,
  className = '',
  testMode = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<FacebookUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Facebook SDK on component mount
  useEffect(() => {
    const initializeFacebook = async () => {
      try {
        await facebookAuth.initialize();
        setIsInitialized(true);
        
        // Check if user is already logged in
        const status = await facebookAuth.checkLoginStatus();
        if (status.status === 'connected') {
          const userData = await facebookAuth.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
          onLogin?.(userData);
        }
      } catch (error) {
        console.error('Facebook initialization error:', error);
        onError?.('Failed to initialize Facebook login');
      }
    };

    initializeFacebook();
  }, [onLogin, onError]);

  // Handle Facebook login
  const handleLogin = async () => {
    if (!isInitialized) {
      onError?.('Facebook SDK not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const result = await facebookAuth.login(['email']);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsLoggedIn(true);
        onLogin?.(result.user);
      } else {
        onError?.(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      onError?.('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Facebook logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await facebookAuth.logout();
      setUser(null);
      setIsLoggedIn(false);
      onLogout?.();
    } catch (error) {
      console.error('Facebook logout error:', error);
      onError?.('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle data deletion request
  const handleDataDeletionRequest = async () => {
    if (!isLoggedIn) {
      onError?.('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await facebookAuth.requestDataDeletion();
      
      if (result.success && result.confirmationCode) {
        onDataDeletionRequest?.(result.confirmationCode);
      } else {
        onError?.(result.error || 'Data deletion request failed');
      }
    } catch (error) {
      console.error('Data deletion request error:', error);
      onError?.('Data deletion request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if Facebook is not available and not in test mode
  if (!testMode && !facebookAuth.isAvailable() && !isInitialized) {
    return null;
  }

  return (
    <div className={`facebook-login-component ${className}`}>
      {!isLoggedIn ? (
        // Login Button
        <button
          onClick={handleLogin}
          disabled={isLoading || !isInitialized}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </>
          )}
        </button>
      ) : (
        // Logged in state
        <div className="facebook-user-info">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {user?.picture && (
              <img 
                src={user.picture.data.url} 
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500">Facebook ID: {user?.id}</p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleDataDeletionRequest}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Requesting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Request Data Deletion
                </>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      
      {testMode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800">Testing Mode</h4>
          <p className="text-xs text-yellow-700 mt-1">
            This component is for testing Meta's data deletion callback. 
            Set VITE_FACEBOOK_APP_ID to enable full functionality.
          </p>
          {!facebookAuth.getConfig().appId && (
            <p className="text-xs text-red-600 mt-1">
              Facebook App ID not configured.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FacebookLoginButton;

/* 
Usage Example:

import FacebookLoginButton from '@/shared/components/FacebookLoginButton';

<FacebookLoginButton
  onLogin={(user) => console.log('User logged in:', user)}
  onLogout={() => console.log('User logged out')}
  onError={(error) => console.error('Facebook error:', error)}
  onDataDeletionRequest={(code) => {
    console.log('Data deletion requested, confirmation code:', code);
    // Redirect to status page or show confirmation
    window.open(`/deletion-status?code=${code}`, '_blank');
  }}
  testMode={true} // Enable for development
  className="w-full"
/>

Testing Flow:
1. User clicks "Continue with Facebook"
2. Facebook login popup appears
3. After successful login, user data is displayed
4. User clicks "Request Data Deletion"
5. Confirmation code is generated and displayed
6. User can check status using the confirmation code

For complete Meta integration testing:
1. Set up Facebook App with Data Deletion Request URL
2. Use the "remove app" method in Facebook Settings
3. This triggers the actual Meta callback to our Edge Function
*/ 