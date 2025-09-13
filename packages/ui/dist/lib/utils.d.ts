import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatPrice(price: number, currency?: string): string;
export declare function formatDate(date: string | Date): string;
export declare function formatDateTime(date: string | Date): string;
export declare function formatRelativeTime(date: string | Date): string;
export declare function truncateText(text: string, maxLength: number): string;
export declare function generateSlug(text: string): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
export declare function getInitials(name: string): string;
export declare function validateEmail(email: string): boolean;
export declare function validatePhone(phone: string): boolean;
export declare function generateId(): string;
export declare function sleep(ms: number): Promise<void>;
export declare function capitalizeFirst(str: string): string;
export declare function capitalizeWords(str: string): string;
//# sourceMappingURL=utils.d.ts.map