import React, { useState } from 'react';
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

const Courses = ({ defaultTab = 'courses' }) => {
  const queryClient = useQueryClient();
  const [isSticky, setIsSticky] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) return shouldBeSticky;
      return prev;
    });
  };

  // Queries to trigger Hydration states at page entry level
  const { isFetching: isFetchingCourses, error: coursesError } = useCoursesQuery();
  const { isFetching: isFetchingPackages, error: packagesError } = usePackagesQuery();
  const { error: typesError } = useCourseTypesQuery();

  const hasError = coursesError || packagesError || typesError;
  if (hasError) {
    return (
      <ErrorState 
        message={hasError.message} 
        onRetry={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.course.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
        }} 
      />
    );
  }

  const isBackgroundRefreshing = isFetchingCourses || isFetchingPackages;

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
              <span className="material-symbols-outlined text-primary text-lg">school</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                {activeTab === 'courses' ? 'Curriculum Library' : 'Course Packages'}
              </span>

              {/* Localized top-bar refresh badge */}
              {isBackgroundRefreshing && (
                <div className="ml-3 flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
                  <div className="size-2.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      body={
        <div className="px-2 sm:px-4 lg:px-0 pt-6 lg:pt-10 pb-6 space-y-6">
          {/* Header */}
          <CourseHeader
            activeTab={activeTab}
            isFetching={isBackgroundRefreshing}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: queryKeys.course.all });
              queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
              queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
              queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
            }}
          />

          {/* Navigation Tab selection */}
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

          {/* Render Decoupled Sub-Workspace */}
          {activeTab === 'courses' ? (
            <CourseWorkspace />
          ) : (
            <PackageWorkspace />
          )}
        </div>
      }
    />
  );
};

export default Courses;
