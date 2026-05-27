import React from 'react';
import CourseCard from './CourseCard';

/**
 * CourseGridView Component
 * Renders the grid list representation of courses.
 */
const CourseGridView = ({ courses = [], onDelete }) => {
  if (courses.length === 0) {
    return <NoDataFound />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {courses.map(course => (
        <CourseCard
          key={course.course_id}
          course={course}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const NoDataFound = () => (
  <div className="col-span-full py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark w-full">
    <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">search_off</span>
    <h3 className="text-lg font-bold text-text-main dark:text-white">No items found</h3>
    <p className="text-sm text-text-secondary">Try adjusting your search or filters.</p>
  </div>
);

export default CourseGridView;
