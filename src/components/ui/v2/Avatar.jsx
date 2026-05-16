import React from 'react';

/**
 * Avatar: A foundational component for displaying user images or initials.
 * Supports multiple sizes and shapes.
 */
const Avatar = ({
  src,
  initials,
  alt = "Avatar",
  size = "md",
  variant = "circle",
  status, // 'online', 'offline', 'busy', 'away'
  className = ""
}) => {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
    "2xl": "h-32 w-32 text-4xl" // Hero size for profile headers
  };

  const shapes = {
    circle: "rounded-full",
    square: "rounded-none",
    rounded: "rounded-xl"
  };

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    busy: "bg-red-500",
    away: "bg-amber-500"
  };

  const statusIndicatorSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-3 w-3 border-2",
    lg: "h-4 w-4 border-2",
    xl: "h-5 w-5 border-4",
    "2xl": "h-6 w-6 border-4"
  };

  return (
    <div className={`relative inline-block ${sizes[size]} ${className}`}>
      <div 
        className={`
          w-full h-full flex items-center justify-center overflow-hidden
          bg-primary/10 text-primary font-bold border border-primary/20
          ${shapes[variant]}
        `}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials?.substring(0, 2).toUpperCase() || '?'}</span>
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span 
          className={`
            absolute bottom-0 right-0 rounded-full border-surface-light dark:border-surface-dark
            ${statusColors[status]} ${statusIndicatorSizes[size]}
            ${variant === 'square' ? '-translate-x-1/2 -translate-y-1/2' : ''}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
