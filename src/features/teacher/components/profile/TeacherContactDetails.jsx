import React from 'react';
import Card from '../../../../components/ui/Card';

/**
 * TeacherContactDetails: Specific component for teacher's contact information.
 */
const TeacherContactDetails = ({ teacher }) => {
  const contactItems = [
    { 
      label: 'EMAIL ADDRESS', 
      value: teacher.email, 
      icon: 'mail', 
      copyable: true,
      colorClasses: 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/30 dark:border-blue-900/10'
    },
    { 
      label: 'PHONE NUMBER', 
      value: teacher.mobile_number, 
      icon: 'call', 
      copyable: true,
      colorClasses: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100/30 dark:border-emerald-900/10'
    },
    { 
      label: 'RESIDENTIAL ADDRESS', 
      value: teacher.address, 
      icon: 'home',
      colorClasses: 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-100/30 dark:border-amber-900/10'
    }
  ];

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex items-center gap-2 bg-slate-50/20 dark:bg-slate-800/20">
        <span className="material-symbols-outlined text-text-secondary text-xl">contact_phone</span>
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Contact Information
        </h3>
      </Card.Header>
      
      <Card.Body className="p-6 divide-y divide-slate-100 dark:divide-slate-800/60">
        {contactItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all rounded-lg px-2 -mx-2">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${item.colorClasses}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <div>
                <p className="text-[9px] font-black text-text-secondary tracking-widest uppercase leading-none mb-1">{item.label}</p>
                <p className="text-sm font-bold text-text-main dark:text-white">{item.value || 'Not provided'}</p>
              </div>
            </div>
            {item.copyable && item.value && (
              <button 
                onClick={() => handleCopy(item.value)} 
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
                title={`Copy ${item.label.toLowerCase()}`}
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            )}
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default TeacherContactDetails;
