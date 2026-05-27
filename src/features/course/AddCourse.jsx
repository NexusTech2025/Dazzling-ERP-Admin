import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useCreateCourseMutation, 
  useCourseTypesQuery, 
  useCreateCourseTypeMutation, 
  useCourseDetailQuery, 
  useUpdateCourseMutation 
} from './hooks/useCourseQueries';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import CourseForm from './components/CourseForm';

/**
 * Add Course Container Page
 * Handles fetching course details (for edit mode) and categories,
 * and executes create/update mutations upon form submission.
 */
const AddCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const createMutation = useCreateCourseMutation();
  const updateMutation = useUpdateCourseMutation();
  const { data: courseTypes = [], isLoading: isLoadingTypes } = useCourseTypesQuery();
  const { data: existingCourse, isLoading: isLoadingCourse, error: courseDetailsError } = useCourseDetailQuery(id);
  const createTypeMutation = useCreateCourseTypeMutation();
  
  const [error, setError] = useState(null);

  if ((id && isLoadingCourse) || isLoadingTypes) {
    return <LoadingState message="Loading course form..." />;
  }

  if (courseDetailsError) {
    return <ErrorState message={courseDetailsError.message} onRetry={() => window.location.reload()} />;
  }

  const handleSubmit = (alignedPayload) => {
    setError(null);
    const successRedirect = () => navigate('/admin/courses');

    if (id) {
      updateMutation.mutate({ id, data: alignedPayload }, {
        onSuccess: (res) => {
          if (res.success) {
            successRedirect();
          } else {
            setError(res.error?.message || res.message || 'Failed to update item.');
          }
        },
        onError: (err) => {
          setError(err.message || 'An unexpected error occurred.');
        }
      });
    } else {
      createMutation.mutate({ data: alignedPayload }, {
        onSuccess: (res) => {
          if (res.success) {
            successRedirect();
          } else {
            setError(res.error?.message || res.message || 'Failed to create item.');
          }
        },
        onError: (err) => {
          setError(err.message || 'An unexpected error occurred.');
        }
      });
    }
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Courses', path: '/admin/courses' },
    { label: id ? 'Edit Course' : 'Add Course' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Dynamic Breadcrumbs */}
      <Breadcrumbs items={crumbs} />

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">
          {id ? 'Edit Offering' : 'Create New Offering'}
        </h1>
        <p className="text-text-secondary text-base">
          {id 
            ? 'Update course details or academic subject config and save changes.' 
            : 'Define a new academic subject or skill course with specific board, medium, and fee structure.'
          }
        </p>
      </div>

      <CourseForm
        initialData={existingCourse}
        courseTypes={courseTypes}
        isLoadingTypes={isLoadingTypes}
        onSubmit={handleSubmit}
        isSaving={createMutation.isPending || updateMutation.isPending}
        externalError={error}
        createTypeMutation={createTypeMutation}
        onCancel={() => navigate('/admin/courses')}
      />
    </div>
  );
};

export default AddCourse;
