import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import useSelectableTable from '../../../hooks/useSelectableTable';
import CourseCardV2 from './CourseCardV2';

/**
 * CourseListView Component
 * Renders the DataTable list representation of courses.
 */
const CourseListView = ({ courses = [], onDelete, selection }) => {
  const navigate = useNavigate();
  const courseColumns = useMemo(() => [
    {
      header: 'Course Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            {row.name ? row.name.substring(0, 2).toUpperCase() : '??'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-text-main dark:text-white leading-none">{row.name}</p>
              {row.metadata?.class && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                  Class {row.metadata.class}
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-secondary mt-1 font-mono">{row.language_medium} • {row.metadata?.board || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'ID',
      accessor: 'course_id',
      className: 'font-mono text-xs'
    },
    {
      header: 'Fee',
      accessor: 'base_fee',
      className: 'text-right font-black',
      cell: (row) => `₹${row.base_fee?.toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/admin/courses/edit/${row.course_id}`}
            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
            title="Edit Course"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </Link>
          <button
            onClick={() => onDelete(row.course_id, row.name)}
            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
            title="Delete Course"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ], [onDelete]);

  const columns = useSelectableTable({
    columns: courseColumns,
    data: courses,
    idKey: 'course_id',
    selectedIds: selection?.selectedIds || [],
    toggleSelect: selection?.toggleSelect,
    toggleSelectAll: selection?.toggleSelectAll,
    isAllSelected: selection?.isAllSelected,
    isSomeSelected: selection?.isSomeSelected
  });

  // Only use decorated columns if selection is supplied (e.g. not null/undefined)
  const finalColumns = selection ? columns : courseColumns;

  return (
    <>
      {/* Mobile Card-based List view */}
      <div className="flex flex-col gap-4 md:hidden">
        {courses.map((course) => {
          const isSelected = selection?.selectedIds.includes(course.course_id);
          const isSelectionMode = selection && selection.selectedIds.length > 0;

          const checkboxElement = selection ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => selection.toggleSelect(course.course_id)}
              onClick={(e) => e.stopPropagation()}
              className="size-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary/20 cursor-pointer"
            />
          ) : null;

          const segmentIcons = { 'SEG-CMP': 'computer', 'SEG-FND': 'star' };
          const normalIcon = segmentIcons[course.segment_id] || 'auto_stories';

          const cardIcon = isSelectionMode ? checkboxElement : (
            <div
              onClick={(e) => {
                if (selection) {
                  e.stopPropagation();
                  selection.toggleSelect(course.course_id);
                }
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center w-full h-full"
              title="Click to select"
            >
              <span className="material-symbols-outlined text-lg">{normalIcon}</span>
            </div>
          );

          return (
            <div key={course.course_id} className="w-full">
              <CourseCardV2
                course={course}
                density="low"
                icon={cardIcon}
                onClick={() => navigate(`/admin/courses/${course.course_id}`)}
                onEdit={() => navigate(`/admin/courses/edit/${course.course_id}`)}
                onDelete={onDelete ? () => onDelete(course.course_id, course.name) : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* Desktop Tabular List view */}
      <div className="hidden md:block">
        <DataTable
          data={courses}
          columns={finalColumns}
          isLoading={false}
        />
      </div>
    </>
  );
};

export default CourseListView;
