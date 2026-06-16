import React, { useEffect } from 'react';
import { mergeSlotClasses } from '../ui/v2/cards/cardUtils';

// Default style maps for slot fallbacks
const DEFAULT_LAYOUT_CLASSES = {
  container: "relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]",
  body: "py-0 px-2",
  header: "",
  footer: ""
};

/**
 * MainLayout Component: A vertical three-segment flex layout (Header, Body, Footer).
 * Confines scrollable page content to the body segment, preventing global viewport scrollbars
 * and locking sticky element context cleanly within the page viewport.
 * 
 * Props:
 * - header (node): Fixed element at the top
 * - body (node): Scrollable content area
 * - footer (node): Fixed actions bar at the bottom
 * - className (string): Additional custom CSS classes for the root container
 * - slotClasses (object): Style overrides for target sub-elements (container, header, body, footer)
 * - onBodyScroll (function): Scroll event handler bound to the scrollable body
 */
const MainLayout = ({ header, body, footer, className = '', slotClasses = {}, onBodyScroll }) => {
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.overflowY = 'hidden';
    }
    return () => {
      if (mainElement) {
        mainElement.style.overflowY = 'auto';
      }
    };
  }, []);

  const mergedSlotClasses = {
    container: slotClasses.container !== undefined ? slotClasses.container : DEFAULT_LAYOUT_CLASSES.container,
    body: slotClasses.body !== undefined ? slotClasses.body : DEFAULT_LAYOUT_CLASSES.body,
    header: slotClasses.header !== undefined ? slotClasses.header : DEFAULT_LAYOUT_CLASSES.header,
    footer: slotClasses.footer !== undefined ? slotClasses.footer : DEFAULT_LAYOUT_CLASSES.footer,
  };

  return (
    <div className={mergeSlotClasses("flex flex-col h-full w-full min-h-0", `${className} ${mergedSlotClasses.container}`)}>
      {header && (
        <div className={mergeSlotClasses("flex-none z-10", mergedSlotClasses.header)}>
          {header}
        </div>
      )}
      <div
        className={mergeSlotClasses("flex-1 overflow-y-auto min-h-0 py-4", mergedSlotClasses.body)}
        onScroll={onBodyScroll}
      >
        {body}
      </div>
      {footer && (
        <div className={mergeSlotClasses("flex-none z-10", mergedSlotClasses.footer)}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
