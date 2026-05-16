import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Button (Core V2): Foundational action component.
 * Features:
 * - Variants: contained, outlined, text
 * - Sizes: sm, md, lg
 * - States: loading, disabled
 * - Icons: startIcon, endIcon (Material Symbols)
 * - Navigation: built-in support for react-router
 */
const Button = ({
  children,
  variant = "contained",
  size = "md",
  startIcon,
  endIcon,
  loading = false,
  disabled = false,

  // Behavior Props
  onClick,
  navigateTo,
  href,
  type = "button",

  className = "",
  ...props
}) => {
  const navigate = useNavigate();

  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-95";

  const sizes = {
    sm: "h-8 px-3 text-[10px] uppercase",
    md: "h-10 px-5 text-xs uppercase",
    lg: "h-12 px-8 text-sm uppercase",
  };

  const variants = {
    contained: "bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 focus:ring-primary/50",
    outlined: "border border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-400/50",
    text: "bg-transparent text-text-secondary hover:text-primary hover:bg-primary/5 focus:ring-primary/20",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 focus:ring-red-500/50",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 focus:ring-emerald-500/50",
  };

  const handleClick = (e) => {
    if (disabled || loading) return;

    if (onClick) onClick(e);

    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const content = (
    <>
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : (
        <>
          {startIcon && (
            <span className="material-symbols-outlined text-[18px]">{startIcon}</span>
          )}
          {children}
          {endIcon && (
            <span className="material-symbols-outlined text-[18px]">{endIcon}</span>
          )}
        </>
      )}
    </>
  );

  // Anchor support (external navigation)
  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
