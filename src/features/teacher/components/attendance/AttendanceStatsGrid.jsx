import React from 'react';
import KpiGrid from '../../../../components/ui/v2/KpiGrid';
import KpiCard from '../../../../components/ui/v2/KpiCard';

export const AttendanceStatsGrid = ({ metrics, isMobile }) => {
  const { total, present, absent, late, unrecorded } = metrics;

  // Mobile rendering layout branch
  if (isMobile) {
    return (
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-black/30 p-1.5 border border-border-light dark:border-white/5 rounded-xl self-start">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <span className="text-[9px] font-black uppercase tracking-wider">Total</span>
          <span className="text-xs font-black">{total}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <span className="text-[9px] font-black uppercase tracking-wider">Present</span>
          <span className="text-xs font-black">{present}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <span className="text-[9px] font-black uppercase tracking-wider">Late</span>
          <span className="text-xs font-black">{late}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <span className="text-[9px] font-black uppercase tracking-wider">Absent</span>
          <span className="text-xs font-black">{absent}</span>
        </div>
        {unrecorded > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
            <span className="text-[9px] font-black uppercase tracking-wider">NR</span>
            <span className="text-xs font-black">{unrecorded}</span>
          </div>
        )}
      </div>
    );
  }

  // Desktop rendering layout branch
  return (
    <KpiGrid cols={1} smCols={2} mdCols={3} lgCols={5} gap={3}>
      <KpiCard label="Total Teachers" value={total} icon="supervisor_account" variant="neutral" isCount={true} size="md" />
      <KpiCard label="Present" value={present} icon="check_circle" variant="success" isCount={true} size="md" />
      <KpiCard label="Late" value={late} icon="schedule" variant="warning" isCount={true} size="md" />
      <KpiCard label="Absent" value={absent} icon="cancel" variant="danger" isCount={true} size="md" />
      <KpiCard label="Not Recorded" value={unrecorded} icon="help" variant="info" isCount={true} size="md" />
    </KpiGrid>
  );
};
