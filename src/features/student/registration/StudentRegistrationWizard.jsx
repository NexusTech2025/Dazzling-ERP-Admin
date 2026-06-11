import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterStudentMutation } from '../hooks/useStudentQueries';
import APIErrorModal from '../../../components/ui/APIErrorModal';

// Child components & Steps
import ProgressStepper from './components/ProgressStepper';
import ProfileStep from './steps/ProfileStep';
import AcademicEnrollmentStep from './steps/AcademicEnrollmentStep';
import ActivationStep from './steps/ActivationStep';

const StudentRegistrationWizard = ({ initialData }) => {
  const navigate = useNavigate();
  const registerMutation = useRegisterStudentMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', error: null });

  const [formData, setFormData] = useState({
    // Step 1: Profile
    fullName: initialData?.fullName || '',
    gender: '',
    dob: '',
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

    // Step 2 & 3: Enrollment Basket and custom pricing/installments
    enrollmentBasket: [],
    selectedBatches: {},
    installments: [],
    isManualPlan: false,
    discountVal: 0,
    discountReason: '',
    baseFee: 0,
    registrationFee: 0,
    finalFee: 0,

    // Step 3 (old Step 4): Activation/Payment
    initialPaymentAmount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
          alert('Student Registered Successfully!');
          navigate('/admin/students');
        } else {
          setErrorModal({
            isOpen: true,
            title: 'Registration Failed',
            error: {
              type: response.error?.type || 'APIError',
              message: response.message || response.error?.message || 'Server rejected the registration request.'
            }
          });
        }
      },
      onError: (error) => {
        console.error('[Wizard] API Error:', error);
        setErrorModal({
          isOpen: true,
          title: 'Request Failed',
          error: {
            type: error.name || 'NetworkError',
            message: error.message || 'An error occurred during registration. Please check your connection.'
          }
        });
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
        return <ActivationStep formData={formData} setFormData={setFormData} onFinish={handleFinish} onBack={prevStep} isPending={registerMutation.isPending} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ProgressStepper 
        currentStep={currentStep} 
        totalSteps={3} 
        steps={['Profile', 'Enrollment & Fees', 'Activation']} 
        variant='glass-indicator' 
      />

      <main>
        {renderStep()}
      </main>

      <APIErrorModal 
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', error: null })}
        title={errorModal.title}
        error={errorModal.error}
      />
    </div>
  );
};

export default StudentRegistrationWizard;
