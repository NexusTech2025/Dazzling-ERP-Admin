import React, { useState } from 'react';
import StudentRegistrationWizard from '../../features/student/registration/StudentRegistrationWizard';
import QuickAddStudent from '../../features/student/registration/QuickAddStudent';
import SegmentedControl from '../../components/ui/v2/SegmentedControl';
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

/**
 * AddStudent Page: Houses the Student Quick Add Lead Form and the Full Student Wizard.
 * Aligns with repositories' MainLayout protocols for proper scroll locking and constraints.
 */
const AddStudent = () => {
  const [mode, setMode] = useState('quick-add'); // Quick Add Mode is pre-selected by default
  const [upgradeData, setUpgradeData] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  const handleUpgrade = (data) => {
    setUpgradeData(data);
    setMode('wizard');
  };

  const handleBodyScroll = (e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Add Student' }
  ];

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky
              ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg font-black">person_add</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                Add New Student
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">
                {mode === 'quick-add' ? 'Quick Lead Mode' : 'Wizard Mode'}
              </span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-6 space-y-6">
          <Breadcrumbs items={crumbs} className="mb-2" />

          {/* Premium Sliding Toggle Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-primary/5 shadow-sm">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl font-black">person_add</span>
                Add New Student
              </h1>
              <p className="text-xs text-text-secondary mt-1">Select standard 4-step registration or quick lead-capture mode.</p>
            </div>
            
            <SegmentedControl
              value={mode}
              onChange={(val) => {
                setMode(val);
                if (val === 'quick-add') {
                  setUpgradeData(null); // Clear upgrade state if toggling back
                }
              }}
              options={[
                { label: 'Quick Student Lead', value: 'quick-add', icon: 'bolt' },
                { label: 'Full Registration Wizard', value: 'wizard', icon: 'account_tree' }
              ]}
              className="border border-slate-200/50 dark:border-slate-700/50"
            />
          </div>

          {/* Dynamic Mode Switcher */}
          <div className="transition-all duration-300 pb-6">
            {mode === 'quick-add' ? (
              <QuickAddStudent onUpgrade={handleUpgrade} />
            ) : (
              <StudentRegistrationWizard initialData={upgradeData} />
            )}
          </div>
        </div>
      }
    />
  );
};

export default AddStudent;
