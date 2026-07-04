import React from 'react';

// Static mappings to guarantee Tailwind CSS compiler detection of classes
const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

const smColsMap = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6'
};

const mdColsMap = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6'
};

const lgColsMap = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6'
};

const xlColsMap = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6'
};

const gapMap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8'
};

/**
 * A responsive grid container mapping children or card configs into columns.
 * Enforces Tailwind class safelisting through static class mappings.
 * 
 * @component
 */
const KpiGrid = ({
  children,
  cols = 1,
  smCols = 2,
  mdCols,
  lgCols = 5,
  xlCols,
  gap = 3,
  orientation = 'row', // 'row' | 'column'
  className = ''
}) => {
  const isColumn = orientation === 'column';
  const displayClass = isColumn ? 'flex flex-col' : 'grid';
  
  const baseClass = isColumn ? '' : (colsMap[cols] || 'grid-cols-1');
  const smClass = isColumn ? '' : (smColsMap[smCols] || '');
  const mdClass = isColumn ? '' : (mdCols ? (mdColsMap[mdCols] || '') : '');
  const lgClass = isColumn ? '' : (lgCols ? (lgColsMap[lgCols] || '') : '');
  const xlClass = isColumn ? '' : (xlCols ? (xlColsMap[xlCols] || '') : '');
  const gapClass = gapMap[gap] || 'gap-3';

  return (
    <div className={`${displayClass} ${baseClass} ${smClass} ${mdClass} ${lgClass} ${xlClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

export default KpiGrid;
