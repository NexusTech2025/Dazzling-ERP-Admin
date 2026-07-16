import { Link } from 'react-router-dom';

// 1. Core Container Layout Engine
const StickyHeaderRoot = ({ children, className = '' }) => {
    return (
        <div
            className={`sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 flex items-center gap-3 shrink-0 ${className}`}
        >
            {children}
        </div>
    );
};

// 2. Headless Navigation / Action Trigger
const StickyHeaderAction = ({ to, onClick, children, className = '' }) => {
    const baseClasses = "h-9 w-9 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0";

    if (to) {
        return (
            <Link to={to} className={`${baseClasses} ${className}`}>
                {children || <span className="material-symbols-outlined text-[22px]">arrow_back</span>}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${className}`}>
            {children || <span className="material-symbols-outlined text-[22px]">arrow_back</span>}
        </button>
    );
};

// 3. Information Stack Container
const StickyHeaderInfoStack = ({ children, className = '' }) => {
    return (
        <div className={`min-w-0 flex-1 ${className}`}>
            {children}
        </div>
    );
};

// 4. Content Slotted Text Elements
const StickyHeaderTitle = ({ children, className = '' }) => {
    return (
        <h1 className={`text-sm font-black text-slate-800 dark:text-slate-150 truncate ${className}`}>
            {children}
        </h1>
    );
};

const StickyHeaderSubtitle = ({ children, className = '' }) => {
    return (
        <p className={`text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider ${className}`}>
            {children}
        </p>
    );
};

// 5. Context Indicators Side Slot (Right side items)
const StickyHeaderSideSlot = ({ children, className = '' }) => {
    return (
        <div className={`shrink-0 flex items-center gap-2 ${className}`}>
            {children}
        </div>
    );
};

// Stitching the Compound Components together into a single global namespace
export const StickyHeader = Object.assign(StickyHeaderRoot, {
    Action: StickyHeaderAction,
    InfoStack: StickyHeaderInfoStack,
    Title: StickyHeaderTitle,
    Subtitle: StickyHeaderSubtitle,
    SideSlot: StickyHeaderSideSlot,
});