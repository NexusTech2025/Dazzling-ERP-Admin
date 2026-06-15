import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCardV2 from './CourseCardV2';

/**
 * CourseGridView Component
 * Renders the grid list representation of courses using the MediumDensityCard via CourseCardV2.
 */
const CourseGridView = ({ courses = [], onDelete }) => {
  const navigate = useNavigate();

  if (courses.length === 0) {
    return <NoDataFound />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {courses.map(course => (
        <div key={course.course_id} className="group relative">
          {/* Mobile View: Low Density */}
          <div className="md:hidden">
            <CourseCardV2
              course={course}
              density="low"
              onClick={() => navigate(`/admin/courses/${course.course_id}`)}
              onEdit={() => navigate(`/admin/courses/edit/${course.course_id}`)}
              onDelete={onDelete ? () => onDelete(course.course_id, course.name) : undefined}
            />
          </div>

          {/* Desktop View: Medium Density */}
          <div className="hidden md:block">
            <CourseCardV2
              course={course}
              density="medium"
              onClick={() => navigate(`/admin/courses/${course.course_id}`)}
              onEdit={() => navigate(`/admin/courses/edit/${course.course_id}`)}
            />
          </div>

          {/* Delete button (hover reveal, desktop only) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course.course_id, course.name);
              }}
              className="absolute top-3 left-3 p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm hidden md:flex items-center justify-center"
              title="Archive Course"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
        </div>
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
