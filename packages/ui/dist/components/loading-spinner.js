import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { cn } from "../lib/utils";
const LoadingSpinner = React.forwardRef(({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };
    return (_jsx("div", { ref: ref, className: cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], className), ...props }));
});
LoadingSpinner.displayName = "LoadingSpinner";
export { LoadingSpinner };
//# sourceMappingURL=loading-spinner.js.map