import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Breadcrumbs component for standardized dashboard navigation.
 * @param {Array} items - Array of { label, path, icon }
 * @param {string} separator - Material symbol icon name for the separator
 */
const Breadcrumbs = ({ items = [], separator = 'chevron_right' }) => {
  return (
    <nav className="flex items-center flex-wrap gap-2 text-sm font-medium text-text-secondary">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const hasPath = !!item.path;

        return (
          <React.Fragment key={index}>
            <div className="flex items-center gap-1.5">
              {hasPath && !isLast ? (
                <Link 
                  to={item.path} 
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  {item.icon && (
                    <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className={`flex items-center gap-1.5 ${isLast ? 'text-primary font-bold' : ''}`}>
                  {item.icon && (
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </div>
              )}
            </div>

            {!isLast && (
              <span className="material-symbols-outlined text-slate-400 text-xs font-black select-none">
                {separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
