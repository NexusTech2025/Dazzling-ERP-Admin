import React, { useState, useEffect, useRef } from 'react';
import CardContainer from './CardContainer';
import { mergeSlotClasses } from './cardUtils';

const LowDensityCard = ({
  avatar,
  avatarText,
  icon,
  title,
  subtitle1,
  subtitle2,
  bodyText, // Right-side aligned description text/pill
  actions = [], // Array of [{ label, icon, onClick }]
  onClick,
  className = '',
  slotClasses = {}
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showMenu]);

  const priorityOrder = { primary: 1, secondary: 2, tertiary: 3 };
  const sortedActions = [...actions].sort((a, b) => {
    const wA = priorityOrder[a.priority] || 99;
    const wB = priorityOrder[b.priority] || 99;
    return wA - wB;
  });

  return (
    <CardContainer 
      onClick={onClick} 
      density="low" 
      overflowVisible={true}
      className={mergeSlotClasses("min-h-[84px] py-4 flex items-center justify-between px-6 relative", `${className} ${slotClasses.container || ''}`)}
    >
      {/* Left side content: Avatar & Typographical Stack (60%) */}
      <div className="w-[60%] flex items-center gap-3 sm:gap-4 min-w-0 pr-4 flex-shrink-0">
        {avatar ? (
          <img 
            src={avatar} 
            alt={title} 
            className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] max-w-[36px] sm:min-w-[44px] sm:max-w-[44px] min-h-[36px] max-h-[36px] sm:min-h-[44px] sm:max-h-[44px] rounded-full object-cover bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-border-dark flex-shrink-0 ${slotClasses.avatar || ''}`}
          />
        ) : avatarText ? (
          <div className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] max-w-[36px] sm:min-w-[44px] sm:max-w-[44px] min-h-[36px] max-h-[36px] sm:min-h-[44px] sm:max-h-[44px] rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${slotClasses.avatar || ''}`}>
            {avatarText}
          </div>
        ) : icon ? (
          <div className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] max-w-[36px] sm:min-w-[44px] sm:max-w-[44px] min-h-[36px] max-h-[36px] sm:min-h-[44px] sm:max-h-[44px] rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0 ${slotClasses.avatar || ''}`}>
            {typeof icon === 'string' ? (
              <span className="material-symbols-outlined text-lg sm:text-xl">{icon}</span>
            ) : (
              icon
            )}
          </div>
        ) : null}

        {/* 3 stacked text elements */}
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <p className={`font-semibold text-text-main dark:text-white truncate text-[11px] sm:text-sm leading-tight ${slotClasses.title || ''}`}>
            {title}
          </p>
          {subtitle1 && (
            <p className={`font-mono text-[10px] sm:text-[11px] text-text-secondary dark:text-slate-400 truncate leading-none ${slotClasses.subtitle1 || ''}`}>
              {subtitle1}
            </p>
          )}
          {subtitle2 && (
            <p className={`text-[10px] sm:text-[11px] text-text-secondary dark:text-slate-400 truncate leading-none ${slotClasses.subtitle2 || ''}`}>
              {subtitle2}
            </p>
          )}
        </div>
      </div>

      {/* Middle content: Body Text (30%) */}
      <div className={mergeSlotClasses("w-[30%] flex-shrink-0 min-w-0 whitespace-normal break-words flex items-center justify-start md:justify-end px-2", slotClasses.body)}>
        {bodyText && (
          <div className="w-full flex md:justify-end text-left md:text-right whitespace-normal break-words">
            {typeof bodyText === 'string' ? (
              <span className="text-[10px] sm:text-xs font-semibold text-text-main dark:text-white whitespace-normal break-words">{bodyText}</span>
            ) : (
              bodyText
            )}
          </div>
        )}
      </div>

      {/* Right side content: Responsive Actions list (10%) */}
      <div className={mergeSlotClasses("w-[10%] flex-shrink-0 flex items-center justify-end relative pl-2", slotClasses.actions)}>
        {sortedActions.length > 0 && (
          <div className="flex items-center justify-end w-full">
            {/* Desktop: Side-by-side action buttons */}
            <div className="hidden @lg:flex items-center gap-1">
              {sortedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(e);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]"
                  title={action.label}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{action.icon}</span>
                </button>
              ))}
            </div>

            {/* Mobile: Three-dot dropdown actions menu */}
            <div className="@lg:hidden flex items-center relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(prev => !prev);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]"
                title="Actions"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">more_vert</span>
              </button>

              {showMenu && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg z-50 py-1.5 min-w-[130px] animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {sortedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        action.onClick(e);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 text-text-main dark:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary dark:text-slate-400">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CardContainer>
  );
};

export default LowDensityCard;
