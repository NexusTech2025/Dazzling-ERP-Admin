import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateFeePlanMutation } from './hooks/useFinanceQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { useStudentsQuery } from '../student/hooks/useStudentQueries';
import useFeePlanWizard from './hooks/useFeePlanWizard';

// UI Components
import WizardStepper from './components/WizardStepper';

// Step Components
import EnrollmentStep from './components/EnrollmentStep';
import StructureStep from './components/StructureStep';
import DiscountsStep from './components/DiscountsStep';
import InstallmentsStep from './components/InstallmentsStep';
import ReviewStep from './components/ReviewStep';
import WizardFooter from './components/WizardFooter';
import WizardHeader from './components/WizardHeader';

const steps = [
  { label: 'Enrollment', subLabel: 'Student & Program' },
  { label: 'Structure', subLabel: 'Base Fee & Tax' },
  { label: 'Discounts', subLabel: 'Scholarships' },
  { label: 'Installments', subLabel: 'Payment Schedule' },
  { label: 'Review', subLabel: 'Final Confirmation' }
];

const FeePlanWizard = () => {
  const navigate = useNavigate();
  
  const {
    currentStep,
    enrollment,
    structure,
    discounts,
    scheduling,
    isVerified,
    calculations,
    actions,
    validation
  } = useFeePlanWizard();

  const generateMutation = useGenerateFeePlanMutation();
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();
  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery();

  // Keyboard shortcut listener for CTRL + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('student-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerate = () => {
    generateMutation.mutate({
      data: {
        student_id: enrollment.studentId,
        student_name: enrollment.studentName,
        course_id: enrollment.programId,
        course_name: enrollment.programName,
        total_amount: calculations.netPayable,
        installments: scheduling.installments
      }
    }, {
      onSuccess: () => navigate('/admin/finance/installments')
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EnrollmentStep 
            enrollment={enrollment}
            students={students}
            courses={courses}
            coursesLoading={coursesLoading}
            onUpdateEnrollment={actions.updateEnrollment}
          />
        );

      case 2:
        return (
          <StructureStep 
            structure={structure}
            calculations={calculations}
            onUpdateStructure={actions.updateStructure}
          />
        );

      case 3:
        return (
          <DiscountsStep 
            discounts={discounts}
            calculations={calculations}
            onAddDiscount={actions.addDiscount}
            onRemoveDiscount={actions.removeDiscount}
          />
        );

      case 4:
        return (
          <InstallmentsStep 
            scheduling={scheduling}
            calculations={calculations}
            onSetSchedulingConfig={actions.setSchedulingConfig}
            onGenerateSchedule={actions.generateSchedule}
            onUpdateInstallment={actions.updateInstallment}
            onAddManualInstallment={actions.addManualInstallment}
            onDeleteInstallment={actions.deleteInstallment}
          />
        );

      case 5:
        return (
          <ReviewStep 
            enrollment={enrollment}
            structure={structure}
            calculations={calculations}
            isVerified={isVerified}
            onSetIsVerified={actions.setIsVerified}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <WizardHeader 
        currentStep={currentStep}
        totalSteps={steps.length}
        subLabel={steps[currentStep-1].subLabel}
        subtotal={calculations.subtotal}
        netPayable={calculations.netPayable}
      />

      <WizardStepper steps={steps} currentStep={currentStep} />

      {/* Main Content Area */}
      <div className="min-h-[600px] mb-12">
        {renderStepContent()}
      </div>

      <WizardFooter 
        currentStep={currentStep}
        onPrev={actions.prevStep}
        onNext={actions.nextStep}
        onCancel={() => navigate('/admin/finance')}
        onFinalize={handleGenerate}
        canProceed={validation.canProceed}
        isPending={generateMutation.isPending}
      />
    </div>
  );
};

export default FeePlanWizard;
