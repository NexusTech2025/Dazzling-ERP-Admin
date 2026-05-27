import React from 'react';
import Card from '../../../../components/ui/Card';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';
import { useTeacherSalaryConfigQuery } from '../../hooks/useTeacherQueries';

/**
 * TeacherProfessionalCard: Displays HR and professional history details.
 * New component to cover missing schema fields.
 */
const TeacherProfessionalCard = ({ teacher }) => {
  const { data: salaryConfig, isLoading: isSalaryLoading } = useTeacherSalaryConfigQuery(teacher.teacher_id);

  return (
    <Card className="h-full">
      <Card.Header className="flex items-center gap-2 border-b border-border-light dark:border-border-dark">
        <span className="material-symbols-outlined text-text-secondary text-xl">work</span>
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Professional Background
        </h3>
      </Card.Header>

      <Card.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <KeyValuePair
            label="Experience"
            value={teacher.experience_years ? `${teacher.experience_years} Years` : 'N/A'}
            icon="history"
          />
          <KeyValuePair
            label="Qualification"
            value={teacher.qualification}
            icon="school"
          />
          <KeyValuePair
            label="Employment Type"
            value={teacher.teacher_type ? teacher.teacher_type.replace('_', ' ') : 'N/A'}
            icon="badge"
            className="capitalize"
          />
          <KeyValuePair
            label="Preferred Slot"
            value={teacher.prefered_time_slot}
            icon="schedule"
            fallback="Not specified"
          />
          <KeyValuePair
            label="Joining Date"
            value={teacher.joining_date ? new Date(teacher.joining_date.split('T')[0]).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            icon="calendar_today"
          />
          <KeyValuePair
            label="Assigned Branch"
            value={teacher.branch_name || teacher.branch_id}
            icon="store"
            fallback="Not assigned"
          />
          <KeyValuePair
            label="Base Salary"
            value={
              isSalaryLoading
                ? 'Loading...'
                : salaryConfig
                  ? `₹${salaryConfig.base_amount?.toLocaleString()} (${salaryConfig.salary_type ? salaryConfig.salary_type.replace('_', ' ') : ''})`
                  : 'Not configured'
            }
            icon="payments"
            className="capitalize"
          />
          <KeyValuePair
            label="Specialization"
            value={teacher.specialization}
            icon="psychology"
          />
          <KeyValuePair
            label="Previous Institute"
            value={teacher.previous_institute}
            icon="corporate_fare"
            fallback="No record provided"
            className="col-span-2"
          />
        </div>
      </Card.Body>

      {teacher.notes && (
        <Card.Footer bg className="border-t border-border-light dark:border-border-dark">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Administrative Notes</span>
            <p className="text-xs text-text-main dark:text-slate-300 italic font-medium leading-relaxed">
              "{teacher.notes}"
            </p>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default TeacherProfessionalCard;
