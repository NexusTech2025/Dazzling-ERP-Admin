import React, { useState, useEffect } from 'react';
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import DateInput from '../../../components/ui/v2/DateInput';

const StudentEditModal = ({ isOpen, onClose, student, onSave }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    admission_date: '',
    status: 'active'
  });

  useEffect(() => {
    if (student) {
      setFormData({
        student_name: student.student_name || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        email: student.email || '',
        phone: student.phone || '',
        gender: student.gender || 'Male',
        dob: student.dob || '',
        admission_date: student.admission_date || '',
        status: student.status || 'active'
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...student, ...formData });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            Edit Student Profile
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Full Name" required className="md:col-span-2">
                <TextInput 
                  value={formData.student_name}
                  onChange={(e) => handleFieldChange('student_name', e.target.value)}
                  placeholder="Enter full name"
                />
              </FormField>
              
              <FormField label="Father's Name">
                <TextInput 
                  value={formData.father_name}
                  onChange={(e) => handleFieldChange('father_name', e.target.value)}
                  placeholder="Enter father's name"
                />
              </FormField>

              <FormField label="Mother's Name">
                <TextInput 
                  value={formData.mother_name}
                  onChange={(e) => handleFieldChange('mother_name', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </FormField>

              <FormField label="Email Address">
                <TextInput 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </FormField>

              <FormField label="Phone Number">
                <TextInput 
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </FormField>

              <FormField label="Gender">
                <SelectInput 
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' }
                  ]}
                  value={formData.gender}
                  onChange={(val) => handleFieldChange('gender', val)}
                  placeholder="Select gender"
                />
              </FormField>

              <FormField label="Status">
                <SelectInput 
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' }
                  ]}
                  value={formData.status}
                  onChange={(val) => handleFieldChange('status', val)}
                  placeholder="Select status"
                />
              </FormField>

              <FormField label="Date of Birth">
                <DateInput 
                  value={formData.dob}
                  onChange={(e) => handleFieldChange('dob', e.target.value)}
                />
              </FormField>

              <FormField label="Admission Date">
                <DateInput 
                  value={formData.admission_date}
                  onChange={(e) => handleFieldChange('admission_date', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-text-secondary hover:text-text-main transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark active:scale-[0.98] transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEditModal;
