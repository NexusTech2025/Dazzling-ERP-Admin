import React from 'react';
import KpiCard from '../../../../../../components/ui/v2/KpiCard';

/**
 * Consolidated Marksheet Analytics KPI Banner.
 * Renders batch-level metrics: Total Tests Conducted, Class Cumulative Average, Batch Topper, and Evaluation Rate.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.batchKPIs - Calculated KPI payload from marksheetCalculators.
 */
export default function ConsolidatedMarksheetKPIs({ batchKPIs = {} }) {
  const {
    totalStudents = 0,
    totalTestsConducted = 0,
    overallClassAvg = 0,
    batchTopperName = '-',
    batchTopperScore = '-'
  } = batchKPIs;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard
        label="Total Conducted Tests"
        value={`${totalTestsConducted} Tests`}
        icon="assignment"
        variant="info"
        size="lg"
        isCount={true}
        className="!max-w-none"
      />
      <KpiCard
        label="Overall Class Average"
        value={`${overallClassAvg}%`}
        icon="analytics"
        variant={overallClassAvg >= 75 ? 'success' : overallClassAvg >= 50 ? 'warning' : 'danger'}
        size="lg"
        isCount={true}
        className="!max-w-none"
      />
      <KpiCard
        label="Batch Topper"
        value={batchTopperName}
        icon="military_tech"
        variant="success"
        size="lg"
        isCount={true}
        trend={
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ({batchTopperScore})
          </span>
        }
        className="!max-w-none"
      />
      <KpiCard
        label="Enrolled Candidates"
        value={`${totalStudents} Students`}
        icon="groups"
        variant="neutral"
        size="lg"
        isCount={true}
        className="!max-w-none"
      />
    </div>
  );
}
