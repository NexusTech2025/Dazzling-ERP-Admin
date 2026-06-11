import React from 'react';
import { ProfileCell, ActionCell } from '../../../components/ui/table/cells';

const getPriorityLabel = (pri) => {
  const priorities = {
    'ready_to_enroll': 'Hot',
    'demo_scheduled': 'Demo Booked',
    'needs_callback': 'Warm',
    'general_inquiry': 'Cold'
  };
  return priorities[pri] || pri;
};

const getPriorityBadgeClass = (pri) => {
  switch (pri) {
    case 'ready_to_enroll':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    case 'demo_scheduled':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    case 'needs_callback':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
    default:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
  }
};

const getStatusLabel = (st) => {
  const statuses = {
    'prospect': 'Prospect',
    'contacted': 'Contacted',
    'converted': 'Converted',
    'lost': 'Lost'
  };
  return statuses[st] || st;
};

const getStatusBadgeClass = (st) => {
  switch (st) {
    case 'converted':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    case 'lost':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    case 'contacted':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
    default:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
  }
};

/**
 * Creates the column schema for the StudentLead table.
 */
export const createStudentLeadColumns = ({ onView, onEdit, onDelete, isDeleting } = {}) => {
  return [
    {
      header: 'Name',
      render: (lead) => (
        <ProfileCell 
          name={lead.student_name} 
          subtitle={lead.email || 'No email'} 
        />
      )
    },
    {
      header: 'Mobile',
      accessor: 'phone',
      className: 'font-semibold text-text-main dark:text-slate-200'
    },
    {
      header: 'Lead Temperature',
      align: 'center',
      render: (lead) => (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getPriorityBadgeClass(lead.priority)}`}>
          {getPriorityLabel(lead.priority)}
        </span>
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (lead) => (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}>
          {getStatusLabel(lead.status)}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (lead) => (
        <ActionCell 
          onView={onView ? () => onView(lead) : null}
          onEdit={onEdit ? () => onEdit(lead) : null}
          onDelete={onDelete ? () => onDelete(lead.lead_id, lead.student_name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
