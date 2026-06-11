import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateCourseTypeModal from './CreateCourseTypeModal';
import RefreshButton from '../../../components/ui/btn/RefreshButton';

const CourseHeader = ({ activeTab, isFetching = false, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black text-text-main dark:text-white tracking-tight leading-tight">
          {activeTab === 'courses' ? 'Curriculum Library' : 'Course Packages'}
        </h3>
        <p className="text-sm text-text-secondary font-medium italic">
          {activeTab === 'courses'
            ? 'Manage individual subjects and academic offerings'
            : 'Explore bundled courses and special enrollment offers'}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <RefreshButton isFetching={isFetching} onRefresh={onRefresh} />
        {activeTab === 'courses' ? (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-6 py-2.5 text-sm font-black text-text-main dark:text-white shadow-sm hover:bg-background-light dark:hover:bg-background-dark transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">category</span>
              Create Type
            </button>
            <Link
              to="/admin/courses/add"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Create New Course
            </Link>
          </>
        ) : (
          <div className="flex gap-2 w-full md:w-auto">
            <Link
              to="/admin/packages/quick-add"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-6 py-2.5 text-sm font-black text-text-main dark:text-white shadow-sm hover:bg-background-light dark:hover:bg-background-dark transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">bolt</span>
              Quick Build Package
            </Link>
            <Link
              to="/admin/packages/add"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">inventory_2</span>
              Create Package
            </Link>
          </div>
        )}
      </div>

      <CreateCourseTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(data) => {
          console.log('Course Type Created:', data);
          // Optional: Invalidate queries if needed, but segments are usually fetched as part of course details or a separate schema
        }}
      />
    </div>
  );
};

export default CourseHeader;
