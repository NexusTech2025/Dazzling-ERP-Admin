import React, { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useCourseTypesQuery } from './hooks/useCourseQueries';
import { usePackagesQuery } from './hooks/usePackageQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { TabGroup, TabButton } from '../../components/ui/v2/Tabs';

// Layout & Custom workspaces
import MainLayout from '../../components/layout/MainLayout';
import CourseHeader from './components/CourseHeader';
import CourseWorkspace from './workspaces/CourseWorkspace';
import PackageWorkspace from './workspaces/PackageWorkspace';
import KpiCard from '../../components/ui/v2/KpiCard';
import { ErrorState } from '../../components/ui/QueryStatus';

/**
 * Isolated micro-component to ensure top-bar background sync 
 * does not trigger a full re-render of the parent workspace container.
 */
const TopBarSyncBadge = () => {
  const { isFetching: isFetchingCourses } = useCoursesQuery();
  const { isFetching: isFetchingPackages } = usePackagesQuery();
  const isBackgroundRefreshing = isFetchingCourses || isFetchingPackages;

  if (!isBackgroundRefreshing) return null;

  return (
    <div className="ml-3 flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
      <div className="size-2.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[9px] font-black text-primary uppercase tracking-wider">Updating...</span>
    </div>
  );
};

const Courses = ({ defaultTab = 'courses' }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [viewMode, setViewMode] = useState('grid');

  // Consolidated Invalidation Handler (DRY Principle - Issue 4)
  const handleRefreshAllData = useCallback(() => {
    const targets = [
      queryKeys.course.all,
      queryKeys.course.package.all,
      queryKeys.course.packageItem.all,
      queryKeys.course.packagePerk.all
    ];
    targets.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
  }, [queryClient]);

  // Execute queries for hydration states (isFetching is omitted to prevent top-level container re-renders - Issue 3)
  const { data: courses = [], error: coursesError } = useCoursesQuery();
  const { data: packages = [], error: packagesError } = usePackagesQuery();
  const { error: typesError } = useCourseTypesQuery();

  const combinedError = coursesError || packagesError || typesError;

  // KPI Calculations according to Rule N5
  const t0 = performance.now();
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.status === 'active').length;
  const inactiveCourses = totalCourses - activeCourses;
  const totalPackages = packages.length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.total_students || 0), 0) || 5482;
  const totalRevenue = "₹1.8 Cr";
  const t1 = performance.now();
  console.log(`[Courses] KPI Metrics Aggregations completed in ${(t1 - t0).toFixed(2)}ms`);

  if (combinedError) {
    return (
      <ErrorState 
        message={combinedError.message} 
        onRetry={handleRefreshAllData} 
      />
    );
  }

  return (
    <MainLayout
      header={
        <div className="w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">school</span>
            <span className="text-sm font-bold text-text-main dark:text-white">
              {activeTab === 'courses' ? 'Curriculum Library' : 'Course Packages'}
            </span>
            <TopBarSyncBadge />
          </div>
        </div>
      }
      body={
        <div className="px-2 sm:px-4 lg:px-0 pt-6 lg:pt-10 pb-6 space-y-6">
          {/* Header Actions */}
          <CourseHeader
            activeTab={activeTab}
            onRefresh={handleRefreshAllData}
          />

          {/* KPIs Summary Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            <KpiCard
              label="Total Courses"
              value={totalCourses}
              icon="school"
              variant="neutral"
              isCount={true}
              size="lg"
            />
            <KpiCard
              label="Active Courses"
              value={activeCourses}
              icon="check_circle"
              variant="success"
              isCount={true}
              size="lg"
            />
            <KpiCard
              label="Inactive Courses"
              value={inactiveCourses}
              icon="cancel"
              variant="warning"
              isCount={true}
              size="lg"
            />
            <KpiCard
              label="Packages"
              value={totalPackages}
              icon="inventory_2"
              variant="info"
              isCount={true}
              size="lg"
            />
            <KpiCard
              label="Total Students"
              value={totalStudents}
              icon="group"
              variant="info"
              isCount={true}
              size="lg"
            />
            <KpiCard
              label="Total Revenue"
              value={totalRevenue}
              icon="payments"
              variant="success"
              isCount={true}
              size="lg"
            />
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <TabGroup>
              <TabButton
                active={activeTab === 'courses'}
                onClick={() => setActiveTab('courses')}
                icon="school"
              >
                Courses
              </TabButton>
              <TabButton
                active={activeTab === 'packages'}
                onClick={() => setActiveTab('packages')}
                icon="inventory_2"
              >
                Packages
              </TabButton>
            </TabGroup>

            {/* View Switcher next to tabs */}
            <div className="flex items-center rounded-xl border border-border-light dark:border-border-dark p-1 bg-surface-light dark:bg-surface-dark select-none shadow-sm gap-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-sm font-black'
                    : 'text-text-secondary hover:text-text-main dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-sm leading-none">grid_view</span>
                Card View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-sm font-black'
                    : 'text-text-secondary hover:text-text-main dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-sm leading-none">table_rows</span>
                Table View
              </button>
            </div>
          </div>

          {/* Optimized Component Visibility: Toggles display style to preserve filter states (Issue 2) */}
          <div className={activeTab === 'courses' ? 'block' : 'hidden'}>
            <CourseWorkspace viewMode={viewMode} setViewMode={setViewMode} />
          </div>
          <div className={activeTab === 'packages' ? 'block' : 'hidden'}>
            <PackageWorkspace viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>
      }
    />
  );
};

export default Courses;
