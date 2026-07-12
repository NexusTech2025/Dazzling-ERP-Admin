import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Card from '../../components/ui/Card';
import { DateDisplay } from '../../components/ui/presets/DateDisplay';
import { TimeRange } from '../../components/ui/presets/TimeRange';
import { DateRange } from '../../components/ui/presets/DateRange';

const TestDateShowcase = () => {
  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Showcase', path: '/admin/test-pages/filters' },
    { label: 'Date Subsystem Showcase' }
  ];

  // Mock data matrices directly replicating production database fields
  const mockInstallments = [
    { id: 'INST-01', label: 'Admission Deposit', due: '2026-01-01', amount: '₹15,000' }, // Overdue (red/danger)
    { id: 'INST-02', label: 'Mid-term Cycle', due: new Date().toISOString(), amount: '₹10,000' }, // Today (amber/warning)
    { id: 'INST-03', label: 'Final Evaluation', due: '2226-12-25', amount: '₹10,000' }  // Future (green/success)
  ];

  return (
    <MainLayout
      body={
        <div className="space-y-8 p-6 max-w-4xl mx-auto pb-16">
          <Breadcrumbs items={crumbs} className="mb-4" />

          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">
              Date display Subsystem Showcase
            </h1>
            <p className="text-sm text-text-secondary">
              Presentation testing ground for `DateDisplay` component variations, intents, and computed deadline contexts.
            </p>
          </div>

          {/* 1. Table Column Cell Context */}
          <Card className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
              1. Automated Financial Ledger Audits (variant="badge" + autoContext)
            </h4>
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-text-secondary border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                    <th className="p-4">Reference</th>
                    <th className="p-4">Deadline Coordinate</th>
                    <th className="p-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockInstallments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-semibold text-text-main dark:text-white">{inst.label}</td>
                      <td className="p-4">
                        {/* The autoContext property calculates overdue/today/future intents behind the scenes */}
                        <DateDisplay value={inst.due} variant="badge" autoContext />
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-350">{inst.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 2. Grid for Stacks and Compact Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
                2. Calendar Card Blocks (variant="stack")
              </h4>
              <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <DateDisplay value="2026-06-22T18:30:00.000Z" variant="stack" intent="primary" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-bold text-text-main dark:text-white truncate">Advanced AI Engineering Workshop</p>
                  <span className="text-[10px] font-medium text-text-secondary mt-1">Room 404 • Cohort Beta Matrix</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
                3. Compact Mobile Data Streams (variant="micro")
              </h4>
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary font-medium">Teacher Joined Target:</span>
                  <DateDisplay value="2021-08-12" variant="micro" intent="muted" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary font-medium">Critical Account Locked Point:</span>
                  <DateDisplay value="2026-07-12" variant="micro" intent="danger" />
                </div>
              </div>
            </Card>
          </div>

          {/* 3. Failure Boundary */}
          <Card className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-3">
              4. Fault Tolerance & Exception Mapping Handling
            </h4>
            <div className="text-sm bg-rose-50/30 dark:bg-rose-950/10 p-4 rounded-xl flex items-center justify-between border border-rose-100/40 dark:border-rose-900/20">
              <span className="text-text-secondary dark:text-slate-400 text-xs">Corrupted Server Payload Output Check:</span>
              <DateDisplay value="corrupt_string_token" fallback="N/A (Missing Register Timestamp)" />
            </div>
          </Card>

          {/* 4. Text Custom Sizing and Weights */}
          <Card className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
              5. Custom Text Sizing and Weights (Tailwind Class Overrides)
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary w-48">Default (text-sm font-medium):</span>
                <DateDisplay value="2026-07-12" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary w-48">Extra Small & Normal:</span>
                <DateDisplay value="2026-07-12" className="text-xs font-normal" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary w-48">Large & Semi-bold:</span>
                <DateDisplay value="2026-07-12" className="text-lg font-semibold" intent="primary" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary w-48">Extra Large & Bold:</span>
                <DateDisplay value="2026-07-12" className="text-xl font-bold" intent="danger" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary w-48">Extra Extra Large & Black:</span>
                <DateDisplay value="2026-07-12" className="text-2xl font-black" intent="success" />
              </div>
            </div>
          </Card>

          {/* 5. Range Presets Showcase */}
          <Card className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
              6. Time and Date Range Components (TimeRange & DateRange)
            </h4>
            <div className="space-y-6">
              <div>
                <h5 className="text-xs font-semibold text-text-secondary mb-2">TimeRange:</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Standard (no badge):</span>
                    <TimeRange start="09:00" end="18:00" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">With Badge:</span>
                    <TimeRange start="09:00" end="18:00" useBadge />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Warning Badge variant:</span>
                    <TimeRange start="09:00" end="18:00" useBadge badgeVariant="warning" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Vertical Stack (no badge):</span>
                    <TimeRange start="09:00" end="18:00" layout="vertical" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Vertical Stack inside Badge:</span>
                    <TimeRange start="09:00" end="18:00" useBadge layout="vertical" />
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-text-secondary mb-2">DateRange:</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Standard (no badge):</span>
                    <DateRange start="2026-07-01" end="2026-07-15" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">With Badge:</span>
                    <DateRange start="2026-07-01" end="2026-07-15" useBadge />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Primary Badge variant:</span>
                    <DateRange start="2026-07-01" end="2026-07-15" useBadge badgeVariant="primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Vertical Stack (no badge):</span>
                    <DateRange start="2026-07-01" end="2026-07-15" layout="vertical" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary">Vertical Stack inside Badge:</span>
                    <DateRange start="2026-07-01" end="2026-07-15" useBadge layout="vertical" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      }
    />
  );
};

export default TestDateShowcase;
