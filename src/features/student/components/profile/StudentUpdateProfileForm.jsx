import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Breadcrumbs from '../../../../components/ui/Breadcrumbs';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import DateInput from '../../../../components/ui/v2/DateInput';
import Button from '../../../../components/ui/v2/Button';
import Badge from '../../../../components/ui/Badge';

// Static dropdown options (Hoisted outside render cycle for performance)
const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' }
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' }
];

const RELATIONSHIP_OPTIONS = [
  { label: 'Father', value: 'Father' },
  { label: 'Mother', value: 'Mother' },
  { label: 'Guardian', value: 'Guardian' },
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Other', value: 'Other' }
];

const QUALIFICATION_OPTIONS = [
  { label: 'Class 10', value: 'Class 10' },
  { label: 'Class 12', value: 'Class 12' },
  { label: 'Graduation', value: 'Graduation' },
  { label: 'Post Graduation', value: 'Post Graduation' },
  { label: 'Diploma', value: 'Diploma' },
  { label: 'Other', value: 'Other' }
];

const STATE_OPTIONS = [
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Other', value: 'Other' }
];

const COUNTRY_OPTIONS = [
  { label: 'India', value: 'India' },
  { label: 'Other', value: 'Other' }
];

const SCORE_TYPE_OPTIONS = [
  { label: 'Percentage (%)', value: 'pct' },
  { label: 'CGPA (Scale 10)', value: 'cgpa' }
];

/**
 * Normalizes raw education score strings for display inside form inputs.
 * Converts decimal fractions (0.926 -> 92.6%) and appends % for percentage scores.
 */
export function formatScoreForForm(rawScore, scoreType = 'pct') {
  if (rawScore === null || rawScore === undefined || rawScore === '') return '';
  const str = String(rawScore).trim();
  if (scoreType === 'pct') {
    const cleanNum = parseFloat(str.replace('%', ''));
    if (!isNaN(cleanNum)) {
      if (cleanNum > 0 && cleanNum <= 1 && !str.includes('%')) {
        const pctVal = Number((cleanNum * 100).toFixed(2));
        return `${pctVal}%`;
      }
      return str.endsWith('%') ? str : `${cleanNum}%`;
    }
  }
  return str;
}

/**
 * Serializes form score value into the backend payload envelope.
 * Guarantees trailing '%' suffix if score_type === 'pct'.
 */
export function formatScoreForPayload(formScore, scoreType = 'pct') {
  if (formScore === null || formScore === undefined || formScore === '') return '';
  const str = String(formScore).trim();
  if (scoreType === 'pct') {
    const cleanNum = parseFloat(str.replace('%', ''));
    if (!isNaN(cleanNum)) {
      return `${cleanNum}%`;
    }
  }
  return str;
}

// Yup Schema Definition
const studentProfileSchema = yup.object({
  profile: yup.object({
    student_name: yup.string().trim().required('Student Name is required.'),
    gender: yup.string().required('Gender is required.'),
    dob: yup.string().required('Date of Birth is required.'),
    status: yup.string().default('active'),
    father_name: yup.string().nullable(),
    mother_name: yup.string().nullable(),
    email: yup.string().email('Enter a valid email address').nullable().transform((v, o) => o === '' ? null : v),
    phone: yup.string().nullable(),
    notes: yup.string().max(250, 'Notes cannot exceed 250 characters.').nullable()
  }),
  contact: yup.object({
    email: yup.string().email('Enter a valid email address').nullable().transform((v, o) => o === '' ? null : v),
    emergency_name: yup.string().trim().required('Emergency Contact Name is required.'),
    emergency_relationship: yup.string().required('Relationship is required.'),
    emergency_phone: yup.string().trim().required('Emergency Phone is required.')
  }),
  address: yup.object({
    line1: yup.string().trim().required('Address Line 1 is required.'),
    line2: yup.string().nullable(),
    city: yup.string().trim().required('City is required.'),
    state: yup.string().required('State is required.'),
    pin_code: yup.string().trim().required('PIN Code is required.'),
    country: yup.string().default('India')
  }),
  education: yup.array().of(
    yup.object({
      education_id: yup.string().optional(),
      highest_qualification: yup.string().required('Qualification is required.'),
      institution_name: yup.string().trim().required('Institution Name is required.'),
      year_of_passing: yup.mixed().required('Passing Year is required.'),
      score_type: yup.string().default('pct'),
      percentage_or_cgpa: yup.string().trim().required('Score is required.')
        .test('valid-score-format', 'Score must be a valid number or percentage.', function (val) {
          if (!val) return false;
          const num = parseFloat(val.replace('%', ''));
          return !isNaN(num);
        })
    })
  )
}).required();

