import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Avatar from '../../../../components/ui/v2/Avatar';
import Button from '../../../../components/ui/v2/Button';

/**
 * TeacherProfileHeader: Specific composite component for the teacher's profile hero section.
 * Refactored to consume Card primitives and include clipboard copy handlers.
 */
const TeacherProfileHeader = ({ teacher, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const tabs = ['Overview', 'Assigned Classes', 'Attendance', 'Salary & Payroll', 'Documents', 'Performance'];

  const handleCopyId = () => {
    if (!teacher?.teacher_id) return;
    navigator.clipboard.writeText(teacher.teacher_id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="relative overflow-hidden shadow-sm">
      {/* Background Banner with Gradient */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-900/20"></div>
      
      <div className="relative px-6 pt-12 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* User Identity Section */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar 
              src={(() => {
                const url = teacher.profile_photo_url;
                if (!url || url === 'null' || url === 'undefined' || url === '') {
                  return teacher.gender?.toLowerCase() === 'female' || teacher.gender?.toLowerCase() === 'f'
                    ? 'https://img.icons8.com/color/150/administrator-female.png'
                    : 'https://img.icons8.com/color/150/administrator-male.png';
                }
                return url;
              })()} 
              initials={teacher.full_name} 
              size="xl" 
              variant="rounded"
              className="border-4 border-surface-light dark:border-slate-900 shadow-lg bg-primary text-white"
            />
            
            <div className="flex flex-col items-center md:items-start min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-text-main dark:text-white leading-tight">
                  {teacher.full_name}
                </h2>
                <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest">
                  {teacher.status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-medium text-text-secondary">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none"
                  title="Copy Teacher ID"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                  <span>{teacher.teacher_id}</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">domain</span>
                  <span>{teacher.specialization || 'Department Faculty'}</span>
                </div>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">store</span>
                  <span>{teacher.branch_name || teacher.branch_id || 'Main Branch'}</span>
                </div>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                  <span>Joined {teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Status Section */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end shrink-0">
            <Button 
              variant="contained" 
              startIcon="edit" 
              size="sm"
              onClick={() => navigate(`/admin/teachers/edit/${teacher.teacher_id}`)}
            >
              Edit Profile
            </Button>
            <Button variant="outlined" startIcon="mail" size="sm">
              Message
            </Button>
            <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-lg">more_vert</span>
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
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs font-bold transition-all ${
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
    </Card>
  );
};

export default TeacherProfileHeader;
