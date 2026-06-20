import React from 'react';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import PhoneInput from '../../../../components/ui/v2/PhoneInput';
import DateInput from '../../../../components/ui/v2/DateInput';

const ProfileStep = ({ formData, setFormData, onNext, onCancel, errors = {} }) => {
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
    <div className="grid grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full text-slate-700 dark:text-slate-200">
      <div className="col-span-12 mb-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Student Registration</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please fill in the student profile information accurately to proceed.</p>
      </div>

      {/* Left Column: Personal and Contact Info (7/12) */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        {/* Section 1: Personal Information */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Personal Information</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Profile Photo Uploader */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1 self-start">Profile Photo</span>
              <div className="group relative flex aspect-square w-32 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors hover:border-primary cursor-pointer">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">add_a_photo</span>
                  <p className="mt-1 text-[10px] font-medium text-slate-500">Upload Photo</p>
                </div>
                <input 
                  className="absolute inset-0 cursor-pointer opacity-0" 
                  type="file" 
                  name="profilePhoto"
                  onChange={handleChange}
                />
              </div>
              <span className="text-[9px] text-text-secondary/60">JPG, PNG (Max 2MB)</span>
            </div>

            {/* Core Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="sm:col-span-2">
                <TextInput
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  error={errors.fullName?.message}
                />
              </div>
              
              <SelectInput
                label="Gender *"
                value={formData.gender || ''}
                onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
                placeholder="Select Gender"
                error={errors.gender?.message}
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={formData.dob || ''}
                onChange={handleChange}
                required
                error={errors.dob?.message}
              />

              <TextInput
                label="Father's Name"
                name="fatherName"
                value={formData.fatherName || ''}
                onChange={handleChange}
                placeholder="Father's Name"
              />

              <TextInput
                label="Mother's Name"
                name="motherName"
                value={formData.motherName || ''}
                onChange={handleChange}
                placeholder="Mother's Name"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Contact & Address Details */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Contact & Address Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="student@example.com"
              leftIcon="mail"
              error={errors.email?.message}
            />

            <PhoneInput
              label="Mobile Number"
              name="mobile"
              value={formData.mobile || ''}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
              error={errors.mobile?.message}
            />

            <div className="sm:col-span-2">
              <TextInput
                label="Address Line 1"
                name="address1"
                value={formData.address1 || ''}
                onChange={handleChange}
                placeholder="Street name and number"
                error={errors.address1?.message}
              />
            </div>

            <div className="sm:col-span-2">
              <TextInput
                label="Address Line 2 (Optional)"
                name="address2"
                value={formData.address2 || ''}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, etc."
              />
            </div>

            <TextInput
              label="City"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              placeholder="City"
              error={errors.city?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="State"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                placeholder="State"
                error={errors.state?.message}
              />
              <TextInput
                label="Pin Code"
                name="pincode"
                value={formData.pincode || ''}
                onChange={handleChange}
                placeholder="Pin Code"
                error={errors.pincode?.message}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Emergency and Educational background (5/12) */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        {/* Section 3: Emergency Contact */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="material-symbols-outlined text-primary">contact_emergency</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Emergency Contact</h3>
          </div>

          <div className="space-y-4">
            <TextInput
              label="Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName || ''}
              onChange={handleChange}
              placeholder="Contact Person Name"
              error={errors.emergencyContactName?.message}
            />

            <SelectInput
              label="Relationship"
              value={formData.emergencyContactRelationship || ''}
              onChange={(val) => setFormData(prev => ({ ...prev, emergencyContactRelationship: val }))}
              options={[
                { value: 'Parent', label: 'Parent' },
                { value: 'Guardian', label: 'Guardian' },
                { value: 'Sibling', label: 'Sibling' }
              ]}
              placeholder="Select Relationship"
              error={errors.emergencyContactRelationship?.message}
            />

            <PhoneInput
              label="Phone Number"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone || ''}
              onChange={handleChange}
              placeholder="Phone Number"
              error={errors.emergencyContactPhone?.message}
            />
          </div>
        </section>

        {/* Section 4: Educational Background */}
        <section className="rounded-2xl bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="material-symbols-outlined text-primary">history_edu</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Educational Background</h3>
          </div>

          <div className="space-y-4">
            <TextInput
              label="Highest Qualification"
              name="highestQualification"
              value={formData.highestQualification || ''}
              onChange={handleChange}
              placeholder="e.g. High School, Bachelors"
            />

            <TextInput
              label="Previous Institution"
              name="previousInstitution"
              value={formData.previousInstitution || ''}
              onChange={handleChange}
              placeholder="Name of school/college"
            />

            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Year of Passing"
                name="passingYear"
                type="number"
                value={formData.passingYear || ''}
                onChange={handleChange}
                placeholder="YYYY"
              />
              <TextInput
                label="Percentage / CGPA"
                name="grade"
                value={formData.grade || ''}
                onChange={handleChange}
                placeholder="e.g. 85% or 9.2"
              />
            </div>
          </div>
        </section>


      </div>
    </div>
  );
};

export default ProfileStep;
