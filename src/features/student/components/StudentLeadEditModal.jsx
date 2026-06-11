import React from 'react';
import QuickAddStudent from '../registration/QuickAddStudent';

const StudentLeadEditModal = ({ isOpen, onClose, lead }) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-light dark:bg-slate-900 rounded-2xl shadow-xl border border-border-light dark:border-slate-800 w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            Modify Student Lead
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors outline-none cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <QuickAddStudent 
            isEdit={true} 
            initialData={lead} 
            onSubmitSuccess={onClose} 
            onCancel={onClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default StudentLeadEditModal;
