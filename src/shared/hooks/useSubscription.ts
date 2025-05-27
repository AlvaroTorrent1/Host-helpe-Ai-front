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
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Primero intentamos buscar una suscripción activa
        const { data: activeData, error: activeError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
          
        if (activeData) {
          setSubscription(activeData as Subscription);
          setLoading(false);
          return;
        }
        
        // Si no hay suscripción activa, buscamos cualquier otra (pendiente, cancelada, etc.)
        const { data: anyData, error: anyError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (anyData) {
          setSubscription(anyData as Subscription);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user]);
  
  return { 
    subscription, 
    loading, 
    hasActiveSubscription: subscription?.status === 'active',
    planId: subscription?.plan_id 
  };
}; 