import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useStudentLeadsQuery, useDeleteStudentLeadMutation } from '../../features/student/hooks/useStudentLeadQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createStudentLeadColumns } from './schemas/studentLeadSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import StudentLeadDetailModal from '../../features/student/components/StudentLeadDetailModal';
import StudentLeadEditModal from '../../features/student/components/StudentLeadEditModal';

const StudentLeads = () => {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    status: 'idle',
    resultMessage: null
  });

  const [selectedLeadForView, setSelectedLeadForView] = useState(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);

  // Fetch leads
  const { data: leads = [], isLoading, isFetching, error } = useStudentLeadsQuery();
  const deleteMutation = useDeleteStudentLeadMutation();

  // Handlers for lead rows
  const handlers = {
    onView: (lead) => setSelectedLeadForView(lead),
    onEdit: (lead) => setSelectedLeadForEdit(lead),
    onDelete: (id, name) => {
      setDeleteModal({
        isOpen: true,
        id,
        name,
        status: 'idle',
        resultMessage: null
      });
    },
    isDeleting: deleteMutation.isPending,
  };

  // Generate columns
  const columns = useMemo(() => createStudentLeadColumns(handlers), [handlers]);

  // Clientside filtering
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Search Query Match (Name, Phone, Email)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (lead.student_name && lead.student_name.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q));

      // 2. Priority Filter Match
      const matchesPriority = !priorityFilter || lead.priority === priorityFilter;

      // 3. Status Filter Match
      const matchesStatus = !statusFilter || lead.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [leads, searchQuery, priorityFilter, statusFilter]);

  const handleConfirmDelete = () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));

    deleteMutation.mutate({ id: deleteModal.id }, {
      onSuccess: (response) => {
        if (selectedLeadForView?.lead_id === deleteModal.id) {
          setSelectedLeadForView(null);
        }
        if (selectedLeadForEdit?.lead_id === deleteModal.id) {
          setSelectedLeadForEdit(null);
        }
        setDeleteModal(prev => ({
          ...prev,
          status: 'success',
          resultMessage: response.message || 'Lead record has been successfully removed.'
        }));
      },
      onError: (err) => {
        console.error('Delete Lead Error:', err);
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Connection error. Please check your network.'
        }));
      }
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: '', status: 'idle', resultMessage: null });
  };

  // Filter components
  const filters = (
    <>
      <div className="md:col-span-6 lg:col-span-4 relative">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, phone, or email..."
        />
      </div>
      <div className="md:col-span-6 lg:col-span-8 flex flex-wrap gap-3 items-center">
        <SelectFilter
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { label: 'Hot Lead', value: 'ready_to_enroll' },
            { label: 'Demo Booked', value: 'demo_scheduled' },
            { label: 'Warm Lead', value: 'needs_callback' },
            { label: 'Cold Inquiry', value: 'general_inquiry' }
          ]}
          defaultLabel="Temperature: All"
        />
        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'Prospect', value: 'prospect' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Converted', value: 'converted' },
            { label: 'Lost', value: 'lost' }
          ]}
          defaultLabel="Status: All"
        />
      </div>
    </>
  );

  return (
    <>
      <DataTable
        title="Student Leads Directory"
        subtitle="Manage marketing prospects and walk-in leads"
        columns={columns}
        data={filteredLeads}
        isLoading={isLoading}
        error={error}
        onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.lead.all })}
        emptyMessage="No student leads found matching your filters."
        filters={filters}
        primaryAction={
          <Link to="/admin/students/add" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined text-lg">add</span>
            Capture Lead
          </Link>
        }
        secondaryAction={
          <RefreshButton
            isFetching={isFetching}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.lead.all })}
          />
        }
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        status={deleteModal.status}
        resultMessage={deleteModal.resultMessage}
        title="Delete Student Lead"
        message={`Are you sure you want to permanently delete lead ${deleteModal.name}? This action cannot be undone.`}
      />

      <StudentLeadDetailModal
        isOpen={!!selectedLeadForView}
        onClose={() => setSelectedLeadForView(null)}
        lead={selectedLeadForView}
      />

      <StudentLeadEditModal
        isOpen={!!selectedLeadForEdit}
        onClose={() => setSelectedLeadForEdit(null)}
        lead={selectedLeadForEdit}
      />
    </>
  );
};

export default StudentLeads;
