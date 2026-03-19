import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterStudentMutation } from '../hooks/useStudentQueries';

// Steps
import ProfileStep from './steps/ProfileStep';
import ProgramStep from './steps/ProgramStep';
import EnrollmentStep from './steps/EnrollmentStep';
import FinanceStep from './steps/FinanceStep';
import ActivationStep from './steps/ActivationStep';

const StudentRegistrationWizard = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterStudentMutation();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1: Profile
    fullName: '',
    gender: '',
    dob: '',
    motherName: '',
    fatherName: '',
    email: '',
    mobile: '',
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

    // Step 2: Program
    programType: 'academic',
    admissionType: '',
    couponCode: '',
    referralId: '',
    entranceScore: '',
    applicableScholarship: 0,

    // Step 3: Enrollment
    batchId: '',
    batchName: '',
    courseId: '',
    courseName: '',

    // Step 5: Activation/Payment
    initialPaymentAmount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
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
        return <ProgramStep formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <EnrollmentStep formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <FinanceStep formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <ActivationStep formData={formData} setFormData={setFormData} onFinish={handleFinish} onBack={prevStep} isPending={registerMutation.isPending} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Progress Stepper */}
      <div className="mb-10 w-full rounded-2xl bg-white dark:bg-slate-900/50 p-6 shadow-sm border border-primary/5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Step {currentStep} of 5</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{(currentStep / 5 * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(currentStep / 5 * 100)}%` }}
          ></div>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {['Profile', 'Program', 'Batch', 'Finance', 'Activate'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep >= stepNum;
            return (
              <div key={label} className={`flex flex-col items-center gap-2 ${isActive ? '' : 'opacity-40'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentStep === stepNum ? 'bg-primary text-white ring-4 ring-primary/20' : isActive ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {stepNum}
                </div>
                <span className={`hidden md:block text-[10px] font-bold uppercase ${currentStep === stepNum ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
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
