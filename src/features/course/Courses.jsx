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
  const { error: coursesError } = useCoursesQuery();
  const { error: packagesError } = usePackagesQuery();
  const { error: typesError } = useCourseTypesQuery();

  const combinedError = coursesError || packagesError || typesError;

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

          {/* Navigation Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-6">
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
            </div>
          </div>

          {/* Optimized Component Visibility: Toggles display style to preserve filter states (Issue 2) */}
          <div className={activeTab === 'courses' ? 'block' : 'hidden'}>
            <CourseWorkspace />
          </div>
          <div className={activeTab === 'packages' ? 'block' : 'hidden'}>
            <PackageWorkspace />
          </div>
        </div>
      }
    />
  );
};

export default Courses;
