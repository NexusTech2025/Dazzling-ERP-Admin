import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';
import { useCreateStudentLeadMutation } from '../hooks/useStudentQueries';
import { useUpdateStudentLeadMutation } from '../hooks/useStudentLeadQueries';

// V2 UI Components
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import PhoneInput from '../../../components/ui/v2/PhoneInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import RadioGroup from '../../../components/ui/v2/RadioGroup';

/**
 * QuickAddStudent: High-density, 30-second prospect capture form.
 * Optimized for peak-hour walk-ins. Connects directly to production GAS endpoints.
 * Features a dual-column layout with collapsible nested groups in the advanced CRM settings sidebar.
 */
const QuickAddStudent = ({ onUpgrade, initialData, isEdit = false, onSubmitSuccess, onCancel }) => {
  const navigate = useNavigate();
  const createMutation = useCreateStudentLeadMutation();
  const updateMutation = useUpdateStudentLeadMutation();
  const { data: batches = [], isLoading: isBatchesLoading } = useBatchesQuery();

  // Form State
  const [formData, setFormData] = useState({
    fullName: initialData?.student_name || '',
    mobile: initialData?.phone || '',
    email: initialData?.email || '',
    batchId: initialData?.batch_id || '',
    referral: initialData?.referral_id || '',
    note: initialData?.internal_notes || '',
    leadSource: initialData?.lead_source || 'walk-in',
    priority: initialData?.priority || 'ready_to_enroll',
    status: initialData?.status || 'prospect',
    workflowAction: 'add_another' // 'add_another' | 'upgrade' | 'profile'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Accordion collapsing states
  const [showCrmOptions, setShowCrmOptions] = useState(true); // Main advanced card toggle
  const [showPriorityOptions, setShowPriorityOptions] = useState(true); // Nested Priority toggle
  const [showWorkflowOptions, setShowWorkflowOptions] = useState(true); // Nested Workflow toggle

  // Transform batches for SelectInput
  const batchOptions = useMemo(() => {
    return batches.map(b => ({
      label: `${b.batch_name} (${b.course_name || 'No Course'})`,
      value: b.batch_id
    }));
  }, [batches]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile must be a valid 10-digit number';
    }
    if (!formData.batchId) newErrors.batchId = 'Target Batch is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSuccessMessage('');

    const selectedBatch = batches.find(b => b.batch_id === formData.batchId);

    if (isEdit) {
      const leadData = {
        student_name: formData.fullName.trim(),
        phone: formData.mobile.replace(/\D/g, ''),
        email: formData.email.trim() || null,
        batch_id: formData.batchId,
        referral_id: formData.referral.trim() || null,
        internal_notes: formData.note.trim() || null,
        lead_source: formData.leadSource,
        priority: formData.priority,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      console.log('[QuickAddStudent] Submitting Student Lead Edit Request:', { id: initialData.lead_id, leadData });

      updateMutation.mutate({ id: initialData.lead_id, data: leadData }, {
        onSuccess: (response) => {
          console.log('[QuickAddStudent] Student Lead Update API Response:', response);
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        },
        onError: (err) => {
          console.error('[QuickAddStudent] Student Lead Update API Error:', err);
          setErrors({ submit: err.message || 'A network error occurred. Please verify GAS endpoint.' });
        }
      });
    } else {
      const leadData = {
        student_name: formData.fullName.trim(),
        phone: formData.mobile.replace(/\D/g, ''),
        email: formData.email.trim() || null,
        batch_id: formData.batchId,
        referral_id: formData.referral.trim() || null,
        internal_notes: formData.note.trim() || null,
        lead_source: formData.leadSource,
        priority: formData.priority,
        status: 'prospect',
        is_registered: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[QuickAddStudent] Submitting Student Lead Request:', { leadData });

      createMutation.mutate({ leadData }, {
        onSuccess: (response) => {
          console.log('[QuickAddStudent] Student Lead API Response:', response);
          if (formData.workflowAction === 'upgrade') {
            // Callback to parent to trigger Full Wizard with data prepopulated
            if (onUpgrade) {
              onUpgrade({
                fullName: formData.fullName,
                mobile: formData.mobile,
                email: formData.email,
                batchId: formData.batchId,
                batchName: selectedBatch?.batch_name || '',
                courseId: selectedBatch?.item_id || '',
                courseName: selectedBatch?.course_name || '',
                referral: formData.referral
              });
            }
          } else if (formData.workflowAction === 'profile') {
            // Redirect directly to the student list
            navigate('/admin/students');
          } else {
            // Stay & Add Another: Reset Form except workflow & metadata preferences
            setFormData({
              fullName: '',
              mobile: '',
              email: '',
              batchId: '',
              referral: '',
              note: '',
              leadSource: 'walk-in',
              priority: 'ready_to_enroll',
              workflowAction: 'add_another'
            });
            setSuccessMessage('Prospect successfully added! Form cleared for next capture.');
            setTimeout(() => setSuccessMessage(''), 5000);
          }
        },
        onError: (err) => {
          console.error('[QuickAddStudent] Student Lead API Error:', err);
          setErrors({ submit: err.message || 'A network error occurred. Please verify GAS endpoint.' });
        }
      });
    }
  };

  // Human-readable translations
  const getSourceLabel = (src) => {
    const sources = {
      'walk-in': 'Walk-In',
      'social_media': 'Social Media',
      'website': 'Website',
      'google': 'Google Maps/Search',
      'event': 'Event/Flyer',
      'referral': 'Referral'
    };
    return sources[src] || src;
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

  const getWorkflowLabel = (act) => {
    const actions = {
      'add_another': 'Clear Form',
      'upgrade': 'Upgrade Wizard',
      'profile': 'Go to Directory'
    };
    return actions[act] || act;
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

  return (
    <div className={isEdit ? "w-full animate-in fade-in zoom-in-95 duration-300" : "max-w-5xl mx-auto bg-white dark:bg-slate-900/50 rounded-2xl border border-primary/5 shadow-lg p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300"}>
      {!isEdit && (
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs mb-1">
            <span className="material-symbols-outlined text-[16px] animate-pulse">bolt</span>
            High-Speed Prospect Capture
          </div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Quick Student Lead Form</h2>
          <p className="text-xs text-text-secondary mt-1">Capture basic walk-in or inquiry details in under 30 seconds. This creates a student profile lead only.</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Core Fields (Spans 8 cols on large screens) */}
          <div className="lg:col-span-8 space-y-5">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3 border-b border-slate-100 dark:border-slate-800/60 pb-2">
              <span className="material-symbols-outlined text-primary text-base">badge</span>
              Core Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" name="fullName" required error={errors.fullName}>
                <TextInput
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  leftIcon="person"
                />
              </FormField>

              <FormField label="Mobile Number" name="mobile" required error={errors.mobile}>
                <PhoneInput
                  placeholder="10-digit number"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Email Address (Optional)" name="email" error={errors.email}>
                <TextInput
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  leftIcon="mail"
                />
              </FormField>

              <FormField label="Target Batch" name="batchId" required error={errors.batchId}>
                <SelectInput
                  options={batchOptions}
                  value={formData.batchId}
                  onChange={(val) => handleChange('batchId', val)}
                  placeholder={isBatchesLoading ? "Loading Batches..." : "Select Batch..."}
                  searchable
                  leftIcon="group"
                />
              </FormField>
            </div>

            <FormField label="Referral ID / Name (Optional)" name="referral">
              <TextInput
                placeholder="Enter Referral code or partner name"
                value={formData.referral}
                onChange={(e) => handleChange('referral', e.target.value)}
                leftIcon="redeem"
              />
            </FormField>

            <FormField label="Internal Notes" name="note">
              <textarea
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Add walk-in background, specific queries, or special callback instructions..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 px-4 py-2.5 text-sm text-inherit placeholder:text-text-secondary/50 min-h-[120px] resize-y outline-none transition-all"
              />
            </FormField>
          </div>

          {/* Right Column: CRM Sidebar (Spans 4 cols on large screens, collapsible) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 shadow-sm">
              
              {/* Header / Click Toggle */}
              <button
                type="button"
                onClick={() => setShowCrmOptions(!showCrmOptions)}
                className="w-full flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors text-left cursor-pointer outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">settings_account_box</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Advanced Lead Options</h3>
                    {!showCrmOptions && (
                      <p className="text-[10px] text-text-secondary mt-0.5 font-medium tracking-wide flex items-center gap-1.5 truncate">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        {getSourceLabel(formData.leadSource)} • {getPriorityLabel(formData.priority)} {isEdit ? `• ${getStatusLabel(formData.status)}` : `• ${getWorkflowLabel(formData.workflowAction)}`}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${showCrmOptions ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Collapsible Body */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showCrmOptions ? 'max-h-[1200px] opacity-100 p-4 space-y-5' : 'max-h-0 opacity-0 p-0'}`}>
                
                <FormField label="Lead Source" name="leadSource">
                  <SelectInput
                    options={[
                      { label: 'Walk-In Inquiry', value: 'walk-in' },
                      { label: 'Social Media (Meta/Insta)', value: 'social_media' },
                      { label: 'Website Inquiry', value: 'website' },
                      { label: 'Google Search / Maps', value: 'google' },
                      { label: 'Event / Flyer Campaign', value: 'event' },
                      { label: 'Existing Friend Referral', value: 'referral' }
                    ]}
                    value={formData.leadSource}
                    onChange={(val) => handleChange('leadSource', val)}
                    leftIcon="campaign"
                  />
                </FormField>

                {isEdit && (
                  <FormField label="Lead Status" name="status">
                    <SelectInput
                      options={[
                        { label: 'Prospect (New)', value: 'prospect' },
                        { label: 'Contacted', value: 'contacted' },
                        { label: 'Converted', value: 'converted' },
                        { label: 'Lost', value: 'lost' }
                      ]}
                      value={formData.status}
                      onChange={(val) => handleChange('status', val)}
                      leftIcon="track_changes"
                    />
                  </FormField>
                )}

                {/* Sub-Collapsible Priority Group */}
                <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-100/20 dark:bg-slate-900/30 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShowPriorityOptions(!showPriorityOptions)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-100/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer outline-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-base">local_fire_department</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Lead Temperature</span>
                      {!showPriorityOptions && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-wider ml-1.5 scale-90">
                          {getPriorityLabel(formData.priority).split(' ')[0]}
                        </span>
                      )}
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform duration-300 ${showPriorityOptions ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showPriorityOptions ? 'max-h-[500px] opacity-100 p-3 border-t border-slate-100 dark:border-slate-800/40' : 'max-h-0 opacity-0 p-0 border-t-0'}`}>
                    <RadioGroup
                      name="priority"
                      layout="list"
                      value={formData.priority}
                      onChange={(val) => handleChange('priority', val)}
                      options={[
                        { label: 'Ready to Enroll (Hot)', value: 'ready_to_enroll', description: 'Wants to enroll immediately', icon: 'local_fire_department' },
                        { label: 'Demo Class Scheduled', value: 'demo_scheduled', description: 'Booked next demo class', icon: 'event_available' },
                        { label: 'Needs Callback (Warm)', value: 'needs_callback', description: 'Requires a follow-up call', icon: 'phone_callback' },
                        { label: 'General Inquiry (Cold)', value: 'general_inquiry', description: 'Only collected brochures', icon: 'help_outline' }
                      ]}
                    />
                  </div>
                </div>

                {/* Sub-Collapsible Workflow Group (Only shown in creation mode) */}
                {!isEdit && (
                  <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-100/20 dark:bg-slate-900/30 overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setShowWorkflowOptions(!showWorkflowOptions)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-100/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer outline-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">settings_input_component</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Submit Action</span>
                        {!showWorkflowOptions && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-wider ml-1.5 scale-90">
                            {getWorkflowLabel(formData.workflowAction)}
                          </span>
                        )}
                      </div>
                      <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform duration-300 ${showWorkflowOptions ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showWorkflowOptions ? 'max-h-[500px] opacity-100 p-3 border-t border-slate-100 dark:border-slate-800/40' : 'max-h-0 opacity-0 p-0'}`}>
                      <RadioGroup
                        name="workflowAction"
                        layout="list"
                        value={formData.workflowAction}
                        onChange={(val) => handleChange('workflowAction', val)}
                        options={[
                          { label: 'Stay & Clear Form', value: 'add_another', description: 'Clear form for the next prospect', icon: 'refresh' },
                          { label: 'Upgrade to Full Wizard', value: 'upgrade', description: 'Prepopulate into full registration wizard', icon: 'arrow_forward' },
                          { label: 'Go to Student Directory', value: 'profile', description: 'Redirect back to records list', icon: 'dns' }
                        ]}
                      />
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>

        {/* Submit Actions (Full width outside the columns) */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={isEdit ? onCancel : () => navigate('/admin/students')}
            className="px-6 py-2.5 rounded-xl border border-border-light dark:border-border-dark font-bold text-text-secondary text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isEdit ? updateMutation.isPending : createMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isEdit ? (
              updateMutation.isPending ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Save Changes
                </>
              )
            ) : (
              createMutation.isPending ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                  Creating Lead...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Save Student Lead
                </>
              )
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickAddStudent;
