// src/services/facebookAuthService.ts
// Facebook Login Service for Data Deletion Callback Testing
// Provides basic Facebook authentication integration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Facebook SDK configuration
interface FacebookConfig {
  appId: string;
  version: string;
}

// Facebook user data interface
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

// Facebook response interface
interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

class FacebookAuthService {
  private isInitialized = false;
  private config: FacebookConfig;

  constructor() {
    this.config = {
      appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
      version: 'v18.0'
    };
  }

  // Initialize Facebook SDK
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.config.appId) {
      console.warn('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID environment variable.');
      return;
    }

    return new Promise((resolve, reject) => {
      // Load Facebook SDK script
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.onload = () => {
          this.initSDK().then(resolve).catch(reject);
        };
        script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
        document.body.appendChild(script);
      } else {
        this.initSDK().then(resolve).catch(reject);
      }
    });
  }

  // Initialize Facebook SDK configuration
  private async initSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        window.FB.init({
          appId: this.config.appId,
          cookie: true,
          xfbml: true,
          version: this.config.version,
          status: true
        });

        this.isInitialized = true;
        console.log('Facebook SDK initialized successfully');
        resolve();
      } catch (error) {
        console.error('Facebook SDK initialization error:', error);
        reject(error);
      }
    });
  }

  // Check if user is logged in to Facebook
  async checkLoginStatus(): Promise<{
    status: 'connected' | 'not_authorized' | 'unknown';
    authResponse?: FacebookAuthResponse;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      window.FB.getLoginStatus((response: any) => {
        resolve({
          status: response.status,
          authResponse: response.authResponse
        });
      });
    });
  }

  // Login with Facebook
  async login(permissions: string[] = ['email']): Promise<{
    success: boolean;
    user?: FacebookUser;
    authResponse?: FacebookAuthResponse;
    error?: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      window.FB.login((response: any) => {
        if (response.status === 'connected' && response.authResponse) {
          this.getCurrentUser()
            .then(user => {
              resolve({
                success: true,
                user,
                authResponse: response.authResponse
              });
            })
            .catch(error => {
              resolve({
                success: false,
                error: error.message
              });
            });
        } else {
          resolve({
            success: false,
            error: 'User cancelled login or did not fully authorize'
          });
        }
      }, { scope: permissions.join(',') });
    });
  }

  // Get current Facebook user data
  async getCurrentUser(): Promise<FacebookUser> {
    return new Promise((resolve, reject) => {
      window.FB.api('/me', { fields: 'id,name,email,picture' }, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(new Error(response?.error?.message || 'Failed to get user data'));
        }
      });
    });
  }

  // Logout from Facebook
  async logout(): Promise<void> {
    return new Promise((resolve) => {
      window.FB.logout(() => {
        console.log('User logged out from Facebook');
        resolve();
      });
    });
  }

  // Create a data deletion request for Facebook user
  async requestDataDeletion(): Promise<{
    success: boolean;
    confirmationCode?: string;
    error?: string;
  }> {
    try {
      const status = await this.checkLoginStatus();
      
      if (status.status !== 'connected' || !status.authResponse) {
        return {
          success: false,
          error: 'User not connected to Facebook'
        };
      }

      const user = await this.getCurrentUser();

      // Create deletion request in our database
      const { data, error } = await supabase
        .from('data_deletion_requests')
        .insert({
          facebook_user_id: user.id,
          email: user.email,
          source: 'facebook_login',
          status: 'pending',
          additional_data: {
            facebook_name: user.name,
            facebook_picture: user.picture?.data?.url,
            user_agent: navigator.userAgent
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          error: 'Failed to create deletion request'
        };
      }

      return {
        success: true,
        confirmationCode: data.confirmation_code
      };
    } catch (error) {
      console.error('Data deletion request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Check if Facebook SDK is available
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.FB && this.isInitialized;
  }

  // Get app configuration
  getConfig(): FacebookConfig {
    return { ...this.config };
  }
}

// Global Facebook SDK type declaration
declare global {
  interface Window {
    FB: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
      logout: (callback: () => void) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
      api: (path: string, params: any, callback: (response: any) => void) => void;
    };
  }
}

// Export singleton instance
export const facebookAuth = new FacebookAuthService();
export default facebookAuth;

/* 
Setup Instructions:

1. Add environment variable to .env:
   VITE_FACEBOOK_APP_ID=your_facebook_app_id

2. Configure Facebook App Dashboard:
   - Add your domain to App Domains
   - Set Valid OAuth Redirect URIs
   - Configure Data Deletion Request URL:
     https://your-project.supabase.co/functions/v1/data-deletion-callback

3. Usage in components:
   import facebookAuth from '@/services/facebookAuthService';
   
   // Initialize
   await facebookAuth.initialize();
   
   // Login
   const result = await facebookAuth.login(['email']);
   
   // Request data deletion
   const deletion = await facebookAuth.requestDataDeletion();

4. Testing Data Deletion Callback:
   - Login with Facebook
   - Go to Facebook Settings > Apps and Websites
   - Remove Host Helper AI app
   - This triggers the callback to our Edge Function
*/ 