// src/shared/contexts/UserStatusContext.tsx
// Context for managing user subscription status and permissions

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import supabase from '@/services/supabase';

// Types for user status
export interface UserLimits {
  maxProperties: number;
  maxReservationsPerMonth: number;
  maxDocumentsPerProperty: number;
  maxImagesPerProperty: number;
  canAccessAnalytics: boolean;
  canExportData: boolean;
}

export interface UserUsage {
  properties: number;
  reservationsThisMonth: number;
  currentMonth: string;
}

export interface UserPermissions {
  canCreateProperty: boolean;
  canCreateReservation: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
}

export interface UserStatus {
  userId: string;
  planId: string;
  subscriptionStatus: string;
  limits: UserLimits;
  usage: UserUsage;
  permissions: UserPermissions;
}

interface UserStatusContextType {
  userStatus: UserStatus | null;
  loading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  isFreePlan: boolean;
  isPaidPlan: boolean;
}

// Default free plan limits
const DEFAULT_FREE_LIMITS: UserLimits = {
  maxProperties: 1,
  maxReservationsPerMonth: 10,
  maxDocumentsPerProperty: 5,
  maxImagesPerProperty: 10,
  canAccessAnalytics: false,
  canExportData: false
};

// Create context
const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

// Provider component
export const UserStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Function to fetch user status
  const fetchUserStatus = useCallback(async () => {
    // Don't fetch if auth is still loading or no user
    if (authLoading || !user?.id) {
      setLoading(false);
      return;
    }

    // Avoid duplicate fetches
    if (hasFetched) return;

    try {
      setLoading(true);
      setError(null);

      // Call our PostgreSQL function
      const { data, error: fetchError } = await supabase
        .rpc('get_user_status', { p_user_id: user.id });

      if (fetchError) {
        console.error('Error fetching user status:', fetchError);
        setError(fetchError.message);
        
        // Set default free plan status on error - free users cannot create properties
        setUserStatus({
          userId: user.id,
          planId: 'free',
          subscriptionStatus: 'free',
          limits: DEFAULT_FREE_LIMITS,
          usage: {
            properties: 0,
            reservationsThisMonth: 0,
            currentMonth: new Date().toISOString().slice(0, 7)
          },
          permissions: {
            canCreateProperty: false, // Free users must upgrade to create properties
            canCreateReservation: true,
            canAccessAnalytics: false,
            canExportData: false
          }
        });
      } else if (data) {
        setUserStatus(data as UserStatus);
      }
      
      setHasFetched(true);
    } catch (err) {
      console.error('Unexpected error fetching user status:', err);
      setError('Failed to load user status');
      
      // Set default free plan status on error - free users cannot create properties
      if (user?.id) {
        setUserStatus({
          userId: user.id,
          planId: 'free',
          subscriptionStatus: 'free',
          limits: DEFAULT_FREE_LIMITS,
          usage: {
            properties: 0,
            reservationsThisMonth: 0,
            currentMonth: new Date().toISOString().slice(0, 7)
          },
          permissions: {
            canCreateProperty: false, // Free users must upgrade to create properties
            canCreateReservation: true,
            canAccessAnalytics: false,
            canExportData: false
          }
        });
      }
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading, hasFetched]);

  // Fetch status when user changes
  useEffect(() => {
    if (!authLoading && user?.id && !hasFetched) {
      fetchUserStatus();
    } else if (!authLoading && !user) {
      setUserStatus(null);
      setLoading(false);
      setHasFetched(false);
    }
  }, [user?.id, authLoading, hasFetched, fetchUserStatus]);

  // Computed properties
  const isFreePlan = userStatus?.planId === 'free';
  const isPaidPlan = userStatus?.planId !== 'free' && userStatus?.subscriptionStatus === 'active';

  // Memorizar refreshStatus para evitar loops infinitos
  const refreshStatus = useCallback(async () => {
    setHasFetched(false);
    await fetchUserStatus();
  }, [fetchUserStatus]);

  // Context value
  const value: UserStatusContextType = {
    userStatus,
    loading: loading || authLoading,
    error,
    refreshStatus,
    isFreePlan,
    isPaidPlan
  };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
};

// Custom hook to use the context
export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
};

// Utility hook for common permission checks
export const useCanCreateProperty = () => {
  const { userStatus, loading } = useUserStatus();
  
  // During loading, prevent creation until we know the real permissions
  if (loading || !userStatus) {
    return {
      canCreate: false, // Block creation until we know the real permissions
      loading,
      remainingProperties: 0
    };
  }
  
  return {
    canCreate: userStatus.permissions.canCreateProperty,
    loading,
    remainingProperties: userStatus.limits.maxProperties === -1 ? 
      Infinity : 
      Math.max(0, userStatus.limits.maxProperties - userStatus.usage.properties)
  };
};

export const useCanCreateReservation = () => {
  const { userStatus, loading } = useUserStatus();
  
  // During loading, allow reservation creation (less restrictive)
  if (loading || !userStatus) {
    return {
      canCreate: true,
      loading,
      remainingReservations: 10
    };
  }
  
  return {
    canCreate: userStatus.permissions.canCreateReservation,
    loading,
    remainingReservations: userStatus.limits.maxReservationsPerMonth === -1 ? 
      Infinity : 
      Math.max(0, userStatus.limits.maxReservationsPerMonth - userStatus.usage.reservationsThisMonth)
  };
}; 