import React from 'react';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';

const StudentLeadDetailModal = ({ isOpen, onClose, lead }) => {
  const { data: batches = [] } = useBatchesQuery();

  if (!isOpen || !lead) return null;

  // Resolve target batch details from query cache
  const targetBatch = batches.find(b => b.batch_id === lead.batch_id);

  const getPriorityBadgeStyles = (pri) => {
    switch (pri) {
      case 'ready_to_enroll':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'demo_scheduled':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'needs_callback':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const getPriorityLabel = (pri) => {
    const priorities = {
      'ready_to_enroll': 'Hot Lead',
      'demo_scheduled': 'Demo Booked',
      'needs_callback': 'Needs Callback',
      'general_inquiry': 'Cold Inquiry'
    };
    return priorities[pri] || pri;
  };

  const getStatusBadgeStyles = (st) => {
    switch (st) {
      case 'converted':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'lost':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'contacted':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
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

  const getSourceLabel = (src) => {
    const sources = {
      'walk-in': 'Walk-In Inquiry',
      'social_media': 'Social Media',
      'website': 'Website Inquiry',
      'google': 'Google Maps/Search',
      'event': 'Event/Campaign',
      'referral': 'Referral'
    };
    return sources[src] || src;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-light dark:bg-slate-900 rounded-2xl shadow-xl border border-border-light dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">contacts</span>
            Lead Profile Details
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors outline-none cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{lead.student_name}</h2>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">calendar_today</span>
                Captured: {lead.created_at ? new Date(lead.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeStyles(lead.priority)}`}>
                {getPriorityLabel(lead.priority)}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(lead.status)}`}>
                {getStatusLabel(lead.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Mobile Number</label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">phone</span>
                {lead.phone}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Email Address</label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">mail</span>
                {lead.email || <span className="text-text-secondary/50 font-normal italic">No Email Provided</span>}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Target Batch</label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">group</span>
                {targetBatch ? `${targetBatch.batch_name} (${targetBatch.course_name || 'No Course'})` : lead.batch_id}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Lead Source</label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">campaign</span>
                {getSourceLabel(lead.lead_source)}
              </p>
            </div>

            {lead.referral_id && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Referral Code/Partner</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">redeem</span>
                  {lead.referral_id}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Internal notes / Callback instructions</label>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-350 min-h-[80px]">
              {lead.internal_notes || <span className="text-text-secondary/50 font-normal italic">No notes added.</span>}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-border-light dark:border-slate-800 flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer outline-none"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLeadDetailModal;
