import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { cn } from "../lib/utils";
const Avatar = React.forwardRef(({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
    };
    return (_jsx("div", { ref: ref, className: cn("relative flex shrink-0 overflow-hidden rounded-full bg-muted", sizeClasses[size], className), ...props, children: src ? (_jsx("img", { src: src, alt: alt, className: "aspect-square h-full w-full object-cover" })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-muted text-muted-foreground", children: fallback || "?" })) }));
});
Avatar.displayName = "Avatar";
export { Avatar };
//# sourceMappingURL=avatar.js.map