import React from 'react';

/**
 * ScrollableRibbon component that provides horizontal touch-swipe layouts for mobile KPIs and tab groups.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Inner elements to display horizontally.
 * @param {string} [props.className] - Optional custom CSS container class overrides.
 * @returns {React.ReactElement} Horizontal scroll ribbon container.
 */
export function ScrollableRibbon({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x select-none w-full ${className}`}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return (
          <div className="snap-clip shrink-0">
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default ScrollableRibbon;
