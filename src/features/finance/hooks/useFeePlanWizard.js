import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage the state and logic of the Fee Plan Wizard.
 * Handles financial calculations, multi-step navigation, and installment generation.
 */
const useFeePlanWizard = (initialData = {}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Enrollment
  const [enrollment, setEnrollment] = useState({
    studentId: initialData.studentId || null,
    studentName: initialData.studentName || '',
    programId: initialData.programId || null,
    programName: initialData.programName || '',
    programBaseFee: initialData.programBaseFee || 0
  });

  // Step 2: Structure
  const [structure, setStructure] = useState({
    tuition: initialData.programBaseFee || 0,
    admission: 0,
    materials: 0,
    other: 0,
    taxPercent: 0
  });

  // Step 3: Adjustments
  const [discounts, setDiscounts] = useState([]);

  // Step 4: Scheduling
  const [scheduling, setScheduling] = useState({
    count: 4,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    installments: []
  });

  // Step 5: Confirmation
  const [isVerified, setIsVerified] = useState(false);

  // --- Financial Calculations (Memoized) ---
  
  const subtotal = useMemo(() => {
    return structure.tuition + structure.admission + structure.materials + structure.other;
  }, [structure]);

  const taxAmount = useMemo(() => {
    return (subtotal * structure.taxPercent) / 100;
  }, [subtotal, structure.taxPercent]);

  const totalDiscount = useMemo(() => {
    return discounts.reduce((total, d) => {
      const amount = d.type === 'percentage' 
        ? (subtotal * d.value) / 100 
        : d.value;
      return total + amount;
    }, 0);
  }, [discounts, subtotal]);

  const netPayable = useMemo(() => {
    return Math.max(0, subtotal + taxAmount - totalDiscount);
  }, [subtotal, taxAmount, totalDiscount]);

  const installmentSum = useMemo(() => {
    return scheduling.installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
  }, [scheduling.installments]);

  // --- Actions ---

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);

  const updateEnrollment = (data) => {
    setEnrollment(prev => ({ ...prev, ...data }));
    // If program changes, update initial tuition in Step 2
    if (data.programBaseFee !== undefined) {
      setStructure(prev => ({ ...prev, tuition: data.programBaseFee }));
    }
  };

  const updateStructure = (data) => {
    setStructure(prev => ({ ...prev, ...data }));
  };

  const addDiscount = (discount) => {
    const newDiscount = {
      id: Date.now(),
      name: discount.name || 'New Discount',
      type: discount.type || 'fixed',
      value: discount.value || 0,
      description: discount.description || ''
    };
    setDiscounts(prev => [...prev, newDiscount]);
  };

  const removeDiscount = (id) => {
    setDiscounts(prev => prev.filter(d => d.id !== id));
  };

  /**
   * Core Engine: Generates installments with rounding correction.
   * Ensures the sum of installments exactly matches netPayable.
   */
  const generateSchedule = useCallback(() => {
    const { count, frequency, startDate } = scheduling;
    if (count <= 0) return;

    const baseAmount = Math.floor((netPayable / count) * 100) / 100;
    const remainder = Math.round((netPayable - (baseAmount * count)) * 100) / 100;
    
    const newInstallments = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      // Add remainder to the first installment to ensure balance
      const amount = i === 0 ? Math.round((baseAmount + remainder) * 100) / 100 : baseAmount;
      
      newInstallments.push({
        id: `inst-${Date.now()}-${i}`,
        name: `Installment ${i + 1}`,
        due_date: currentDate.toISOString().split('T')[0],
        amount: amount,
        status: 'Scheduled'
      });

      // Advance date based on frequency
      if (frequency === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
      if (frequency === 'quarterly') currentDate.setMonth(currentDate.getMonth() + 3);
      if (frequency === 'biannually') currentDate.setMonth(currentDate.getMonth() + 6);
      if (frequency === 'annually') currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    setScheduling(prev => ({ ...prev, installments: newInstallments }));
  }, [netPayable, scheduling.count, scheduling.frequency, scheduling.startDate]);

  const updateInstallment = (index, field, value) => {
    setScheduling(prev => {
      const newInst = [...prev.installments];
      newInst[index] = { ...newInst[index], [field]: value };
      return { ...prev, installments: newInst };
    });
  };

  const addManualInstallment = () => {
    setScheduling(prev => ({
      ...prev,
      installments: [
        ...prev.installments,
        {
          id: `inst-manual-${Date.now()}`,
          name: `Manual Installment ${prev.installments.length + 1}`,
          due_date: new Date().toISOString().split('T')[0],
          amount: 0,
          status: 'Scheduled'
        }
      ]
    }));
  };

  const deleteInstallment = (index) => {
    setScheduling(prev => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== index)
    }));
  };

  // --- Validation ---

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1: return !!enrollment.studentId && !!enrollment.programId;
      case 2: return subtotal > 0;
      case 3: return true; // Discounts are optional
      case 4: return scheduling.installments.length > 0 && Math.abs(installmentSum - netPayable) < 0.01;
      case 5: return isVerified;
      default: return false;
    }
  }, [currentStep, enrollment, subtotal, scheduling.installments, installmentSum, netPayable, isVerified]);

  return {
    // State
    currentStep,
    enrollment,
    structure,
    discounts,
    scheduling,
    isVerified,
    
    // Derived Calculations
    calculations: {
      subtotal,
      taxAmount,
      totalDiscount,
      netPayable,
      installmentSum,
      isBalanced: Math.abs(installmentSum - netPayable) < 0.01
    },

    // Actions
    actions: {
      nextStep,
      prevStep,
      goToStep,
      updateEnrollment,
      updateStructure,
      addDiscount,
      removeDiscount,
      setSchedulingConfig: (config) => setScheduling(prev => ({ ...prev, ...config })),
      generateSchedule,
      updateInstallment,
      addManualInstallment,
      deleteInstallment,
      setIsVerified
    },

    // Validation
    validation: {
      canProceed
    }
  };
};

export default useFeePlanWizard;
