import React from 'react';
import { Link } from 'react-router-dom';

const CourseHeader = ({ activeTab }) => {
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
        {activeTab === 'courses' ? (
          <Link 
            to="/admin/courses/add" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Create New Course
          </Link>
        ) : (
          <Link 
            to="/admin/courses/packages" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">inventory_2</span>
            Create Package
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseHeader;
