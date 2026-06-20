import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterStudentMutation } from '../hooks/useStudentQueries';
import APIErrorModal from '../../../components/ui/APIErrorModal';
import MainLayout from '../../../components/layout/MainLayout';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import Button from '../../../components/ui/v2/Button';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { profileSchema, enrollmentSchema, activationSchema } from './utils/schemas';
import { handleAPIError } from './utils/apiErrorHandler';

// Child components & Steps
import ProgressStepper from './components/ProgressStepper';
import ProfileStep from './steps/ProfileStep';
import AcademicEnrollmentStep from './steps/AcademicEnrollmentStep';
import ActivationStep from './steps/ActivationStep';

const StudentRegistrationWizard = ({ initialData, modeToggle, crumbs }) => {
  const navigate = useNavigate();
  const registerMutation = useRegisterStudentMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', error: null });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Lifted payment activation states from Step 3
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  const methods = useForm({
    defaultValues: {
      fullName: initialData?.fullName || '',
      gender: 'Male',
      dob: '',
      motherName: '',
      fatherName: '',
      email: initialData?.email || '',
      mobile: initialData?.mobile || '',
      address1: '',
      address2: '',
      city: 'Jagatpura',
      state: 'Rajasthan',
      pincode: '302017',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      highestQualification: '',
      previousInstitution: '',
      passingYear: '',
      grade: '',
      profilePhoto: null,
      programType: 'academic',
      admissionType: 'direct',
      couponCode: '',
      referralId: initialData?.referral || '',
      entranceScore: '',
      applicableScholarship: 0,
      batchId: initialData?.batchId || '',
      batchName: initialData?.batchName || '',
      courseId: initialData?.courseId || '',
      courseName: initialData?.courseName || '',
      enrollmentBasket: [],
      selectedBatches: {},
      installments: [],
      isManualPlan: false,
      discountVal: 0,
      discountReason: '',
      baseFee: 0,
      registrationFee: 0,
      finalFee: 0,
      initialPaymentAmount: '',
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionRef: '',
      immediatePayment: true
    },
    resolver: useCallback((values, context, options) => {
      if (currentStep === 1) {
        return yupResolver(profileSchema)(values, context, options);
      } else if (currentStep === 2) {
        return yupResolver(enrollmentSchema)(values, context, options);
      } else {
        return yupResolver(activationSchema)(values, context, options);
      }
    }, [currentStep]),
    mode: 'onChange'
  });

  const { trigger, formState: { errors }, watch, setValue, getValues, setError } = methods;
  
  const formData = watch();
  const immediatePayment = watch('immediatePayment');
  
  const setImmediatePayment = useCallback((val) => {
    setValue('immediatePayment', val, { shouldValidate: true });
  }, [setValue]);

  const setFormData = useCallback((updater) => {
    const current = getValues();
    const next = typeof updater === 'function' ? updater(current) : updater;
    Object.keys(next).forEach(key => {
      if (next[key] !== current[key]) {
        setValue(key, next[key], { shouldValidate: true });
      }
    });
  }, [getValues, setValue]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleNextClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      nextStep();
    }
  };

  const handleFinish = async (overrides = {}) => {
    const finalPayment = { ...formData, ...overrides };

    // 1. Build profile block
    const profile = {
      student_name: formData.fullName.trim(),
      email: formData.email.trim() || null,
      phone: formData.mobile.replace(/\D/g, '') || null,
      gender: formData.gender || 'Male',
      dob: formData.dob || null,
      mother_name: formData.motherName?.trim() || null,
      father_name: formData.fatherName?.trim() || null,
      avatarUrl: formData.profilePhoto ? (formData.profilePhoto instanceof File ? URL.createObjectURL(formData.profilePhoto) : formData.profilePhoto) : null,
      status: 'active'
    };

    // 2. Build address block
    const address = {
      line1: formData.address1?.trim() || '',
      line2: formData.address2?.trim() || null,
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      pin_code: formData.pincode?.trim() || '',
      country: 'India'
    };

    // 3. Build contact block
    const contact = {
      email: formData.email.trim() || null,
      mobile_number: formData.mobile.replace(/\D/g, '') || null,
      emergency_name: formData.emergencyContactName?.trim() || null,
      emergency_phone: formData.emergencyContactPhone?.replace(/\D/g, '') || null,
      emergency_relationship: formData.emergencyContactRelationship || null
    };

    // 4. Build education array
    const education = [
      {
        highest_qualification: formData.highestQualification || null,
        institution_name: formData.previousInstitution || null,
        year_of_passing: formData.passingYear ? Number(formData.passingYear) : null,
        percentage_or_cgpa: formData.grade || null
      }
    ];

    // 5. Build enrollments array
    const enrollments = (formData.enrollmentBasket || []).map(item => {
      const baseEnrollment = {
        enrollment_type: item.type, // 'package', 'course', 'subject'
        item_id: item.id || item.package_id || item.course_id,
        fee: item.fee,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        academic_status: 'active'
      };

      if (item.type === 'package') {
        baseEnrollment.package_batches = (item.courses || []).map(c => ({
          course_id: c.id || c.course_id,
          batch_id: formData.selectedBatches?.[c.id || c.course_id] || ''
        }));
      } else {
        baseEnrollment.batch_id = formData.selectedBatches?.[item.id || item.course_id] || '';
      }

      return baseEnrollment;
    });

    // 6. Build feeAccount block
    const amountPaid = finalPayment.paymentMethod === 'none' ? 0 : (Number(finalPayment.initialPaymentAmount) || 0);

    const feeAccount = {
      total_fee: formData.baseFee,
      discount: formData.discountVal || 0,
      adjustment_type: formData.discountReason ? 'manual_override' : 'none',
      coupon_code: formData.discountReason || null,
      final_fee: formData.finalFee,
      amount_paid: amountPaid,
      balance_due: Math.max(0, formData.finalFee - amountPaid),
      is_overdue: false,
      penalty_amount: 0,
      next_due_date: formData.installments?.[0]?.dueDate || new Date().toISOString().split('T')[0],
      status: 'active',
      remarks: 'Registered via student registration wizard',
      created_by: 'admin',
      fee_plan_id: `FPL-${formData.enrollmentBasket?.[0]?.id || 'GEN'}-DEFAULT`,
      installments: (formData.installments || []).map((inst, index) => {
        let instStatus = 'pending';
        let paidAmt = 0;
        if (amountPaid > 0 && index === 0) {
          if (amountPaid >= inst.amount) {
            instStatus = 'paid';
            paidAmt = inst.amount;
          } else {
            instStatus = 'partially_paid';
            paidAmt = amountPaid;
          }
        }
        return {
          installment_number: index + 1,
          due_amount: inst.amount,
          paid_amount: paidAmt,
          late_fee_amount: 0,
          due_date: inst.dueDate,
          status: instStatus
        };
      })
    };

    // 7. Build payment block
    let payment = null;
    if (amountPaid > 0) {
      payment = {
        amount_paid: amountPaid,
        payment_date: new Date(finalPayment.paymentDate || new Date()).toISOString(),
        payment_method: finalPayment.paymentMethod,
        transaction_reference: finalPayment.transactionRef || 'CASH',
        status: 'success',
        remarks: 'Initial deposit payment during registration',
        created_by: 'admin'
      };
    }

    const payload = {
      profile,
      address,
      contact,
      education,
      enrollments,
      feeAccount,
      ...(payment ? { payment } : {})
    };

    console.log('[Wizard] Submitting Request payload:', payload);

    registerMutation.mutate(payload, {
      onSuccess: (response) => {
        console.log('[Wizard] API Response:', response);
        if (response.success) {
          setShowSuccessModal(true);
        } else {
          console.error('[Mutation] API Correlation ID:', response.meta?.correlation_id || 'NONE');
          handleAPIError(response, setError, setErrorModal, setCurrentStep);
        }
      },
      onError: (error) => {
        console.error('[Wizard] API Error:', error);
        handleAPIError(
          {
            success: false,
            error: {
              code: 'DEFAULT',
              message: error.message || 'An error occurred during registration. Please check your connection.',
              details: error.stack
            }
          },
          setError,
          setErrorModal,
          setCurrentStep
        );
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileStep formData={formData} setFormData={setFormData} onNext={handleNextClick} onCancel={() => navigate('/admin/students')} errors={errors} />;
      case 2:
        return <AcademicEnrollmentStep formData={formData} setFormData={setFormData} onNext={handleNextClick} onBack={prevStep} errors={errors} />;
      case 3:
        return (
          <ActivationStep 
            formData={formData} 
            setFormData={setFormData} 
            onFinish={handleFinish} 
            onBack={prevStep} 
            isPending={registerMutation.isPending}
            immediatePayment={immediatePayment}
            setImmediatePayment={setImmediatePayment}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const handleStepCompleteClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (!immediatePayment) {
        // Deferred Payment Overrides
        handleFinish({
          initialPaymentAmount: 0,
          paymentMethod: 'none',
          transactionRef: 'DEFERRED'
        });
      } else {
        handleFinish();
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <MainLayout
        onBodyScroll={handleBodyScroll}
        header={
          <div
            className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
              isSticky
                ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg font-black">person_add</span>
                <span className="text-sm font-bold text-text-main dark:text-white">
                  Add New Student
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Wizard Mode
                </span>
              </div>
            </div>
          </div>
        }
        body={
          <div className="pt-6 lg:pt-10 pb-6 space-y-6">
            {crumbs && <Breadcrumbs items={crumbs} className="mb-2" />}
            {modeToggle}

            <ProgressStepper 
              currentStep={currentStep} 
              totalSteps={3} 
              steps={['Profile', 'Enrollment & Fees', 'Activation']} 
              variant="glass-indicator" 
            />

            <div className="pb-6">
              {renderStep()}
            </div>
          </div>
        }
        footer={
          <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-lg w-full sticky bottom-0">
            <div className="flex items-center justify-start w-1/2 md:w-auto">
              {currentStep === 1 ? (
                <Button 
                  type="button" 
                  variant="outlined"
                  size="md"
                  className="!rounded-md"
                  onClick={() => navigate('/admin/students')}
                >
                  Cancel
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outlined"
                  size="md"
                  className="!rounded-md"
                  onClick={prevStep}
                  startIcon="arrow_back"
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex justify-end w-1/2 md:w-auto ml-auto">
              {currentStep < 3 ? (
                <Button 
                  type="button" 
                  variant="contained"
                  size="md"
                  className="!rounded-md"
                  onClick={handleNextClick}
                  endIcon="arrow_forward"
                >
                  Save & Continue
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="contained"
                  size="md"
                  className="!rounded-md"
                  disabled={registerMutation.isPending}
                  onClick={handleStepCompleteClick}
                  loading={registerMutation.isPending}
                  startIcon="task_alt"
                >
                  Complete & Activate
                </Button>
              )}
            </div>
          </footer>
        }
      />
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              {/* Success Icon */}
              <div className="mx-auto size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
                <span className="material-symbols-outlined text-4xl font-black">task_alt</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight">Registration Successful</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  The student account has been created and activated in the database successfully.
                </p>
              </div>

              {/* Student ID Badge */}
              {registerMutation.data?.data?.student_id && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">System Assigned ID</span>
                  <span className="text-base font-mono font-black text-emerald-400">
                    {registerMutation.data.data.student_id}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="button"
                  variant="contained"
                  size="md"
                  className="w-full !rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/admin/students');
                  }}
                >
                  Go to Student List
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable API Error Modal */}
      <APIErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', error: null })}
        title={errorModal.title}
        error={errorModal.error}
      />
    </FormProvider>
  );
};

export default StudentRegistrationWizard;
