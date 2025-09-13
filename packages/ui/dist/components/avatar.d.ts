import React from "react";
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
}
declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export { Avatar };
//# sourceMappingURL=avatar.d.ts.map