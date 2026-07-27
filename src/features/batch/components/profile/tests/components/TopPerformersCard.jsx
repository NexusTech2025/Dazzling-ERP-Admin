import React from 'react';
import Card from '../../../../../../components/ui/Card';

const BADGE_COLORS = [
  { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: 'workspace_premium', label: '1st Rank' },
  { bg: 'bg-slate-400/10 text-slate-400 border-slate-400/20', icon: 'workspace_premium', label: '2nd Rank' },
  { bg: 'bg-amber-700/10 text-amber-700 border-amber-700/20', icon: 'workspace_premium', label: '3rd Rank' },
];

export default function TopPerformersCard({ toppers = [], totalMarks = 100 }) {
  if (!toppers || toppers.length === 0) return null;

  return (
    <Card variant="default" className="h-full">
      <Card.Header border={true} className="flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-500">emoji_events</span>
        <h4 className="text-sm font-bold text-text-main dark:text-white">
          Top Performers
        </h4>
      </Card.Header>

      <Card.Body className="p-4 space-y-3">
        {toppers.map((student, idx) => {
          const badgeConfig = BADGE_COLORS[idx] || BADGE_COLORS[2];
          return (
            <div
              key={student.student_id || idx}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${badgeConfig.bg}`}>
                  <span className="material-symbols-outlined text-[18px]">{badgeConfig.icon}</span>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-main dark:text-white">
                    {student.student_name || `Student ID: ${student.student_id}`}
                  </h5>
                  <span className="text-xs text-text-secondary">
                    {badgeConfig.label}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-primary block">
                  {student.obtained} / {totalMarks}
                </span>
                <span className="text-xs text-text-secondary">
                  {student.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
}
