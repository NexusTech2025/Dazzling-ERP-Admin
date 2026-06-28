import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/v2/Button';

/**
 * TeacherSalarySnapshot: Displays payroll summaries and paystub redirections.
 */
const TeacherSalarySnapshot = ({ salaryConfig }) => {
  const lastSalaryValue = salaryConfig?.base_amount 
    ? `₹${salaryConfig.base_amount.toLocaleString()}` 
    : '$4,250'; // Fallback mockup salary

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl">payments</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Payroll Summary
          </h3>
        </div>
      </Card.Header>
      
      <Card.Body className="p-6 space-y-3">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl flex justify-between items-center border border-border-light/30 dark:border-border-dark/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/75 transition-all">
          <span className="text-xs font-semibold text-text-secondary">Last Salary</span>
          <span className="text-sm font-bold text-text-main dark:text-white">{lastSalaryValue}</span>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl flex justify-between items-center border border-border-light/30 dark:border-border-dark/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/75 transition-all">
          <span className="text-xs font-semibold text-text-secondary">Next Payroll</span>
          <span className="text-sm font-bold text-text-main dark:text-white">30 Nov 2023</span>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl flex justify-between items-center border border-border-light/30 dark:border-border-dark/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/75 transition-all">
          <span className="text-xs font-semibold text-text-secondary">Payment Status</span>
          <Badge variant="success">PROCESSED</Badge>
        </div>
        
        <Button variant="outlined" className="w-full mt-2" startIcon="visibility">
          View Paystubs
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TeacherSalarySnapshot;
