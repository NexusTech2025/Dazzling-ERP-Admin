import React, { useState, useEffect } from 'react';
import Badge from '../../../components/ui/Badge';

const StudentEditModal = ({ isOpen, onClose, student, onSave }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
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
        gender: student.gender || 'male',
        date_of_birth: student.date_of_birth || '',
        admission_date: student.admission_date || '',
        status: student.status || 'active'
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
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
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  required
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Father's Name</label>
                <input 
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Mother's Name</label>
                <input 
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Phone Number</label>
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Date of Birth</label>
                <input 
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Admission Date</label>
                <input 
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
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
