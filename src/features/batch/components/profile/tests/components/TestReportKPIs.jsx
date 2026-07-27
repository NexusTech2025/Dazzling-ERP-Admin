import React from 'react';
import KpiCard from '../../../../../../components/ui/v2/KpiCard';

export default function TestReportKPIs({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      <KpiCard
        label="TOTAL STUDENTS"
        value={kpis.total}
        icon="groups"
        size="md"
        variant="neutral"
        isCount={true}
      />
      <KpiCard
        label="PRESENT"
        value={kpis.present}
        icon="person_check"
        size="md"
        variant="success"
        isCount={true}
      />
      <KpiCard
        label="ABSENT"
        value={kpis.absent}
        icon="person_off"
        size="md"
        variant="danger"
        isCount={true}
      />
      <KpiCard
        label="CLASS AVERAGE"
        value={`${kpis.average}`}
        icon="analytics"
        size="md"
        variant="primary"
        isCount={true}
      />
      <KpiCard
        label="PASS RATE"
        value={`${kpis.passPercentage}%`}
        icon="check_circle"
        size="md"
        variant="success"
        isCount={true}
      />
      <KpiCard
        label="FAIL RATE"
        value={`${kpis.failPercentage}%`}
        icon="cancel"
        size="md"
        variant="danger"
        isCount={true}
      />
    </div>
  );
}
