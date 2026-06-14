/**
 * cardUtils.js
 * Spacing and styling utility functions for design system card components.
 */

/**
 * Merges default classes with custom slot override classes.
 * Intelligently resolves spacing & sizing clashes (padding, margin, gap, height, width)
 * by removing matching group prefixes from default styles if the custom styles override them.
 * 
 * @param {string} defaultClass - Default style class string
 * @param {string} customClass - User-supplied style class string
 * @returns {string} Combined and filtered class string
 */
export const mergeSlotClasses = (defaultClass = '', customClass = '') => {
  if (!customClass) return defaultClass;

  const defaultClasses = defaultClass.split(/\s+/).filter(Boolean);
  const customClasses = customClass.split(/\s+/).filter(Boolean);

  const SPACING_GROUPS = [
    ['p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-', 'ps-', 'pe-'],
    ['m-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-', 'ms-', 'me-'],
    ['gap-', 'gap-x-', 'gap-y-'],
    ['min-h-', 'h-', 'max-h-'],
    ['min-w-', 'w-', 'max-w-'],
    ['flex-1', 'flex-auto', 'flex-initial', 'flex-none']
  ];

  // Find all groups that are active in the custom class list
  const activeGroups = SPACING_GROUPS.filter(group =>
    customClasses.some(cCls => group.some(prefix => cCls.startsWith(prefix)))
  );

  // Flatten active groups prefixes that we want to filter out of the default classes
  const prefixesToRemove = activeGroups.flat();

  // Filter default classes
  const filteredDefault = defaultClasses.filter(dCls =>
    !prefixesToRemove.some(prefix => dCls.startsWith(prefix))
  );

  // Combine remaining defaults with all custom classes
  return [...filteredDefault, ...customClasses].join(' ');
};
