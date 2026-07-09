import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCourseTypesQuery,
  useCreateCourseTypeMutation,
  useUpdateCourseTypeMutation,
  useDeleteCourseTypeMutation
} from './hooks/useCourseQueries';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import useIsMobile from '../../hooks/useIsMobile';

import CourseCategoryFormModal from './components/CourseCategoryFormModal';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { API_REGISTRY } from '../../services/apiRegistry';
import DeleteDependencyModal from '../../components/ui/DeleteDependencyModal';
import Button from '../../components/ui/v2/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { LowDensityCard } from '../../components/ui/v2/cards';
import ConfirmModal from '../../components/ui/ConfirmModal';
import MainLayout from '../../components/layout/MainLayout';
import RefreshButton from '../../components/ui/btn/RefreshButton';

/**
 * CourseTypes Categories Management Page
 * Allows administrators to manage course segments (CourseType table).
 */
const CourseTypes = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile(768); // Programmatic JS Breakpoint tracking
  const [isSticky, setIsSticky] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', type: 'single', status: 'idle', resultMessage: null });
  const [dependencyModal, setDependencyModal] = useState({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
  const [apiFeedback, setApiFeedback] = useState({ error: null, success: null });

  // Data Queries & Mutations
  const { data: courseTypes = [], isLoading: isLoadingTypes, isFetching: isFetchingTypes, error: typesError } = useCourseTypesQuery();
  const createTypeMutation = useCreateCourseTypeMutation();
  const updateTypeMutation = useUpdateCourseTypeMutation();
  const deleteTypeMutation = useDeleteCourseTypeMutation();

  const { selectedIds, toggleSelect, toggleSelectAll, clearSelection, isAllSelected, isSomeSelected } = useSelection();

  const deleteManyMutation = useDeleteManyMutation(
    'CourseType',
    [queryKeys.course.type.all],
    API_REGISTRY.ACADEMIC.DELETE_MANY_COURSE_TYPES
  );

  const handleBodyScroll = useCallback((e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => prev !== shouldBeSticky ? shouldBeSticky : prev);
  }, []);

  const handleFormReset = useCallback(() => {
    setEditingType(null);
    setApiFeedback({ error: null, success: null });
    setShowCreateForm(false);
  }, []);

  const handleFormSubmit = useCallback((data) => {
    setApiFeedback({ error: null, success: null });

    const mutationConfig = {
      onSuccess: (res) => {
        if (res.success) {
          setApiFeedback({ error: null, success: `Category ${editingType ? 'updated' : 'created'} successfully!` });
          setTimeout(() => {
            handleFormReset();
            queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all });
          }, 1500); // 1.5s delay to show the success badge inside the modal
        } else {
          setApiFeedback({ success: null, error: res.error?.message || res.message || 'Failed to process request.' });
        }
      },
      onError: (err) => {
        setApiFeedback({ success: null, error: err.message || 'An unexpected error occurred.' });
      }
    };

    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.segment_id, data }, mutationConfig);
    } else {
      createTypeMutation.mutate({ data }, mutationConfig);
    }
  }, [editingType, updateTypeMutation, createTypeMutation, queryClient, handleFormReset]);

  const handleEditClick = useCallback((row) => {
    setEditingType(row);
    setShowCreateForm(true);
  }, []);

  const handleDeleteClick = useCallback((id, name) => {
    setDeleteModal({ isOpen: true, id, name, type: 'single', status: 'idle', resultMessage: null });
  }, []);

  const executePhysicalDelete = useCallback((idsToDelete) => {
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    deleteManyMutation.mutate({ ids: idsToDelete, dryRun: false }, {
      onSuccess: (res) => {
        if (res.success) {
          const deleted = res.data?.manifest?.deleted || idsToDelete;
          if (editingType && deleted.includes(editingType.segment_id)) {
            handleFormReset();
          }
          setDeleteModal(prev => ({ ...prev, status: 'success', resultMessage: `Successfully deleted ${deleted.length} categories.` }));
          clearSelection();
        } else {
          setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: res.message || 'Failed to delete categories.' }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: err.message || 'A server error occurred.' }));
      }
    });
  }, [deleteManyMutation, editingType, handleFormReset, clearSelection]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    const ids = deleteModal.type === 'bulk' ? deleteModal.id : [deleteModal.id];

    deleteManyMutation.mutate({ ids, dryRun: true }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          if (Object.keys(manifest.failed || {}).length > 0) {
            setDeleteModal({ isOpen: false, id: null, name: '', type: 'single', status: 'idle', resultMessage: null });
            setDependencyModal({
              isOpen: true,
              errorPayload: manifest,
              parentId: ids.join(', '),
              parentName: deleteModal.type === 'bulk' ? `${ids.length} selected categories` : deleteModal.name
            });
          } else {
            executePhysicalDelete(ids);
          }
        } else {
          setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: res.message || 'Verification inspection failed.' }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({ ...prev, status: 'error', resultMessage: err.message || 'Validation check failed.' }));
      }
    });
  }, [deleteModal, deleteManyMutation, executePhysicalDelete]);

  const allTypeIds = useMemo(() => courseTypes.map(t => t.segment_id), [courseTypes]);

  // Desktop Column Configuration
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
      cell: (row) => <Badge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="text"
            size="xs"
            onClick={() => handleEditClick(row)}
            className="!p-1.5 text-text-secondary hover:text-primary transition-colors hover:bg-transparent"
            title="Edit Category"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </Button>
          <Button
            variant="text"
            size="xs"
            onClick={() => handleDeleteClick(row.segment_id, row.segment_name)}
            className="!p-1.5 text-text-secondary hover:text-red-500 transition-colors hover:bg-transparent"
            title="Delete Category"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </Button>
        </div>
      )
    }
  ], [allTypeIds, selectedIds, toggleSelect, toggleSelectAll, isAllSelected, isSomeSelected, handleEditClick, handleDeleteClick]);

  const crumbs = [{ label: 'Dashboard', path: '/admin/dashboard', icon: 'home' }, { label: 'Courses', path: '/admin/courses' }, { label: 'Categories' }];

  if (isLoadingTypes) return <LoadingState message="Loading categories list..." />;
  if (typesError) return <ErrorState message={typesError.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all })} />;

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">category</span>
              <span className="text-sm font-bold text-text-main dark:text-white">Course Categories</span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="px-2 sm:px-4 lg:px-0 pt-6 lg:pt-10 pb-6 space-y-6">
          <Breadcrumbs items={crumbs} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">Course Categories</h1>
              <p className="text-text-secondary text-base">Define and manage segments, labels, and metadata structures for curriculum cataloging.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto self-start md:self-auto">
              <RefreshButton isFetching={isFetchingTypes} onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all })} />
              <Button
                variant="outlined"
                onClick={() => { if (showCreateForm) handleFormReset(); setShowCreateForm(p => !p); }}
                startIcon={showCreateForm ? 'visibility_off' : 'add_box'}
                className="whitespace-nowrap"
              >
                {showCreateForm ? 'Hide Form' : 'Add Category'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Active Categories List - Full width design as form is in a modal */}
            <div className="lg:col-span-12 bg-transparent sm:bg-surface-light dark:sm:bg-surface-dark border-0 sm:border border-border-light dark:border-border-dark rounded-2xl p-0 sm:p-6 shadow-none sm:shadow-sm transition-all duration-300">
              <div className="hidden sm:flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">category</span>
                </div>
                <h3 className="font-bold text-lg text-text-main dark:text-white">Active Categories</h3>
              </div>

              {/* JS Viewport Branching Execution Path */}
              {isMobile ? (
                <div className="flex flex-col gap-4">
                  {courseTypes.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark w-full">
                      <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2">search_off</span>
                      <p className="text-sm font-bold text-text-main dark:text-white">No categories found</p>
                    </div>
                  ) : (
                    courseTypes.map((row) => (
                      <div key={row.segment_id} className="w-full">
                        <LowDensityCard
                          icon={selectedIds.length > 0 ? (
                            <input
                              type="checkbox"
                              className="size-5 rounded border-slate-350 dark:border-slate-700 bg-white"
                              checked={selectedIds.includes(row.segment_id)}
                              onChange={() => toggleSelect(row.segment_id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div onClick={(e) => { e.stopPropagation(); toggleSelect(row.segment_id); }} className="cursor-pointer flex items-center justify-center w-full h-full">
                              <span className="material-symbols-outlined text-sm">
                                {row.entity_label === 'Subject' ? 'menu_book' : row.entity_label === 'Course' ? 'computer' : 'school'}
                              </span>
                            </div>
                          )}
                          title={row.segment_name}
                          subtitle1={row.segment_id}
                          subtitle2={`Label: ${row.entity_label}`}
                          bodyText={<div className="flex flex-col gap-1 items-start"><Badge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</Badge></div>}
                          actions={[
                            { label: 'Edit', icon: 'edit', priority: 'primary', onClick: (e) => { e.stopPropagation(); handleEditClick(row); } },
                            { label: 'Delete', icon: 'delete', priority: 'secondary', onClick: (e) => { e.stopPropagation(); handleDeleteClick(row.segment_id, row.segment_name); } }
                          ]}
                          onClick={() => handleEditClick(row)}
                        />
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <DataTable data={courseTypes} columns={columns} isLoading={false} />
              )}
            </div>
          </div>

          {/* Dialogs and Floating Action Bars Rendered via Short-Circuit Portals */}
          {showCreateForm && <CourseCategoryFormModal
            isOpen={showCreateForm}
            onClose={handleFormReset}
            editingType={editingType}
            onSubmit={handleFormSubmit}
            isPending={editingType ? updateTypeMutation.isPending : createTypeMutation.isPending}
            apiFeedback={apiFeedback}
          />}

          {deleteModal.isOpen && (
            <ConfirmModal
              isOpen={deleteModal.isOpen}
              onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', type: 'single', status: 'idle', resultMessage: null })}
              onConfirm={handleConfirmDelete}
              title={deleteModal.type === 'bulk' ? `Delete ${deleteModal.id?.length || 0} Categories` : 'Delete Category'}
              message={deleteModal.type === 'bulk' ? `Are you sure you want to delete ${deleteModal.id?.length || 0} selected categories?` : `Are you sure you want to delete category "${deleteModal.name}"?`}
              status={deleteModal.status}
              resultMessage={deleteModal.resultMessage}
              isProcessing={deleteModal.status === 'processing'}
            />
          )}

          {dependencyModal.isOpen && (
            <DeleteDependencyModal
              isOpen={dependencyModal.isOpen}
              onClose={() => setDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' })}
              errorPayload={dependencyModal.errorPayload}
              parentId={dependencyModal.parentId}
              parentName={dependencyModal.parentName}
              parentType="CourseType"
              onResolve={(blockers, deleteSafe) => {
                if (deleteSafe && dependencyModal.errorPayload?.deleted) {
                  executePhysicalDelete(dependencyModal.errorPayload.deleted);
                }
                setDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
              }}
            />
          )}

          <SelectionActionBar
            selectedCount={selectedIds.length}
            itemName="category"
            onClear={clearSelection}
            onDeleteSelected={() => setDeleteModal({
              isOpen: true,
              id: selectedIds,
              name: `${selectedIds.length} selected items`,
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
