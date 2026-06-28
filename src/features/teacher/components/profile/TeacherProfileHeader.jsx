import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../../../components/ui/Badge';
import Avatar from '../../../../components/ui/v2/Avatar';
import Button from '../../../../components/ui/v2/Button';

/**
 * TeacherProfileHeader: Specific composite component for the teacher's profile hero section.
 * Refactored to consume Core V2 primitives (Avatar, Button).
 */
const TeacherProfileHeader = ({ teacher, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const tabs = ['Overview', 'Assigned Classes', 'Attendance', 'Salary & Payroll', 'Documents', 'Performance'];

  return (
    <div className="relative overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
      {/* Background Banner with Gradient */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-900/20"></div>
      
      <div className="relative px-6 pt-16 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* User Identity Section */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar 
              src={teacher.profile_photo_url} 
              initials={teacher.full_name} 
              size="2xl" 
              variant="rounded"
              className="border-4 border-surface-light dark:border-slate-900 shadow-lg bg-primary text-white"
            />
            
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white leading-tight">
                  {teacher.full_name}
                </h2>
                <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest">
                  {teacher.status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm font-medium text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  <span>{teacher.teacher_id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                  <span>{teacher.specialization || 'Department Faculty'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">store</span>
                  <span>{teacher.branch_name || teacher.branch_id || 'Main Branch'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>Joined {teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Status Section */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            <Button 
              variant="contained" 
              startIcon="edit" 
              size="md"
              onClick={() => navigate(`/admin/teachers/edit/${teacher.teacher_id}`)}
            >
              Edit Profile
            </Button>
            <Button variant="outlined" startIcon="mail" size="md">
              Message
            </Button>
            <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-border-light dark:border-border-dark px-6">
        <nav className="flex -mb-px space-x-6 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TeacherProfileHeader;
