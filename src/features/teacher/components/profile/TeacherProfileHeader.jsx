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
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          
          {/* User Identity Section */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Avatar 
              src={teacher.avatar} 
              initials={teacher.teacher_name} 
              size="2xl" 
              variant="circle"
              className="border-4 border-surface-light dark:border-slate-900 shadow-lg"
            />
            
            <div className="flex flex-col items-center md:items-start mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white leading-tight">
                {teacher.teacher_name}
              </h2>
              <div className="flex items-center gap-2 text-text-secondary mt-1">
                <span className="text-sm font-mono bg-background-light dark:bg-background-dark px-2 py-0.5 rounded border border-border-light dark:border-border-dark">
                  {teacher.teacher_id}
                </span>
                <span className="text-sm">•</span>
                <span className="text-sm font-medium">{teacher.specialization || 'Department Faculty'}</span>
              </div>
            </div>
          </div>

          {/* Action & Status Section */}
          <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
            <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="px-4 py-1 text-xs uppercase font-black tracking-widest">
              {teacher.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outlined" startIcon="mail" size="md">
                Message
              </Button>
              <Button 
                variant="contained" 
                startIcon="edit" 
                size="md"
                onClick={() => navigate(`/admin/teachers/edit/${teacher.teacher_id}`)}
              >
                Edit Profile
              </Button>
            </div>
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
