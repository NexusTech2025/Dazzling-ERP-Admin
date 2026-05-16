import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCourseDetailQuery } from './hooks/useCourseQueries';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import { queryKeys } from '../../lib/react-query/queryKeys';

/**
 * Course Details & Analytics Page
 * Provides deep insights into course performance, financials, and enrollment.
 */
const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: course, isLoading, error } = useCourseDetailQuery(id);

  if (isLoading) return <LoadingState message="Analyzing course data..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.detail(id) })} />;
  if (!course) return <ErrorState title="Course Not Found" message="The requested course could not be located." onRetry={() => navigate('/admin/courses')} />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'students', label: 'Enrolled Students', icon: 'group' },
    { id: 'finance', label: 'Revenue Summary', icon: 'analytics' },
    { id: 'structure', label: 'Fee Structure', icon: 'receipt_long' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center text-sm font-medium text-text-secondary mb-1">
            <Link to="/admin/dashboard" className="hover:text-primary">Home</Link>
            <span className="mx-2 text-xs text-border-light dark:text-border-dark">/</span>
            <Link to="/admin/courses" className="hover:text-primary">Courses</Link>
            <span className="mx-2 text-xs text-border-light dark:text-border-dark">/</span>
            <span className="text-text-main dark:text-white">Details</span>
          </nav>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">{course.name}</h1>
          <p className="text-text-secondary text-sm">
            ID: {course.course_id} • Status: {course.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/admin/courses/edit/${course.course_id}`)} className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-main dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Course
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Student
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-light dark:border-border-dark">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white hover:border-gray-300'}
              `}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">Base Fee</span>
                </div>
                <p className="text-2xl font-black text-text-main dark:text-white">${Number(course.base_fee).toLocaleString()}</p>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">Enrollment</span>
                </div>
                <p className="text-2xl font-black text-text-main dark:text-white">42 Students</p>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined">event_repeat</span>
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">Installments</span>
                </div>
                <p className="text-2xl font-black text-text-main dark:text-white">{course.default_installment_count} Cycles</p>
              </div>
            </div>

            {/* Description / Placeholder for Analytics */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-5xl text-text-secondary/20 mb-4">analytics</span>
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Performance Analytics</h3>
              <p className="text-text-secondary text-sm max-w-sm">Detailed revenue and enrollment charts will be visualized here using historical course data.</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                <h3 className="font-bold text-text-main dark:text-white">Quick Summary</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {course.is_active ? 'HEALTHY' : 'INACTIVE'}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">category</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase">Category</p>
                    <p className="text-xs font-bold text-text-main dark:text-white">{course.segment_name}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary italic">"{course.description || 'No description provided for this course.'}"</p>
                <div className="pt-4 border-t border-dashed border-border-light dark:border-border-dark">
                  <div className="flex justify-between items-center text-xs text-text-secondary mb-1 uppercase font-bold tracking-wider">
                    <span>Revenue Target</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="bg-surface-light dark:bg-surface-dark p-20 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center">
          <p className="text-text-secondary font-medium">Content for "{tabs.find(t => t.id === activeTab).label}" is under development.</p>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
