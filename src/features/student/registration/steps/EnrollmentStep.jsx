import React, { useState } from 'react';
import { useBatchesQuery } from '../../../batch/hooks/useBatchQueries';

const EnrollmentStep = ({ formData, setFormData, onNext, onBack }) => {
  const { data: batches = [], isLoading } = useBatchesQuery();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBatches = batches.filter(batch => 
    batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBatch = (batch) => {
    setFormData(prev => ({
      ...prev,
      batchId: batch.batch_id,
      batchName: batch.batch_name,
      courseId: batch.item_id,
      courseName: batch.course_name
    }));
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Batch Assignment</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure student enrollment and schedule details.</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <span className="material-symbols-outlined text-3xl">fingerprint</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">System Generated ID</p>
              <p className="text-xl font-mono font-bold text-slate-900 dark:text-white">ENR-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Status: <span className="text-primary font-bold">Draft</span></span>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <p className="font-bold text-primary text-sm">Package Auto-Expansion Active</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Selecting a course package will automatically generate sub-enrollments for each constituent subject.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Active Batch</h3>
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all h-10" 
                placeholder="Search batches..." 
                type="text"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBatches.map(batch => (
                <label 
                  key={batch.batch_id}
                  className={`relative flex flex-col bg-white dark:bg-slate-800 border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    formData.batchId === batch.batch_id ? 'border-primary shadow-md' : 'border-border-light dark:border-border-dark hover:border-primary/50'
                  }`}
                >
                  <input 
                    type="radio"
                    name="batch"
                    className="absolute top-4 right-4 text-primary focus:ring-primary"
                    checked={formData.batchId === batch.batch_id}
                    onChange={() => handleSelectBatch(batch)}
                  />
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {batch.course_name?.charAt(0) || 'B'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{batch.batch_name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{batch.course_name}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teacher</p>
                      <p className="text-xs mt-1 font-medium">{batch.teacher_name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Schedule</p>
                      <p className="text-xs mt-1 font-medium">{batch.schedule_days} • {batch.schedule_time}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Back
          </button>
          <div className="flex gap-4">
            <button 
              disabled={!formData.batchId}
              onClick={onNext}
              className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              Continue
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStep;
