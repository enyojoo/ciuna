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
export declare class BusinessService {
    /**
     * Get available subscription plans
     */
    static getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
    /**
     * Get user's current subscription
     */
    static getUserSubscription(userId: string): Promise<UserSubscription | null>;
    /**
     * Create or update user subscription
     */
    static createSubscription(userId: string, planId: string, billingCycle: 'MONTHLY' | 'YEARLY', paymentMethodId?: string): Promise<{
        success: boolean;
        subscriptionId?: string;
    }>;
    /**
     * Cancel user subscription
     */
    static cancelSubscription(userId: string, cancelAtPeriodEnd?: boolean): Promise<boolean>;
    /**
     * Create business report
     */
    static createBusinessReport(userId: string, reportType: BusinessReport['report_type'], title: string, dateRangeStart: string, dateRangeEnd: string, filters?: Record<string, any>): Promise<{
        success: boolean;
        reportId?: string;
    }>;
    /**
     * Get business reports
     */
    static getBusinessReports(userId: string, limit?: number, offset?: number): Promise<BusinessReport[]>;
    /**
     * Get business metrics
     */
    static getBusinessMetrics(userId: string, startDate: string, endDate: string): Promise<Record<string, any>>;
    /**
     * Get inventory items
     */
    static getInventoryItems(userId: string, limit?: number, offset?: number): Promise<InventoryItem[]>;
    /**
     * Create inventory item
     */
    static createInventoryItem(userId: string, itemData: Partial<InventoryItem>): Promise<{
        success: boolean;
        itemId?: string;
    }>;
    /**
     * Update inventory quantity
     */
    static updateInventoryQuantity(inventoryItemId: string, quantityChange: number, movementType: InventoryMovement['movement_type'], reason?: string, referenceId?: string, referenceType?: string, createdBy?: string): Promise<boolean>;
    /**
     * Get inventory movements
     */
    static getInventoryMovements(inventoryItemId: string, limit?: number, offset?: number): Promise<InventoryMovement[]>;
    /**
     * Get business goals
     */
    static getBusinessGoals(userId: string, status?: BusinessGoal['status']): Promise<BusinessGoal[]>;
    /**
     * Create business goal
     */
    static createBusinessGoal(userId: string, goalData: Partial<BusinessGoal>): Promise<{
        success: boolean;
        goalId?: string;
    }>;
    /**
     * Update business goal progress
     */
    static updateGoalProgress(goalId: string, currentValue: number): Promise<boolean>;
    /**
     * Get business notifications
     */
    static getBusinessNotifications(userId: string, unreadOnly?: boolean, limit?: number, offset?: number): Promise<BusinessNotification[]>;
    /**
     * Mark notification as read
     */
    static markNotificationAsRead(notificationId: string): Promise<boolean>;
    /**
     * Get low inventory alerts
     */
    static getLowInventoryAlerts(userId: string): Promise<InventoryItem[]>;
    /**
     * Get business dashboard data
     */
    static getBusinessDashboard(userId: string): Promise<{
        metrics: Record<string, any>;
        goals: BusinessGoal[];
        notifications: BusinessNotification[];
        lowInventory: InventoryItem[];
    }>;
}
//# sourceMappingURL=business.d.ts.map