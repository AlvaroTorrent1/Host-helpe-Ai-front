import { useState, useEffect } from 'react';
import supabase from '@/services/supabase';
import { useAuth } from '@shared/contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid' | 'pending';
  current_period_end: string;
  created_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Moved fetchSubscription outside useEffect to be callable
  const fetchSubscription = async () => {
    // If no user is authenticated, don't attempt to fetch subscription
    if (!user?.id) {
      console.log('useSubscription: No authenticated user, skipping subscription fetch');
      setLoading(false);
      setSubscription(null);
      return;
    }
    
    setLoading(true);
    try {
      console.log('useSubscription: Fetching subscription for user:', user.id);
      
      // Primero intentamos buscar una suscripción activa
      // Using .limit(1) instead of .single() to avoid 406 errors when no rows exist
      const { data: activeData, error: activeError } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
        
      if (activeError) {
        console.log('useSubscription: Error querying active subscription:', activeError.message);
      } else if (activeData && activeData.length > 0) {
        console.log('useSubscription: Found active subscription:', activeData[0]);
        setSubscription(activeData[0] as Subscription);
        setLoading(false);
        return;
      } else {
        console.log('useSubscription: No active subscription found');
      }
      
      // Si no hay suscripción activa, buscamos cualquier otra (pendiente, cancelada, etc.)
      const { data: anyData, error: anyError } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (anyError) {
        console.log('useSubscription: Error querying any subscription:', anyError.message);
        setSubscription(null);
      } else if (anyData && anyData.length > 0) {
        console.log('useSubscription: Found subscription with status:', anyData[0].status);
        setSubscription(anyData[0] as Subscription);
      } else {
        console.log('useSubscription: No subscriptions found for user');
        setSubscription(null);
      }
    } catch (error) {
      console.error('useSubscription: Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]); // Only depend on user.id, not the entire user object
  
  // Function to manually refetch subscription
  const refetchSubscription = async () => {
    await fetchSubscription();
  };

  return { 
    subscription, 
    loading, 
    hasActiveSubscription: subscription?.status === 'active',
    planId: subscription?.plan_id,
    refetchSubscription
  };
}; 