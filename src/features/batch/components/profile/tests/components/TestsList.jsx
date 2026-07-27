import React from 'react';
import TestCard from './TestCard';

export default function TestsList({
  tests = [],
  isLoading = false,
  studentsCount = 0,
  onEnterMarks,
  onViewReport,
  onShareWhatsApp,
  onEdit,
  onDelete
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-44 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <div className="py-16 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <span className="material-symbols-outlined text-text-secondary/30 text-5xl mb-3 block">
          assignment_late
        </span>
        <h4 className="text-base font-bold text-text-main dark:text-white">
          No Tests Found
        </h4>
        <p className="text-sm text-text-secondary mt-1">
          There are no tests created matching the criteria. Click "+ Create New Test" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((test) => (
        <TestCard
          key={test.id}
          test={test}
          studentsCount={studentsCount}
          onEnterMarks={onEnterMarks}
          onViewReport={onViewReport}
          onShareWhatsApp={onShareWhatsApp}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
