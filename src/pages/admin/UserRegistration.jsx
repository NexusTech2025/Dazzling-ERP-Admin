import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Card from '../../components/ui/Card';
import TextInput from '../../components/ui/v2/TextInput';
import PasswordInput from '../../components/ui/v2/PasswordInput';
import SelectInput from '../../components/ui/v2/SelectInput';
import Button from '../../components/ui/v2/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import APIErrorModal from '../../components/ui/APIErrorModal';
import { useRegisterUserMutation } from '../../features/auth/hooks/useAuthQueries';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'guest', label: 'Guest' }
];

// Declare yup schema configuration matching User schema properties and secure constraints
const userSchema = yup.object({
  username: yup.string()
    .trim()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  role: yup.string()
    .required('Role is required')
}).required();

const UserRegistration = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterUserMutation();
  
  // Initialize useForm with yupResolver
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitted, isValid }
  } = useForm({
    resolver: yupResolver(userSchema),
    mode: 'onSubmit',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      role: 'guest'
    }
  });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [confirmMessage, setConfirmMessage] = useState(null);
  
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [tempFormData, setTempFormData] = useState(null);

  // Triggered on successful schema validation check
  const onSubmitForm = (data) => {
    setTempFormData(data);
    setConfirmStatus('idle');
    setConfirmMessage(null);
    setConfirmModalOpen(true);
  };

  const executeRegistration = async () => {
    if (!tempFormData) return;
    setConfirmStatus('processing');
    
    registerMutation.mutate({
      username: tempFormData.username,
      password: tempFormData.password,
      role: tempFormData.role
    }, {
      onSuccess: (res) => {
        if (res.success) {
          setConfirmStatus('success');
          setConfirmMessage(`User account '${tempFormData.username}' was successfully created with role '${tempFormData.role}'.`);
        } else {
          setConfirmStatus('error');
          setConfirmModalOpen(false);
          setApiError(res.error || new Error(res.message || 'API error'));
          setErrorModalOpen(true);
        }
      },
      onError: (err) => {
        setConfirmStatus('error');
        setConfirmModalOpen(false);
        setApiError(err);
        setErrorModalOpen(true);
      }
    });
  };

  const handleConfirmClose = () => {
    const isSuccessful = confirmStatus === 'success';
    setConfirmModalOpen(false);
    setConfirmStatus('idle');
    setConfirmMessage(null);
    
    if (isSuccessful) {
      reset(); // Resets hook-form variables
      setTempFormData(null);
    }
  };

  // Determine if global generic error banner should show
  const hasValidationErrors = isSubmitted && !isValid && Object.keys(errors).length > 0;

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'User Registration' }
  ];

  return (
    <>
      <MainLayout
        body={
          <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6">
            <Breadcrumbs items={breadcrumbItems} />
            
            <Card variant="default">
              <Card.Header border={true}>
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-bold text-text-main dark:text-white">Register New System User</h1>
                  <p className="text-xs text-text-secondary">Create a new user account with role-based access control.</p>
                </div>
              </Card.Header>
              
              <Card.Body>
                {/* Global Generic Error Banner */}
                {hasValidationErrors && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    <strong>Submission Failed:</strong> Please check the highlighted fields below and try again.
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-5">
                  <TextInput
                    {...register('username')}
                    label="Username"
                    required
                    placeholder="Enter unique username"
                    leftIcon="person"
                    disabled={registerMutation.isPending}
                    error={errors.username?.message}
                  />

                  <PasswordInput
                    {...register('password')}
                    label="Password"
                    required
                    placeholder="Enter secure password"
                    disabled={registerMutation.isPending}
                    error={errors.password?.message}
                  />

                  <PasswordInput
                    {...register('confirmPassword')}
                    label="Confirm Password"
                    required
                    placeholder="Confirm password"
                    disabled={registerMutation.isPending}
                    error={errors.confirmPassword?.message}
                  />

                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <SelectInput
                        label="System Role"
                        options={roleOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select security level..."
                        leftIcon="admin_panel_settings"
                        disabled={registerMutation.isPending}
                        error={errors.role?.message}
                      />
                    )}
                  />

                  <div className="flex items-center justify-end gap-3 mt-4 border-t border-border-light dark:border-border-dark pt-5">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/admin/dashboard')}
                      disabled={registerMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      loading={registerMutation.isPending}
                    >
                      Register User
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        }
      />

      {confirmModalOpen && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={handleConfirmClose}
          onConfirm={executeRegistration}
          title="Confirm User Registration"
          message={`Are you sure you want to register user '${tempFormData?.username}' as a '${tempFormData?.role}'?`}
          confirmText="Register"
          cancelText="Cancel"
          status={confirmStatus}
          resultMessage={confirmMessage}
        />
      )}

      {errorModalOpen && (
        <APIErrorModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          title="Registration Failed"
          error={apiError}
        />
      )}
    </>
  );
};

export default UserRegistration;
