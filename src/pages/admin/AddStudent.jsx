import React, { useState } from 'react';
import StudentRegistrationWizard from '../../features/student/registration/StudentRegistrationWizard';
import QuickAddStudent from '../../features/student/registration/QuickAddStudent';
import SegmentedControl from '../../components/ui/v2/SegmentedControl';

/**
 * AddStudent Page: Houses the Student Quick Add Lead Form and the Full Student Wizard.
 * Pre-selects Quick Add by default. Feeds standard mode controls down to the child
 * pages so each tab view manages its own MainLayout shell (enabling sticky footers and steppers).
 */
const AddStudent = () => {
  const [mode, setMode] = useState('quick-add'); // Quick Add Mode is pre-selected by default
  const [upgradeData, setUpgradeData] = useState(null);

  const handleUpgrade = (data) => {
    setUpgradeData(data);
    setMode('wizard');
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Add Student' }
  ];

  const modeToggle = (
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
  );

  return mode === 'quick-add' ? (
    <QuickAddStudent 
      onUpgrade={handleUpgrade} 
      modeToggle={modeToggle} 
      crumbs={crumbs} 
    />
  ) : (
    <StudentRegistrationWizard 
      initialData={upgradeData} 
      modeToggle={modeToggle} 
      crumbs={crumbs} 
    />
  );
};

export default AddStudent;
