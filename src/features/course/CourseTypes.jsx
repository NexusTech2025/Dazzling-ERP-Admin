import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCourseTypesQuery, 
  useCreateCourseTypeMutation,
  useUpdateCourseTypeMutation,
  useDeleteCourseTypeMutation 
} from './hooks/useCourseQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import FormSection from '../../components/ui/v2/FormSection';
import FormField from '../../components/ui/v2/FormField';
import TextInput from '../../components/ui/v2/TextInput';
import SelectInput from '../../components/ui/v2/SelectInput';
import Button from '../../components/ui/v2/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ui/ConfirmModal';

/**
 * CourseTypes Categories Management Page
 * Allows administrators to manage course segments (CourseType table).
 */
const CourseTypes = () => {
  const queryClient = useQueryClient();
  const { data: courseTypes = [], isLoading: isLoadingTypes, error: typesError } = useCourseTypesQuery();
  
  const createTypeMutation = useCreateCourseTypeMutation();
  const updateTypeMutation = useUpdateCourseTypeMutation();
  const deleteTypeMutation = useDeleteCourseTypeMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const generateSegmentId = () => "SEG-" + Date.now().toString().slice(-6);

  const [formData, setFormData] = useState({
    segment_id: generateSegmentId(),
    segment_name: '',
    entity_label: 'Course',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      segment_id: generateSegmentId(),
      segment_name: '',
      entity_label: 'Course',
      description: ''
    });
    setEditingType(null);
    setValidationError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!formData.segment_name.trim()) {
      setValidationError('Category Name is required.');
      return;
    }

    if (editingType) {
      updateTypeMutation.mutate({
        id: editingType.segment_id,
        data: {
          segment_name: formData.segment_name,
          entity_label: formData.entity_label,
          description: formData.description
        }
      }, {
        onSuccess: (res) => {
          if (res.success) {
            setSuccessMessage('Category updated successfully!');
            resetForm();
            queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all });
            setTimeout(() => setSuccessMessage(null), 3000);
          } else {
            setValidationError(res.error?.message || res.message || 'Failed to update category.');
          }
        },
        onError: (err) => {
          setValidationError(err.message || 'An unexpected error occurred.');
        }
      });
    } else {
      createTypeMutation.mutate({ data: formData }, {
        onSuccess: (res) => {
          if (res.success) {
            setSuccessMessage('Category created successfully!');
            resetForm();
            queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all });
            setTimeout(() => setSuccessMessage(null), 3000);
          } else {
            setValidationError(res.error?.message || res.message || 'Failed to create category.');
          }
        },
        onError: (err) => {
          setValidationError(err.message || 'An unexpected error occurred.');
        }
      });
    }
  };

  const handleEditClick = (row) => {
    setEditingType(row);
    setFormData({
      segment_id: row.segment_id,
      segment_name: row.segment_name,
      entity_label: row.entity_label || 'Course',
      description: row.description || ''
    });
    setShowCreateForm(true);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const columns = [
    {
      header: 'Category Name',
      accessor: 'segment_name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black">
            <span className="material-symbols-outlined text-sm">
              {row.entity_label === 'Subject' ? 'menu_book' : row.entity_label === 'Course' ? 'computer' : 'school'}
            </span>
          </div>
          <div>
            <p className="font-bold text-text-main dark:text-white leading-none">{row.segment_name}</p>
            <p className="text-[10px] text-text-secondary mt-1 font-mono">{row.segment_id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Default Label',
      accessor: 'entity_label',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary uppercase tracking-wider">
          {row.entity_label}
        </span>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row) => (
        <p className="text-xs text-text-secondary line-clamp-2 max-w-[200px]" title={row.description}>
          {row.description || '—'}
        </p>
      )
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
          <button
            onClick={() => handleEditClick(row)}
            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
            title="Edit Category"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={() => handleDeleteClick(row.segment_id, row.segment_name)}
            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
            title="Delete Category"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  const entityLabelOptions = [
    { label: 'Course', value: 'Course' },
    { label: 'Subject', value: 'Subject' },
    { label: 'Program', value: 'Program' }
  ];

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Courses', path: '/admin/courses' },
    { label: 'Categories' }
  ];

  if (isLoadingTypes) return <LoadingState message="Loading categories list..." />;
  if (typesError) return <ErrorState message={typesError.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all })} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Breadcrumbs */}
      <Breadcrumbs items={crumbs} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">
            Course Categories
          </h1>
          <p className="text-text-secondary text-base">
            Define and manage segments, labels, and metadata structures for curriculum cataloging.
          </p>
        </div>
        
        <button
          onClick={() => {
            if (showCreateForm) {
              resetForm();
            }
            setShowCreateForm(prev => !prev);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-6 py-2.5 text-sm font-black text-text-main dark:text-white shadow-sm hover:bg-background-light dark:hover:bg-background-dark transition-all active:scale-95 whitespace-nowrap self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-lg">
            {showCreateForm ? 'visibility_off' : 'add_box'}
          </span>
          {showCreateForm ? 'Hide Form' : 'Add Category'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Existing Categories Table */}
        <div className={`${showCreateForm ? 'lg:col-span-7' : 'lg:col-span-12'} bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">category</span>
            </div>
            <h3 className="font-bold text-lg text-text-main dark:text-white">Active Categories</h3>
          </div>
          <DataTable
            data={courseTypes}
            columns={columns}
            isLoading={false}
          />
        </div>

        {/* Right Side: Create/Edit Category Card */}
        {showCreateForm && (
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <form onSubmit={handleSubmit}>
              <FormSection 
                title={editingType ? "Edit Category" : "Create Category"} 
                icon={editingType ? "edit_square" : "add_box"} 
                className="p-0"
              >
                <div className="col-span-1 md:col-span-2 space-y-4">
                  {validationError && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 p-4 rounded-lg border border-rose-100 dark:border-rose-800 flex items-center gap-3 animate-in slide-in-from-top-2">
                      <span className="material-symbols-outlined">error</span>
                      <span className="text-sm font-bold">{validationError}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-3 animate-in slide-in-from-top-2">
                      <span className="material-symbols-outlined">check_circle</span>
                      <span className="text-sm font-bold">{successMessage}</span>
                    </div>
                  )}

                  <FormField label="Category Name" name="segment_name" required>
                    <TextInput
                      required
                      name="segment_name"
                      value={formData.segment_name}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science, Academic Subjects"
                    />
                  </FormField>

                  <FormField label="Default Display Label" name="entity_label" required>
                    <SelectInput
                      value={formData.entity_label}
                      onChange={(val) => setFormData(prev => ({ ...prev, entity_label: val }))}
                      options={entityLabelOptions}
                    />
                  </FormField>

                  <FormField label="Description" name="description">
                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief details about the target courses in this category..."
                      className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 resize-none text-text-main dark:text-white placeholder:text-text-secondary/50"
                    />
                  </FormField>

                  <div className="pt-2 flex items-center gap-3">
                    {editingType && (
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={resetForm}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      loading={editingType ? updateTypeMutation.isPending : createTypeMutation.isPending}
                      className={editingType ? "flex-1" : "w-full"}
                      startIcon={editingType ? "save" : "add"}
                    >
                      {editingType ? 'Save Changes' : 'Create Category'}
                    </Button>
                  </div>
                </div>
              </FormSection>
            </form>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={() => deleteTypeMutation.mutate({ id: deleteModal.id }, {
          onSuccess: (res) => {
            if (res.success) {
              if (editingType?.segment_id === deleteModal.id) {
                resetForm();
              }
              setDeleteModal({ isOpen: false, id: null, name: '' });
            } else {
              setDeleteModal({ isOpen: false, id: null, name: '' });
            }
          },
          onError: () => {
            setDeleteModal({ isOpen: false, id: null, name: '' });
          }
        })}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteModal.name}"? This action cannot be undone.`}
        isProcessing={deleteTypeMutation.isPending}
      />
    </div>
  );
};

export default CourseTypes;
