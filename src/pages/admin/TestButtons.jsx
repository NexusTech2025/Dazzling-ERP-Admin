import React, { useState, useEffect } from 'react';
import ActionCardButton from '../../components/ui/buttons/ActionCardButton';
import { useEnrollmentsQuery } from '../../features/student/hooks/useEnrollmentQueries';

const TestButtons = () => {
  const [triggerQuery, setTriggerQuery] = useState(false);
  const { data: enrollments, isLoading, error } = useEnrollmentsQuery({}, { limit: 3, offset: 0, enabled: triggerQuery });

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

  return (
    <div className="space-y-12 py-16 px-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-black text-text-main dark:text-white tracking-tight">Action Card Showcase</h1>
        <p className="text-text-secondary text-lg font-medium">Testing the 5 variants of our reusable ActionCardButton component.</p>
        
        {/* Enrollments Hook Test Trigger */}
        <div className="mt-4 p-4 rounded-2xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-text-main dark:text-white">Query Hook Integration Test</h4>
            <p className="text-xs text-text-secondary mt-0.5">Click the trigger to run useEnrollmentsQuery and inspect logs in console.</p>
          </div>
          <button
            type="button"
            onClick={() => setTriggerQuery(true)}
            disabled={isLoading}
            className="px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Fetching Data...' : 'Trigger Enrollment Query'}
          </button>
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
              onClick={() => {}}
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
              onClick={() => {}}
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
              onClick={() => {}}
            />
            <ActionCardButton 
              variant="ghost"
              layout="row"
              label="Export Configuration"
              description="Download current settings as JSON."
              icon="download"
              onClick={() => {}}
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
            onClick={() => {}}
          />
        </section>

      </div>
    </div>
  );
};

export default TestButtons;
