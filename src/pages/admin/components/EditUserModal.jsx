import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/v2/Button';
import TextInput from '../../../components/ui/v2/TextInput';
import PasswordInput from '../../../components/ui/v2/PasswordInput';
import SelectInput from '../../../components/ui/v2/SelectInput';

const editUserSchema = yup.object({
  username: yup.string().trim().required('Username is required').min(3, 'Username must be at least 3 characters'),
  role: yup.string().required('Role is required'),
  status: yup.string().required('Status is required'),
  password: yup.string()
    .nullable()
    .transform((curr, orig) => orig === '' ? null : curr)
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter', excludeEmptyString: true })
    .matches(/[0-9]/, { message: 'Password must contain at least one number', excludeEmptyString: true })
    .matches(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character', excludeEmptyString: true })
}).required();

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'guest', label: 'Guest' }
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'locked', label: 'Locked' },
  { value: 'disabled', label: 'Disabled' }
];

export const EditUserModal = ({ isOpen, onClose, onSave, user, isSaving }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitted, isValid }
  } = useForm({
    resolver: yupResolver(editUserSchema),
    mode: 'onSubmit'
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        role: user.role,
        status: user.status,
        password: ''
      });
    }
  }, [user, reset]);

  if (!isOpen) return null;

  const hasValidationErrors = isSubmitted && !isValid && Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <Card variant="default">
          <Card.Header border={true}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-text-main dark:text-white">Edit System User</h2>
                <p className="text-[10px] text-text-secondary">Modify permissions, role access, and reset passwords.</p>
              </div>
              <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-main dark:hover:text-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </Card.Header>
          
          <Card.Body>
            {hasValidationErrors && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                Submission Failed: Please resolve the highlighted fields.
              </div>
            )}

            <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
              <TextInput
                {...register('username')}
                label="Username"
                required
                placeholder="Enter username"
                disabled={isSaving}
                error={errors.username?.message}
              />

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Role"
                    options={roleOptions}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSaving}
                    error={errors.role?.message}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Account Status"
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSaving}
                    error={errors.status?.message}
                  />
                )}
              />

              <PasswordInput
                {...register('password')}
                label="New Password"
                placeholder="Leave blank to keep unchanged"
                disabled={isSaving}
                error={errors.password?.message}
              />

              <div className="flex items-center justify-end gap-2.5 mt-2 border-t border-border-light dark:border-border-dark pt-4">
                <Button type="button" variant="outlined" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" loading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default EditUserModal;
