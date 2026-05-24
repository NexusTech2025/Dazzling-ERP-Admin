import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterStudentMutation } from '../hooks/useStudentQueries';

// Steps
import ProfileStep from './steps/ProfileStep';
import AcademicEnrollmentStep from './steps/AcademicEnrollmentStep';
import FinanceStep from './steps/FinanceStep';
import ActivationStep from './steps/ActivationStep';

const StudentRegistrationWizard = ({ initialData }) => {
  const navigate = useNavigate();
  const registerMutation = useRegisterStudentMutation();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1: Profile
    fullName: initialData?.fullName || '',
    gender: '',
    date_of_birth: '',
    motherName: '',
    fatherName: '',
    email: initialData?.email || '',
    mobile: initialData?.mobile || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    highestQualification: '',
    previousInstitution: '',
    passingYear: '',
    grade: '',
    profilePhoto: null,

    // Step 2: Academic Enrollment (Merged Program + Batch)
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

    // Step 3: Finance
    // ... no changes needed to structure

    // Step 4: Activation/Payment
    initialPaymentAmount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    registerMutation.mutate(formData, {
      onSuccess: (response) => {
        if (response.success) {
          alert('Student Registered Successfully!');
          navigate('/admin/students');
        } else {
          alert(response.message || 'Registration failed');
        }
      },
      onError: (error) => {
        alert(error.message || 'An error occurred during registration');
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileStep formData={formData} setFormData={setFormData} onNext={nextStep} onCancel={() => navigate('/admin/students')} />;
      case 2:
        return <AcademicEnrollmentStep formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <FinanceStep formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <ActivationStep formData={formData} setFormData={setFormData} onFinish={handleFinish} onBack={prevStep} isPending={registerMutation.isPending} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Progress Stepper */}
      <div className="mb-10 w-full rounded-2xl bg-white dark:bg-slate-900/50 p-6 shadow-sm border border-primary/5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Step {currentStep} of 4</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{(currentStep / 4 * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(currentStep / 4 * 100)}%` }}
          ></div>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {['Profile', 'Academic', 'Finance', 'Activate'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep >= stepNum;
            return (
              <div key={label} className={`flex flex-col items-center gap-2 ${isActive ? '' : 'opacity-40'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentStep === stepNum ? 'bg-primary text-white ring-4 ring-primary/20' : isActive ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {stepNum}
                </div>
                <span className={`hidden md:block text-[10px] font-bold uppercase ${currentStep === stepNum ? 'text-primary' : 'text-slate-50'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <main>
        {renderStep()}
      </main>
    </div>
  );
};

export default StudentRegistrationWizard;
