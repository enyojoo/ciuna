import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatPrice(price, currency = 'RUB') {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(price);
}
export function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}
export function formatDateTime(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}
export function formatRelativeTime(date) {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return 'только что';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} мин. назад`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ч. назад`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} дн. назад`;
    }
    return formatDate(date);
}
export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength) + '...';
}
export function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
export function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function validatePhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function capitalizeWords(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
//# sourceMappingURL=utils.js.map