/**
 * Transforms form values into student_update_profile backend RPC payload envelope.
 */
export function buildUpdateProfilePayload(studentId, rawData) {
  return {
    student_id: studentId,
    profile: {
      student_name: rawData.profile?.student_name?.trim() || '',
      gender: rawData.profile?.gender || 'Male',
      dob: rawData.profile?.dob || '',
      status: rawData.profile?.status || 'active',
      father_name: rawData.profile?.father_name?.trim() || null,
      mother_name: rawData.profile?.mother_name?.trim() || null,
      email: rawData.profile?.email?.trim() || null,
      phone: rawData.profile?.phone?.trim() || null,
      notes: rawData.profile?.notes?.trim() || null
    },
    contact: {
      mobile_number: rawData.profile?.phone?.trim() || rawData.contact?.emergency_phone?.trim() || null,
      email: rawData.contact?.email?.trim() || rawData.profile?.email?.trim() || null,
      emergency_name: rawData.contact?.emergency_name?.trim() || '',
      emergency_relationship: rawData.contact?.emergency_relationship || 'Father',
      emergency_phone: rawData.contact?.emergency_phone?.trim() || ''
    },
    address: {
      line1: rawData.address?.line1?.trim() || '',
      line2: rawData.address?.line2?.trim() || null,
      city: rawData.address?.city?.trim() || '',
      state: rawData.address?.state || 'Rajasthan',
      pin_code: rawData.address?.pin_code?.trim() || '',
      country: rawData.address?.country || 'India'
    },
    education: Array.isArray(rawData.education)
      ? rawData.education.map(edu => ({
        ...(edu.education_id ? { education_id: edu.education_id } : {}),
        highest_qualification: edu.highest_qualification?.trim() || '',
        institution_name: edu.institution_name?.trim() || '',
        year_of_passing: Number(edu.year_of_passing) || new Date().getFullYear(),
        percentage_or_cgpa: formatScoreForPayload(edu.percentage_or_cgpa, edu.score_type),
        meta: {
          score_type: edu.score_type || 'pct'
        }
      }))
      : []
  };
}

