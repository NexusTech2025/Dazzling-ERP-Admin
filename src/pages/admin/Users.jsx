import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import MobileBaseLayout from '../../components/layout/MobileBaseLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import DataTable from '../../components/ui/DataTable';
import ConfirmModal from '../../components/ui/ConfirmModal';
import APIErrorModal from '../../components/ui/APIErrorModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import useIsMobile from '../../hooks/useIsMobile';

import { useUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from '../../features/auth/hooks/useAuthQueries';
import { createUsersColumns } from './schemas/userSchema';
import { UsersMobileView } from './components/UsersMobileView';
import { EditUserModal } from './components/EditUserModal';

const availableRoles = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'guest', label: 'Guest' }
];

const availableStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'locked', label: 'Locked' },
  { value: 'disabled', label: 'Disabled' }
];

export const Users = () => {
  const isMobile = useIsMobile();
  const { data: users = [], isLoading, isFetching, error, refetch } = useUsersQuery();
  
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal Controllers
  const [editUser, setEditUser] = useState(null); // stores user object being edited
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleteStatus, setDeleteStatus] = useState('idle');
  const [deleteMsg, setDeleteMsg] = useState(null);

  const [apiError, setApiError] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  // Client-side filtering logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.user_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === 'all' || u.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleEditOpen = (user) => {
    setEditUser(user);
  };

  const handleEditSave = (data) => {
    if (!editUser) return;
    
    // Structure payload data filtering empty passwords
    const payloadData = {
      username: data.username,
      role: data.role,
      status: data.status
    };
    if (data.password) {
      payloadData.password = data.password;
    }

    updateMutation.mutate({
      userId: editUser.user_id,
      data: payloadData
    }, {
      onSuccess: (res) => {
        if (res.success) {
          setEditUser(null);
        } else {
          setApiError(res.error || new Error(res.message || 'Failed updating user'));
          setErrorModalOpen(true);
        }
      },
      onError: (err) => {
        setApiError(err);
        setErrorModalOpen(true);
      }
    });
  };

  const handleDeleteTrigger = (id, username) => {
    setDeleteMsg(null);
    setDeleteStatus('idle');
    setDeleteModal({ isOpen: true, id, name: username });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.id) return;
    setDeleteStatus('processing');

    deleteMutation.mutate(deleteModal.id, {
      onSuccess: (res) => {
        if (res.success) {
          setDeleteStatus('success');
          setDeleteMsg(`User account '${deleteModal.name}' was successfully deleted.`);
        } else {
          setDeleteStatus('error');
          setDeleteModal({ isOpen: false, id: null, name: '' });
          setApiError(res.error || new Error(res.message || 'Delete operation failed'));
          setErrorModalOpen(true);
        }
      },
      onError: (err) => {
        setDeleteStatus('error');
        setDeleteModal({ isOpen: false, id: null, name: '' });
        setApiError(err);
        setErrorModalOpen(true);
      }
    });
  };

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, id: null, name: '' });
    setDeleteStatus('idle');
    setDeleteMsg(null);
  };

  const columns = useMemo(() => createUsersColumns({
    onEdit: handleEditOpen,
    onDelete: handleDeleteTrigger,
    deletingId: deleteMutation.isPending ? deleteModal.id : null
  }), [deleteMutation.isPending, deleteModal.id]);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Users Directory' }
  ];

  const renderFilters = (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
      <div className="md:col-span-6 lg:col-span-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by username or user id..."
        />
      </div>
      <div className="md:col-span-6 lg:col-span-8 flex flex-wrap gap-3 items-center">
        <SelectFilter
          value={roleFilter}
          onChange={setRoleFilter}
          options={availableRoles}
          defaultLabel="Role: All"
        />
        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={availableStatuses}
          defaultLabel="Status: All"
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <MobileBaseLayout>
          <MobileBaseLayout.Header
            title="Users Directory"
            renderRight={
              <Link
                to="/admin/users/add"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-primary/10 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                <span>Add User</span>
              </Link>
            }
          />

          <MobileBaseLayout.FilterSlot>
            <div className="flex flex-col gap-3 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-slate-50 dark:bg-black/20 border border-border-light dark:border-white/8 rounded-2xl px-4 py-3 text-xs font-bold text-text-main dark:text-white outline-none focus:border-primary focus:bg-white dark:focus:bg-black/40 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
                >
                  <option value="all">Role: All</option>
                  {availableRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
                >
                  <option value="all">Status: All</option>
                  {availableStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </MobileBaseLayout.FilterSlot>

          <MobileBaseLayout.ListSlot
            isEmpty={filteredUsers.length === 0}
            renderEmptyState={
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
                <span className="material-symbols-outlined text-4xl text-slate-400">group_off</span>
                <p className="text-sm font-semibold text-text-secondary mt-2">No users found</p>
              </div>
            }
          >
            <UsersMobileView
              users={filteredUsers}
              onEdit={handleEditOpen}
              onDelete={handleDeleteTrigger}
              deletingId={deleteMutation.isPending ? deleteModal.id : null}
            />
          </MobileBaseLayout.ListSlot>
        </MobileBaseLayout>

        {editUser && (
          <EditUserModal
            isOpen={!!editUser}
            onClose={() => setEditUser(null)}
            onSave={handleEditSave}
            user={editUser}
            isSaving={updateMutation.isPending}
          />
        )}

        {deleteModal.isOpen && (
          <ConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={handleDeleteClose}
            onConfirm={handleDeleteConfirm}
            title="Delete User Account"
            message={`Are you sure you want to permanently delete user account '${deleteModal.name}'? All active sessions for this account will be closed.`}
            status={deleteStatus}
            resultMessage={deleteMsg}
          />
        )}

        {errorModalOpen && (
          <APIErrorModal
            isOpen={errorModalOpen}
            onClose={() => setErrorModalOpen(false)}
            title="Operation Failed"
            error={apiError}
          />
        )}
      </>
    );
  }

  return (
    <>
      <MainLayout
        body={
          <div className="pt-6 lg:pt-10 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <Breadcrumbs items={breadcrumbs} />
              {isFetching && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
                  <div className="size-2.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">Updating...</span>
                </div>
              )}
            </div>

            <DataTable
              title="Users Directory"
              subtitle="Manage permissions, security roles, and active credentials."
              data={filteredUsers}
              columns={columns}
              filters={renderFilters}
              isLoading={isLoading}
              primaryAction={
                <Link to="/admin/users/add" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Add User
                </Link>
              }
              secondaryAction={<RefreshButton isFetching={isFetching} onRefresh={refetch} />}
            />
          </div>
        }
      />

      {editUser && (
        <EditUserModal
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          onSave={handleEditSave}
          user={editUser}
          isSaving={updateMutation.isPending}
        />
      )}

      {deleteModal.isOpen && (
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete user account '${deleteModal.name}'? All active sessions for this account will be closed.`}
          status={deleteStatus}
          resultMessage={deleteMsg}
        />
      )}

      {errorModalOpen && (
        <APIErrorModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          title="Operation Failed"
          error={apiError}
        />
      )}
    </>
  );
};

export default Users;
