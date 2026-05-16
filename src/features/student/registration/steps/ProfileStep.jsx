import React from 'react';

const ProfileStep = ({ formData, setFormData, onNext, onCancel }) => {
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      // Handle file upload logic here if needed, or just store the file object
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Student Registration</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Please fill in the student profile information accurately to proceed.</p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Personal Information */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 shadow-sm border border-primary/5">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="text-lg font-bold">1. Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold mb-2">Profile Photo</label>
              <div className="group relative flex aspect-square w-full max-w-[200px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors hover:border-primary">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">add_a_photo</span>
                  <p className="mt-2 text-xs font-medium text-slate-500">Upload Student Photo</p>
                </div>
                {/* Image preview could be added here */}
                <input 
                  className="absolute inset-0 cursor-pointer opacity-0" 
                  type="file" 
                  name="profilePhoto"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Full Name</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  placeholder="John Doe" 
                  type="text"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Gender</label>
                <select 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Date of Birth</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Mother's Name</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  type="text"
                  name="motherName"
                  value={formData.motherName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Father's Name</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  type="text"
                  name="fatherName"
                  value={formData.fatherName || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Contact & Address Details */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 shadow-sm border border-primary/5">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h3 className="text-lg font-bold">2. Contact & Address Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Email Address</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="student@example.com" 
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Mobile Number</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="+1 (555) 000-0000" 
                type="tel"
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Address Line 1</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="Street name and number" 
                type="text"
                name="address1"
                value={formData.address1 || ''}
                onChange={handleChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Address Line 2 (Optional)</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="Apartment, suite, unit, etc." 
                type="text"
                name="address2"
                value={formData.address2 || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-3 sm:col-span-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">City</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">State</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Pin Code</label>
                <input 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Emergency Contact */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 shadow-sm border border-primary/5">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="material-symbols-outlined text-primary">contact_emergency</span>
            <h3 className="text-lg font-bold">3. Emergency Contact</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Contact Name</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Relationship</label>
              <select 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship || ''}
                onChange={handleChange}
              >
                <option value="">Select Relationship</option>
                <option value="Parent">Parent</option>
                <option value="Guardian">Guardian</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Phone Number</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Section 4: Educational Background */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 shadow-sm border border-primary/5">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="material-symbols-outlined text-primary">history_edu</span>
            <h3 className="text-lg font-bold">4. Educational Background</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Highest Qualification</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="e.g. High School, Bachelors" 
                type="text"
                name="highestQualification"
                value={formData.highestQualification || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Previous Institution</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="Name of school/college" 
                type="text"
                name="previousInstitution"
                value={formData.previousInstitution || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Year of Passing</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="YYYY" 
                type="number"
                name="passingYear"
                value={formData.passingYear || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Percentage / CGPA</label>
              <input 
                className="w-full rounded-lg border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-12 px-4 transition-all" 
                placeholder="e.g. 85% or 9.2" 
                type="text"
                name="grade"
                value={formData.grade || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            className="flex items-center gap-2 rounded-xl border border-border-light dark:border-border-dark px-6 py-3 font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary" 
            type="button"
            onClick={onCancel}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Cancel
          </button>
          <button 
            className="flex items-center gap-2 rounded-xl bg-primary px-10 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-95" 
            type="button"
            onClick={onNext}
          >
            Save & Continue
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
