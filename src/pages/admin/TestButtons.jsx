import React, { useState, useEffect, useMemo } from 'react';
import ActionCardButton from '../../components/ui/buttons/ActionCardButton';
import { useEnrollmentsQuery } from '../../features/student/hooks/useEnrollmentQueries';
import { usePackageStudent } from '../../features/course/hooks/usePackageQueries';
import { EMPTY_FILTER } from '../../lib/react-query/queryKeys';

const TestButtons = () => {
  const [triggerQuery, setTriggerQuery] = useState(false);
  const { data: enrollments, isLoading, error } = useEnrollmentsQuery({}, { limit: 100, offset: 0, enabled: triggerQuery });

  const [packageIdInput, setPackageIdInput] = useState('');
  const [targetPackageId, setTargetPackageId] = useState('');
  const { data: packageStudents, isLoading: isPkgStudentsLoading, error: pkgStudentsError } = usePackageStudent(targetPackageId);

  const [studentIdInput, setStudentIdInput] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');

  const studentFilter = useMemo(() => {
    if (!targetStudentId) return null;
    return { student_id: targetStudentId };
  }, [targetStudentId]);

  const {
    data: studentEnrollments,
    isLoading: isStudentEnrollmentsLoading,
    error: studentEnrollmentsError
  } = useEnrollmentsQuery(
    studentFilter || EMPTY_FILTER,
    { enabled: !!targetStudentId }
  );

  useEffect(() => {
    if (enrollments) {
      console.log('--- useEnrollmentsQuery Test Data ---');
      console.log(enrollments);
      console.log('-------------------------------------');
    }
  }, [enrollments]);

  useEffect(() => {
    if (error) {
      console.error('--- useEnrollmentsQuery Test Error ---');
      console.error(error);
      console.log('--------------------------------------');
    }
  }, [error]);

  useEffect(() => {
    if (packageStudents && targetPackageId) {
      console.log(`--- usePackageStudent Test Data for ${targetPackageId} ---`);
      console.log(packageStudents);
      console.log('----------------------------------------------------');
    }
  }, [packageStudents, targetPackageId]);

  useEffect(() => {
    if (pkgStudentsError) {
      console.error('--- usePackageStudent Test Error ---');
      console.error(pkgStudentsError);
      console.log('------------------------------------');
    }
  }, [pkgStudentsError]);

  useEffect(() => {
    if (studentEnrollments && targetStudentId) {
      console.log(`--- useEnrollmentsQuery Test Data for Student: ${targetStudentId} ---`);
      console.log('Enrollments:', studentEnrollments);
      const feeAccounts = studentEnrollments.flatMap(e => e.studentfeeaccounts || []);
      console.log('Extracted StudentFeeAccounts:', feeAccounts);
      console.log('----------------------------------------------------');
    }
  }, [studentEnrollments, targetStudentId]);

  useEffect(() => {
    if (studentEnrollmentsError) {
      console.error(`--- useEnrollmentsQuery Student Test Error for ${targetStudentId} ---`);
      console.error(studentEnrollmentsError);
      console.log('----------------------------------------------------');
    }
  }, [studentEnrollmentsError, targetStudentId]);

  return (
    <div className="space-y-12 py-16 px-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-black text-text-main dark:text-white tracking-tight">Action Card Showcase</h1>
        <p className="text-text-secondary text-lg font-medium">Testing the 5 variants of our reusable ActionCardButton component.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {/* Enrollments Hook Test Trigger */}
          <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-text-main dark:text-white">Query Hook Integration Test</h4>
              <p className="text-xs text-text-secondary mt-0.5">Click the trigger to run useEnrollmentsQuery and inspect logs in console.</p>
            </div>
            <button
              type="button"
              onClick={() => setTriggerQuery(true)}
              disabled={isLoading}
              className="w-full sm:w-max px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? 'Fetching Data...' : 'Trigger Enrollment Query'}
            </button>
          </div>

          {/* Package Students Hook Test Trigger */}
          <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-text-main dark:text-white">usePackageStudent Hook Integration Test</h4>
              <p className="text-xs text-text-secondary mt-0.5">Enter a Package ID to retrieve all students enrolled in the package or its sub-courses.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="e.g. PKG-8E7F42CE"
                value={packageIdInput}
                onChange={(e) => setPackageIdInput(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setTargetPackageId(packageIdInput.trim())}
                disabled={isPkgStudentsLoading || !packageIdInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPkgStudentsLoading ? 'Fetching...' : 'Get Enrolled Students'}
              </button>
            </div>
          </div>

          {/* Student Enrollments & Fee Accounts Hook Test Trigger */}
          <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-text-main dark:text-white">Student Enrollments & Fee Accounts Test</h4>
              <p className="text-xs text-text-secondary mt-0.5">Enter a Student ID to fetch all enrollments and nested StudentFeeAccounts for the student.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="e.g. STU-001"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setTargetStudentId(studentIdInput.trim())}
                disabled={isStudentEnrollmentsLoading || !studentIdInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isStudentEnrollmentsLoading ? 'Fetching...' : 'Get Student Enrollments'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">

        {/* 1. Primary Empty State */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">1. Dashed Centered (Primary Empty State)</h2>
          <ActionCardButton
            variant="dashed"
            layout="centered"
            label="Add Package Perks"
            description="Boost your bundle value by adding extra benefits like certification, 24/7 support, or source files."
            icon="featured_play_list"
            onClick={() => alert('Empty State Clicked')}
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 2. Grid Addition Standard */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">2. Solid Grid (Grid-based Addition)</h2>
            <ActionCardButton
              variant="solid"
              layout="grid"
              label="New Subject"
              icon="library_add"
              onClick={() => { }}
            />
          </section>

          {/* 3. Tinted Variant */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">3. Tinted Grid (Soft Background)</h2>
            <ActionCardButton
              variant="tinted"
              layout="grid"
              label="Invite Teacher"
              description="Send enrollment link via email"
              icon="person_add"
              onClick={() => { }}
            />
          </section>
        </div>

        {/* 4. Horizontal Row */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">4. Ghost Row (Horizontal / Compact)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCardButton
              variant="ghost"
              layout="row"
              label="Attach Lab Resources"
              description="Upload PDFs or external links for students."
              icon="attachment"
              onClick={() => { }}
            />
            <ActionCardButton
              variant="ghost"
              layout="row"
              label="Export Configuration"
              description="Download current settings as JSON."
              icon="download"
              onClick={() => { }}
            />
          </div>
        </section>

        {/* 5. Professional CTA */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">5. Solid Centered (Prominent Professional Action)</h2>
          <ActionCardButton
            variant="solid"
            layout="centered"
            label="Sync with Academic Calendar"
            description="Automatically adjust batch timings based on school holidays and exam schedules."
            icon="sync"
            onClick={() => { }}
          />
        </section>

      </div>
    </div>
  );
};

export default TestButtons;
