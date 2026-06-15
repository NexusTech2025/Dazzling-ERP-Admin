import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCourseTypesQuery, 
  useCreateCourseTypeMutation,
  useUpdateCourseTypeMutation,
  useDeleteCourseTypeMutation 
} from './hooks/useCourseQueries';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
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
import { LowDensityCard } from '../../components/ui/v2/cards';
import ConfirmModal from '../../components/ui/ConfirmModal';
import MainLayout from '../../components/layout/MainLayout';

/**
 * CourseTypes Categories Management Page
 * Allows administrators to manage course segments (CourseType table).
 */
const CourseTypes = () => {
  const queryClient = useQueryClient();
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) return shouldBeSticky;
      return prev;
    });
  };
  const { data: courseTypes = [], isLoading: isLoadingTypes, error: typesError } = useCourseTypesQuery();
  
  const createTypeMutation = useCreateCourseTypeMutation();
  const updateTypeMutation = useUpdateCourseTypeMutation();
  const deleteTypeMutation = useDeleteCourseTypeMutation();

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = useSelection();

  const deleteManyMutation = useDeleteManyMutation(
    'CourseType',
    [queryKeys.course.type.all]
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', type: 'single', status: 'idle', resultMessage: null });

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
    setDeleteModal({ isOpen: true, id, name, type: 'single', status: 'idle', resultMessage: null });
  };

  const handleBulkDelete = (ids) => {
    deleteManyMutation.mutate({ ids }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const deleted = manifest.deleted || [];
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;
          let msg = `Successfully deleted ${deleted.length} categories.`;
          if (failedCount > 0) {
            msg += ` ${failedCount} could not be deleted due to existing courses.`;
          }
          if (editingType && deleted.includes(editingType.segment_id)) {
            resetForm();
          }
          setDeleteModal(prev => ({ ...prev, status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success', resultMessage: msg }));
          if (deleted.length > 0) clearSelection();
        } else {
          setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: res.message || 'Failed to delete categories.' }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: err.message || 'A server error occurred.' }));
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    if (deleteModal.type === 'bulk') {
      handleBulkDelete(deleteModal.id);
    } else {
      deleteTypeMutation.mutate({ id: deleteModal.id }, {
        onSuccess: (res) => {
          if (res.success) {
            if (editingType?.segment_id === deleteModal.id) resetForm();
            setDeleteModal({ isOpen: false, id: null, name: '', type: 'single', status: 'idle', resultMessage: null });
          } else {
            setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: res.error?.message || res.message || 'Failed to delete category.' }));
          }
        },
        onError: (err) => {
          setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: err.message || 'A server error occurred.' }));
        }
      });
    }
  };

  const allTypeIds = useMemo(() => courseTypes.map(t => t.segment_id), [courseTypes]);

  const columns = useMemo(() => [
    {
      header: (
        <input
          type="checkbox"
          className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
          checked={isAllSelected(allTypeIds)}
          ref={input => { if (input) input.indeterminate = isSomeSelected(allTypeIds); }}
          onChange={() => toggleSelectAll(allTypeIds)}
        />
      ),
      accessor: 'checkbox',
      className: 'w-10',
      cell: (row) => (
        <input
          type="checkbox"
          className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
          checked={selectedIds.includes(row.segment_id)}
          onChange={() => toggleSelect(row.segment_id)}
        />
      )
    },
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
  ], [allTypeIds, selectedIds, toggleSelect, toggleSelectAll, isAllSelected, isSomeSelected]);

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
  if (typesError) return <ErrorState message={typesError.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all })} />;  return (
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
              <span className="material-symbols-outlined text-primary text-lg">category</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                Course Categories
              </span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="px-2 sm:px-4 lg:px-0 pt-6 lg:pt-10 pb-6 space-y-6">
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
            <div className={`${showCreateForm ? 'lg:col-span-7' : 'lg:col-span-12'} bg-transparent sm:bg-surface-light dark:sm:bg-surface-dark border-0 sm:border border-border-light dark:border-border-dark rounded-2xl p-0 sm:p-6 shadow-none sm:shadow-sm transition-all duration-300`}>
              <div className="hidden sm:flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">category</span>
                </div>
                <h3 className="font-bold text-lg text-text-main dark:text-white">Active Categories</h3>
              </div>
              {/* Mobile Card list */}
              <div className="flex flex-col gap-4 md:hidden">
                {courseTypes.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark w-full">
                    <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2">search_off</span>
                    <p className="text-sm font-bold text-text-main dark:text-white">No categories found</p>
                  </div>
                ) : (
                  courseTypes.map((row) => {
                    const isSelected = selectedIds.includes(row.segment_id);
                    const isSelectionMode = selectedIds.length > 0;

                    const checkboxElement = (
                      <input
                        type="checkbox"
                        className="size-5 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                        checked={isSelected}
                        onChange={() => toggleSelect(row.segment_id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    );

                    const normalIconName = row.entity_label === 'Subject' ? 'menu_book' : row.entity_label === 'Course' ? 'computer' : 'school';

                    const cardIcon = isSelectionMode ? checkboxElement : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(row.segment_id);
                        }}
                        className="cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center w-full h-full"
                        title="Click to select"
                      >
                        <span className="material-symbols-outlined text-sm">{normalIconName}</span>
                      </div>
                    );

                    const bodyText = (
                      <div className="flex flex-col gap-1 items-start md:items-end text-left md:text-right w-full min-w-0">
                        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
                          {row.status}
                        </Badge>
                      </div>
                    );
                    const actions = [
                      { label: 'Edit', icon: 'edit', priority: 'primary', onClick: (e) => { e.stopPropagation(); handleEditClick(row); } },
                      { label: 'Delete', icon: 'delete', priority: 'secondary', onClick: (e) => { e.stopPropagation(); handleDeleteClick(row.segment_id, row.segment_name); } }
                    ];

                    return (
                      <div key={row.segment_id} className="w-full">
                        <LowDensityCard
                          icon={cardIcon}
                          title={row.segment_name}
                          subtitle1={row.segment_id}
                          subtitle2={`Label: ${row.entity_label}`}
                          bodyText={bodyText}
                          actions={actions}
                          onClick={() => handleEditClick(row)}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <DataTable
                  data={courseTypes}
                  columns={columns}
                  isLoading={false}
                />
              </div>
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
            onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', type: 'single', status: 'idle', resultMessage: null })}
            onConfirm={handleConfirmDelete}
            title={deleteModal.type === 'bulk' ? `Delete ${deleteModal.id?.length || 0} Categories` : 'Delete Category'}
            message={
              deleteModal.type === 'bulk'
                ? `Are you sure you want to delete ${deleteModal.id?.length || 0} selected categories? Categories with existing courses cannot be removed.`
                : `Are you sure you want to delete the category "${deleteModal.name}"? This action cannot be undone.`
            }
            status={deleteModal.status}
            resultMessage={deleteModal.resultMessage}
            isProcessing={deleteModal.status === 'processing'}
          />

          <SelectionActionBar
            selectedCount={selectedIds.length}
            itemName="category"
            onClear={clearSelection}
            onDeleteSelected={() => setDeleteModal({
              isOpen: true,
              id: selectedIds,
              name: `${selectedIds.length} selected categories`,
              type: 'bulk',
              status: 'idle',
              resultMessage: null
            })}
          />
        </div>
      }
    />
  );
};

export default CourseTypes;
