import React, { useState } from 'react';

/**
 * ProfileHero Component Matrix
 * High-density compound layout engine for ERP dashboard hero panels.
 */
export default function ProfileHero({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4 ${className}`}>
      {children}
    </div>
  );
}

// 1. Header Row Container Slot
function Header({ children, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 w-full ${className}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

// 2. Title Text Typography Slot
function Title({ children, className = '' }) {
  return (
    <h2 className={`text-base font-bold text-slate-900 dark:text-white truncate tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

// 3. Encapsulated Unique Identifier Clipboard Control Slot
function Identity({ idText, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!idText) return;
    const cleanId = idText.replace(/^ID:\s*/i, '');
    navigator.clipboard.writeText(cleanId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!idText) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors select-none ${className}`}
    >
      <span>{idText}</span>
      <span className="material-symbols-outlined text-[14px] text-slate-400">
        {copied ? 'check' : 'content_copy'}
      </span>
    </button>
  );
}

// 4. Meta Elements Layout Grouping Slot
function MetaGroup({ children, variant = 'chips', className = '' }) {
  const layoutClass = variant === 'chips' 
    ? 'flex flex-wrap gap-2 pt-0.5' 
    : 'flex flex-col gap-1.5 pt-0.5';
  return (
    <div className={`${layoutClass} ${className}`}>
      {children}
    </div>
  );
}

// 5. Atomic Metadata Entry / High-Density Card Chip Slot with colorful icon support
function MetaItem({ icon, text, variant = 'chip', iconColorClass = 'text-primary', className = '' }) {
  if (variant === 'chip') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 ${className}`}>
        {icon && (
          <span className={`material-symbols-outlined text-[15px] shrink-0 ${iconColorClass}`}>
            {icon}
          </span>
        )}
        <span className="truncate">{text}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 ${className}`}>
      {icon && (
        <span className={`material-symbols-outlined text-[16px] shrink-0 ${iconColorClass}`}>
          {icon}
        </span>
      )}
      <span className="truncate">{text}</span>
    </div>
  );
}

// 6. Primary Action Footer Tray Slot
function Actions({ children, className = '' }) {
  return (
    <div className={`shrink-0 w-full flex items-center gap-2 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800/60 ${className}`}>
      {children}
    </div>
  );
}

// 7. Responsive Header Actions Container
function HeaderActions({ children }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const desktopActions = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { variant: 'button' });
    }
    return child;
  });

  const mobileActions = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const originalClick = child.props.onClick;
      const handleActionClick = (e) => {
        if (originalClick) originalClick(e);
        setShowDropdown(false);
      };
      return React.cloneElement(child, { 
        variant: 'menu',
        onClick: handleActionClick
      });
    }
    return child;
  });

  return (
    <div className="shrink-0 flex items-center gap-2">
      {/* Desktop view: Horizontal Action buttons */}
      <div className="hidden md:flex items-center gap-2">
        {desktopActions}
      </div>

      {/* Mobile view: 3-dot overflow dropdown */}
      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {mobileActions}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Assign Sub-Component Namespaces
ProfileHero.Header = Header;
ProfileHero.Title = Title;
ProfileHero.Identity = Identity;
ProfileHero.MetaGroup = MetaGroup;
ProfileHero.MetaItem = MetaItem;
ProfileHero.Actions = Actions;
ProfileHero.HeaderActions = HeaderActions;
