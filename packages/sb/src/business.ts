import { supabase } from './client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  plan_type: 'BASIC' | 'PREMIUM' | 'ENTERPRISE' | 'CUSTOM';
  price_monthly: number;
  price_yearly?: number;
  currency_code: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
  trial_days: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  billing_cycle: 'MONTHLY' | 'YEARLY';
  price: number;
  currency_code: string;
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;
  cancel_at_period_end: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BusinessReport {
  id: string;
  user_id: string;
  report_type: 'SALES' | 'REVENUE' | 'ORDERS' | 'CUSTOMERS' | 'INVENTORY' | 'PERFORMANCE' | 'CUSTOM';
  title: string;
  description?: string;
  date_range_start: string;
  date_range_end: string;
  filters: Record<string, any>;
  data: Record<string, any>;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  generated_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface BusinessMetric {
  id: string;
  user_id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  date: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  currency_code: string;
  cost?: number;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  unit: string;
  weight?: number;
  dimensions: Record<string, any>;
  images: string[];
  tags: string[];
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE' | 'LOSS';
  quantity: number;
  reason?: string;
  reference_id?: string;
  reference_type?: string;
  cost_per_unit?: number;
  total_cost?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface BusinessGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: 'REVENUE' | 'SALES' | 'CUSTOMERS' | 'ORDERS' | 'INVENTORY' | 'CUSTOM';
  target_value: number;
  current_value: number;
  unit?: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  progress_percentage: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BusinessNotification {
  id: string;
  user_id: string;
  notification_type: 'LOW_INVENTORY' | 'GOAL_ACHIEVED' | 'GOAL_AT_RISK' | 'REVENUE_MILESTONE' | 'ORDER_ALERT' | 'CUSTOMER_INSIGHT' | 'PERFORMANCE_ALERT' | 'CUSTOM';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  is_read: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export class BusinessService {
  /**
   * Get available subscription plans
   */
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSubscriptionPlans:', error);
      return [];
    }
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            name,
            plan_type,
            features,
            limits
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No active subscription
        }
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  /**
   * Create or update user subscription
   */
  static async createSubscription(
    userId: string,
    planId: string,
    billingCycle: 'MONTHLY' | 'YEARLY',
    paymentMethodId?: string
  ): Promise<{ success: boolean; subscriptionId?: string }> {
    try {
      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        return { success: false };
      }

      const price = billingCycle === 'YEARLY' ? plan.price_yearly : plan.price_monthly;
      const currencyCode = plan.currency_code;

      // Calculate period dates
      const now = new Date();
      const periodStart = now;
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'YEARLY' ? 12 : 1));

      // Create subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          billing_cycle: billingCycle,
          price: price || plan.price_monthly,
          currency_code: currencyCode,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_ends_at: plan.trial_days > 0 ? 
            new Date(now.getTime() + plan.trial_days * 24 * 60 * 60 * 1000).toISOString() : 
            null,
          status: plan.trial_days > 0 ? 'TRIAL' : 'ACTIVE',
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        return { success: false };
      }

      return { success: true, subscriptionId: data.id };
    } catch (error) {
      console.error('Error in createSubscription:', error);
      return { success: false };
    }
  }

  /**
   * Cancel user subscription
   */
  static async cancelSubscription(
    userId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: cancelAtPeriodEnd,
          cancelled_at: cancelAtPeriodEnd ? null : new Date().toISOString(),
          status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELLED',
        })
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (error) {
        console.error('Error canceling subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return false;
    }
  }

  /**
   * Create business report
   */
  static async createBusinessReport(
    userId: string,
    reportType: BusinessReport['report_type'],
    title: string,
    dateRangeStart: string,
    dateRangeEnd: string,
    filters?: Record<string, any>
  ): Promise<{ success: boolean; reportId?: string }> {
    try {
      const { data, error } = await supabase.rpc('create_business_report', {
        p_user_id: userId,
        p_report_type: reportType,
        p_title: title,
        p_date_range_start: dateRangeStart,
        p_date_range_end: dateRangeEnd,
        p_filters: filters || {},
      });

      if (error) {
        console.error('Error creating business report:', error);
        return { success: false };
      }

      return { success: true, reportId: data };
    } catch (error) {
      console.error('Error in createBusinessReport:', error);
      return { success: false };
    }
  }

  /**
   * Get business reports
   */
  static async getBusinessReports(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<BusinessReport[]> {
    try {
      const { data, error } = await supabase
        .from('business_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching business reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBusinessReports:', error);
      return [];
    }
  }

  /**
   * Get business metrics
   */
  static async getBusinessMetrics(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase.rpc('calculate_business_metrics', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        console.error('Error calculating business metrics:', error);
        return {};
      }

      return data || {};
    } catch (error) {
      console.error('Error in getBusinessMetrics:', error);
      return {};
    }
  }

  /**
   * Get inventory items
   */
  static async getInventoryItems(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching inventory items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInventoryItems:', error);
      return [];
    }
  }

  /**
   * Create inventory item
   */
  static async createInventoryItem(
    userId: string,
    itemData: Partial<InventoryItem>
  ): Promise<{ success: boolean; itemId?: string }> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          user_id: userId,
          ...itemData,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating inventory item:', error);
        return { success: false };
      }

      return { success: true, itemId: data.id };
    } catch (error) {
      console.error('Error in createInventoryItem:', error);
      return { success: false };
    }
  }

  /**
   * Update inventory quantity
   */
  static async updateInventoryQuantity(
    inventoryItemId: string,
    quantityChange: number,
    movementType: InventoryMovement['movement_type'],
    reason?: string,
    referenceId?: string,
    referenceType?: string,
    createdBy?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_inventory_quantity', {
        p_inventory_item_id: inventoryItemId,
        p_quantity_change: quantityChange,
        p_movement_type: movementType,
        p_reason: reason || null,
        p_reference_id: referenceId || null,
        p_reference_type: referenceType || null,
        p_created_by: createdBy || null,
      });

      if (error) {
        console.error('Error updating inventory quantity:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in updateInventoryQuantity:', error);
      return false;
    }
  }

  /**
   * Get inventory movements
   */
  static async getInventoryMovements(
    inventoryItemId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<InventoryMovement[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('inventory_item_id', inventoryItemId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching inventory movements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInventoryMovements:', error);
      return [];
    }
  }

  /**
   * Get business goals
   */
  static async getBusinessGoals(
    userId: string,
    status?: BusinessGoal['status']
  ): Promise<BusinessGoal[]> {
    try {
      let query = supabase
        .from('business_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching business goals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBusinessGoals:', error);
      return [];
    }
  }

  /**
   * Create business goal
   */
  static async createBusinessGoal(
    userId: string,
    goalData: Partial<BusinessGoal>
  ): Promise<{ success: boolean; goalId?: string }> {
    try {
      const { data, error } = await supabase
        .from('business_goals')
        .insert({
          user_id: userId,
          ...goalData,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating business goal:', error);
        return { success: false };
      }

      return { success: true, goalId: data.id };
    } catch (error) {
      console.error('Error in createBusinessGoal:', error);
      return { success: false };
    }
  }

  /**
   * Update business goal progress
   */
  static async updateGoalProgress(
    goalId: string,
    currentValue: number
  ): Promise<boolean> {
    try {
      // Get goal details
      const { data: goal, error: goalError } = await supabase
        .from('business_goals')
        .select('target_value')
        .eq('id', goalId)
        .single();

      if (goalError || !goal) {
        return false;
      }

      const progressPercentage = Math.min((currentValue / goal.target_value) * 100, 100);
      const status = progressPercentage >= 100 ? 'COMPLETED' : 'ACTIVE';

      const { error } = await supabase
        .from('business_goals')
        .update({
          current_value: currentValue,
          progress_percentage: progressPercentage,
          status: status,
        })
        .eq('id', goalId);

      if (error) {
        console.error('Error updating goal progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateGoalProgress:', error);
      return false;
    }
  }

  /**
   * Get business notifications
   */
  static async getBusinessNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 20,
    offset: number = 0
  ): Promise<BusinessNotification[]> {
    try {
      let query = supabase
        .from('business_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching business notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBusinessNotifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('business_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  }

  /**
   * Get low inventory alerts
   */
  static async getLowInventoryAlerts(userId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .lte('quantity', 'min_quantity');

      if (error) {
        console.error('Error fetching low inventory alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLowInventoryAlerts:', error);
      return [];
    }
  }

  /**
   * Get business dashboard data
   */
  static async getBusinessDashboard(userId: string): Promise<{
    metrics: Record<string, any>;
    goals: BusinessGoal[];
    notifications: BusinessNotification[];
    lowInventory: InventoryItem[];
  }> {
    try {
      const [metrics, goals, notifications, lowInventory] = await Promise.all([
        this.getBusinessMetrics(userId, 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        this.getBusinessGoals(userId, 'ACTIVE'),
        this.getBusinessNotifications(userId, true, 5),
        this.getLowInventoryAlerts(userId),
      ]);

      return {
        metrics,
        goals,
        notifications,
        lowInventory,
      };
    } catch (error) {
      console.error('Error in getBusinessDashboard:', error);
      return {
        metrics: {},
        goals: [],
        notifications: [],
        lowInventory: [],
      };
    }
  }
}