export default function StudentUpdateProfileForm({
  student,
  profileData,
  onClose,
  onSave,
  isSubmitting = false
}) {
  const [sections, setSections] = useState({
    details: true,
    contact: true,
    address: true,
    education: true
  });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'home' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Edit Student Profile' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted, isValid }
  } = useForm({
    resolver: yupResolver(studentProfileSchema),
    mode: 'onSubmit',
    defaultValues: {
      profile: {
        student_name: '',
        gender: 'Male',
        dob: '',
        status: 'active',
        father_name: '',
        mother_name: '',
        email: '',
        phone: '',
        notes: ''
      },
      contact: {
        email: '',
        emergency_name: '',
        emergency_relationship: 'Father',
        emergency_phone: ''
      },
      address: {
        line1: '',
        line2: '',
        city: '',
        state: 'Rajasthan',
        pin_code: '',
        country: 'India'
      },
      education: []
    }
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education'
  });

  // Populate form state when student & profileData props settle
  useEffect(() => {
    if (student) {
      const address = profileData?.address || student.address || {};
      const contact = profileData?.contact || student.contact || {};
      const education = profileData?.education || student.education || [];

      reset({
        profile: {
          student_name: student.student_name || '',
          gender: student.gender || 'Male',
          dob: student.dob ? String(student.dob).split('T')[0] : '',
          status: student.status || 'active',
          father_name: student.father_name || '',
          mother_name: student.mother_name || '',
          email: student.email || '',
          phone: student.phone || '',
          notes: student.notes || ''
        },
        contact: {
          email: contact.email || student.email || '',
          emergency_name: contact.emergency_name || student.father_name || '',
          emergency_relationship: contact.emergency_relationship || 'Father',
          emergency_phone: contact.emergency_phone || ''
        },
        address: {
          line1: address.line1 || address.address_line_1 || '',
          line2: address.line2 || address.address_line_2 || '',
          city: address.city || '',
          state: address.state || 'Rajasthan',
          pin_code: address.pin_code || address.pincode || '',
          country: address.country || 'India'
        },
        education: education.length > 0
          ? education.map(item => {
            const scoreType = item.meta?.score_type || 'pct';
            return {
              education_id: item.education_id,
              highest_qualification: item.highest_qualification || '',
              institution_name: item.institution_name || '',
              year_of_passing: item.year_of_passing || new Date().getFullYear(),
              score_type: scoreType,
              percentage_or_cgpa: formatScoreForForm(item.percentage_or_cgpa, scoreType)
            };
          })
          : [
            {
              highest_qualification: '',
              institution_name: '',
              year_of_passing: new Date().getFullYear(),
              score_type: 'pct',
              percentage_or_cgpa: ''
            }
          ]
      });
    }
  }, [student, profileData, reset]);

  if (!student) return null;

  const onFormSubmit = (data) => {
    const payload = buildUpdateProfilePayload(student.student_id, data);
    onSave(payload);
  };

  const hasGlobalErrors = isSubmitted && !isValid && Object.keys(errors).length > 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">

        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-text-main dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-28px">person_edit</span>
              Update Student Profile
            </h2>
            <p className="text-xs text-text-secondary font-medium mt-0.5">Edit credentials, contact, address, and educational qualifications</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onFormSubmit)}
              loading={isSubmitting}
              startIcon={<span className="material-symbols-outlined">save</span>}
              className="shadow-lg shadow-primary/20"
            >
              Save Student
            </Button>
          </div>
        </div>

        {/* Global Validation Error Banner */}
        {hasGlobalErrors && (
          <div className="mx-6 mt-4 p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
            <span className="material-symbols-outlined text-base">error</span>
            <span>Submission Failed: Please review the highlighted fields below and try again.</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6  space-y-6 flex-1">

          {/* 1. Student Details Section */}
          <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark overflow-visible shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('details')}
              className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/40 border-b border-border-light dark:border-border-dark flex items-center justify-between font-bold text-text-main dark:text-white transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/80 rounded-t-xl"
            >
              <span className="flex items-center gap-2 text-base">
                <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                Student Details
              </span>
              <span className="material-symbols-outlined text-text-secondary transition-transform duration-200" style={{ transform: sections.details ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                expand_less
              </span>
            </button>

            {sections.details && (
              <div className="p-5 space-y-5 overflow-visible">
                {/* Row 1: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField name="profile.student_name" label="Student Name" required error={errors.profile?.student_name?.message}>
                    <Controller
                      name="profile.student_name"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">person</span>}
                          placeholder="John Doe"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="profile.gender" label="Gender" required error={errors.profile?.gender?.message}>
                    <Controller
                      name="profile.gender"
                      control={control}
                      render={({ field }) => (
                        <SelectInput
                          options={GENDER_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select gender"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="profile.dob" label="Date of Birth" required error={errors.profile?.dob?.message}>
                    <Controller
                      name="profile.dob"
                      control={control}
                      render={({ field }) => (
                        <DateInput
                          {...field}
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="profile.status" label="Status" error={errors.profile?.status?.message}>
                    <Controller
                      name="profile.status"
                      control={control}
                      render={({ field }) => (
                        <SelectInput
                          options={STATUS_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select status"
                        />
                      )}
                    />
                  </FormField>
                </div>

                {/* Row 2: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField name="profile.father_name" label="Father's Name" error={errors.profile?.father_name?.message}>
                    <Controller
                      name="profile.father_name"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">person</span>}
                          placeholder="Robert Doe"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="profile.mother_name" label="Mother's Name" error={errors.profile?.mother_name?.message}>
                    <Controller
                      name="profile.mother_name"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">person</span>}
                          placeholder="Sarah M. Doe"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="profile.email" label="Email" error={errors.profile?.email?.message}>
                    <Controller
                      name="profile.email"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          type="email"
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">mail</span>}
                          placeholder="john.doe@example.com"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="profile.phone" label="Phone" error={errors.profile?.phone?.message}>
                    <Controller
                      name="profile.phone"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">call</span>}
                          placeholder="+91 98290 12345"
                        />
                      )}
                    />
                  </FormField>
                </div>

                {/* Row 3: Avatar & Notes (2 Columns Span) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField name="profile.avatar" label="Student Avatar (Optional)">
                    <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                      <span className="material-symbols-outlined text-primary text-3xl mb-1">cloud_upload</span>
                      <p className="text-xs font-bold text-text-main dark:text-white">Click to upload or drag & drop</p>
                      <p className="text-[11px] text-text-secondary">JPG, PNG up to 2MB</p>
                    </div>
                  </FormField>

                  <FormField name="profile.notes" label="Notes (Optional)" error={errors.profile?.notes?.message}>
                    <Controller
                      name="profile.notes"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <textarea
                            {...field}
                            rows={3}
                            maxLength={250}
                            placeholder="Add any additional notes about the student..."
                            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-text-main dark:text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                          />
                          <span className="absolute bottom-2 right-3 text-[10px] text-text-secondary font-mono">
                            {(field.value || '').length} / 250
                          </span>
                        </div>
                      )}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* 2. Contact Information Section */}
          <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark overflow-visible shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/40 border-b border-border-light dark:border-border-dark flex items-center justify-between font-bold text-text-main dark:text-white transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/80 rounded-t-xl"
            >
              <span className="flex items-center gap-2 text-base">
                <span className="material-symbols-outlined text-primary text-xl">call</span>
                Contact Information
              </span>
              <span className="material-symbols-outlined text-text-secondary transition-transform duration-200" style={{ transform: sections.contact ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                expand_less
              </span>
            </button>

            {sections.contact && (
              <div className="p-5 overflow-visible">
                {/* 4-Column Single Row: Email, Emergency Name, Relationship, Emergency Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField name="contact.email" label="Email" error={errors.contact?.email?.message}>
                    <Controller
                      name="contact.email"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          type="email"
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">mail</span>}
                          placeholder="john.doe@example.com"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="contact.emergency_name" label="Emergency Contact Name" required error={errors.contact?.emergency_name?.message}>
                    <Controller
                      name="contact.emergency_name"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">person</span>}
                          placeholder="Robert Senior Doe"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="contact.emergency_relationship" label="Relationship" required error={errors.contact?.emergency_relationship?.message}>
                    <Controller
                      name="contact.emergency_relationship"
                      control={control}
                      render={({ field }) => (
                        <SelectInput
                          options={RELATIONSHIP_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select relationship"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="contact.emergency_phone" label="Emergency Phone" required error={errors.contact?.emergency_phone?.message}>
                    <Controller
                      name="contact.emergency_phone"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">call</span>}
                          placeholder="+91 98290 54321"
                        />
                      )}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* 3. Address Section */}
          <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark overflow-visible shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('address')}
              className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/40 border-b border-border-light dark:border-border-dark flex items-center justify-between font-bold text-text-main dark:text-white transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/80 rounded-t-xl"
            >
              <span className="flex items-center gap-2 text-base">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                Address
              </span>
              <span className="material-symbols-outlined text-text-secondary transition-transform duration-200" style={{ transform: sections.address ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                expand_less
              </span>
            </button>

            {sections.address && (
              <div className="p-5 space-y-4">
                {/* Row 1: 2 Columns Span for Address Lines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField name="address.line1" label="Address Line 1" required error={errors.address?.line1?.message}>
                    <Controller
                      name="address.line1"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">home</span>}
                          placeholder="12 Park Street, Civil Lines"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="address.line2" label="Address Line 2 (Optional)" error={errors.address?.line2?.message}>
                    <Controller
                      name="address.line2"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          placeholder="Near Central Park"
                        />
                      )}
                    />
                  </FormField>
                </div>

                {/* Row 2: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField name="address.city" label="City" required error={errors.address?.city?.message}>
                    <Controller
                      name="address.city"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">location_city</span>}
                          placeholder="Jaipur"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="address.state" label="State" required error={errors.address?.state?.message}>
                    <Controller
                      name="address.state"
                      control={control}
                      render={({ field }) => (
                        <SelectInput
                          options={STATE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select state"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="address.pin_code" label="PIN Code" required error={errors.address?.pin_code?.message}>
                    <Controller
                      name="address.pin_code"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">tag</span>}
                          placeholder="302001"
                        />
                      )}
                    />
                  </FormField>

                  <FormField name="address.country" label="Country" error={errors.address?.country?.message}>
                    <Controller
                      name="address.country"
                      control={control}
                      render={({ field }) => (
                        <SelectInput
                          options={COUNTRY_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select country"
                        />
                      )}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* 4. Educational Qualifications Section */}
          <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark overflow-visible shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/40 border-b border-border-light dark:border-border-dark flex items-center justify-between rounded-t-xl">
              <button
                type="button"
                onClick={() => toggleSection('education')}
                className="flex items-center gap-2 font-bold text-text-main dark:text-white text-base"
              >
                <span className="material-symbols-outlined text-primary text-xl">school</span>
                Educational Qualifications
                <span className="material-symbols-outlined text-text-secondary transition-transform duration-200" style={{ transform: sections.education ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                  expand_less
                </span>
              </button>

              <Button
                type="button"
                variant="outlined"
                onClick={() => appendEdu({ highest_qualification: '', institution_name: '', year_of_passing: new Date().getFullYear(), percentage_or_cgpa: '' })}
                startIcon={<span className="material-symbols-outlined">add</span>}
                className="text-xs h-8 px-3"
              >
                Add Qualification
              </Button>
            </div>

            {sections.education && (
              <div className="p-5 space-y-4 overflow-visible">
                {eduFields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-slate-50/40 dark:bg-slate-800/30 space-y-3 relative group overflow-visible"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-border-light dark:border-border-dark/60">
                      <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
                        Qualification #{index + 1}
                      </span>
                      {eduFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEdu(index)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors flex items-center justify-center"
                          title="Remove Qualification"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <FormField name={`education.${index}.highest_qualification`} label="Highest Qualification" required error={errors.education?.[index]?.highest_qualification?.message}>
                        <Controller
                          name={`education.${index}.highest_qualification`}
                          control={control}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">workspace_premium</span>}
                              placeholder="Class 10 / B.Tech / MCA"
                            />
                          )}
                        />
                      </FormField>

                      <FormField name={`education.${index}.institution_name`} label="Institution Name" required error={errors.education?.[index]?.institution_name?.message}>
                        <Controller
                          name={`education.${index}.institution_name`}
                          control={control}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">school</span>}
                              placeholder="St. Xavier Senior Secondary School"
                            />
                          )}
                        />
                      </FormField>

                      <FormField name={`education.${index}.year_of_passing`} label="Year of Passing" required error={errors.education?.[index]?.year_of_passing?.message}>
                        <Controller
                          name={`education.${index}.year_of_passing`}
                          control={control}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              type="number"
                              startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">calendar_today</span>}
                              placeholder="2024"
                            />
                          )}
                        />
                      </FormField>

                      <FormField name={`education.${index}.score_type`} label="Score Type" error={errors.education?.[index]?.score_type?.message}>
                        <Controller
                          name={`education.${index}.score_type`}
                          control={control}
                          render={({ field }) => (
                            <SelectInput
                              options={SCORE_TYPE_OPTIONS}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Score Type"
                            />
                          )}
                        />
                      </FormField>

                      <FormField name={`education.${index}.percentage_or_cgpa`} label="Score / Result" required error={errors.education?.[index]?.percentage_or_cgpa?.message}>
                        <Controller
                          name={`education.${index}.percentage_or_cgpa`}
                          control={control}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              startIcon={<span className="material-symbols-outlined text-text-secondary text-lg">percent</span>}
                              placeholder="95.5 or 8.5"
                            />
                          )}
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary">Student ID:</span>
            <span className="text-sm font-black text-text-main dark:text-white font-mono">{student.student_id}</span>
            <Badge variant="info">Auto Generated</Badge>
            <span className="hidden md:inline text-[11px] text-text-secondary ml-1">
              Will be updated after saving record
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onFormSubmit)}
              loading={isSubmitting}
              startIcon={<span className="material-symbols-outlined">save</span>}
              className="w-full sm:w-auto shadow-lg shadow-primary/20"
            >
              Save Student
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

StudentUpdateProfileForm.propTypes = {
  student: PropTypes.object,
  profileData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};
