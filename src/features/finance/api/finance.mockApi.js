import { simulateDelay } from '../../../lib/mockData';

/**
 * Finance Mock API Layer
 * Replaces actual GAS calls with local mock data for testing UI.
 */

// Local state to survive throughout the session
let localInstallments = [];

export const fetchInstallments = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...localInstallments];
  if (filter.status) {
    filtered = filtered.filter(i => i.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(i => 
      i.student_name?.toLowerCase().includes(s) || 
      i.installment_id?.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

export const fetchRevenueSummary = async (token, options = {}) => {
  await simulateDelay(400); 
  return { 
    success: true, 
    data: { 
      data: [{
        summary_id: "REV-EMPTY",
        total_collected: 0,
        total_pending: 0,
        total_overdue: 0,
        last_updated: new Date().toISOString()
      }] 
    } 
  };
};

export const fetchOverdueAccounts = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = localInstallments.filter(i => i.status === 'Overdue');
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(i => i.student_name?.toLowerCase().includes(s));
  }

  return { success: true, data: { data: filtered } };
};

export const fetchStudentFeeOverview = async (token, studentId, options = {}) => {
  await simulateDelay();
  const studentInstallments = localInstallments.filter(i => i.student_id === studentId);
  return { success: true, data: { data: studentInstallments } };
};

export const recordPayment = async (token, data, options = {}) => {
  await simulateDelay(800);
  const index = localInstallments.findIndex(i => i.installment_id === data.installment_id);
  if (index === -1) return { success: false, message: "Installment not found" };

  const inst = localInstallments[index];
  const newPaidAmount = (inst.paid_amount || 0) + Number(data.amount_paid);
  
  localInstallments[index] = {
    ...inst,
    paid_amount: newPaidAmount,
    status: newPaidAmount >= inst.amount ? 'Paid' : 'Partial'
  };

  return { success: true, message: "Payment recorded successfully" };
};

export const generateFeePlan = async (token, payload, options = {}) => {
  await simulateDelay(1500); 
  
  const { student_id, course_id, installments } = payload.data;

  // Transform wizard installments into the mock list format
  const newInstallments = installments.map((inst, idx) => ({
    installment_id: `INST-${Date.now()}-${idx}`,
    student_id,
    student_name: payload.data.student_name || "New Student", 
    course_name: payload.data.course_name || "Academic Program",
    amount: inst.amount,
    paid_amount: 0,
    due_date: inst.due_date,
    status: 'Pending'
  }));

  // Append to our local state
  localInstallments = [...newInstallments, ...localInstallments];

  return { 
    success: true, 
    message: "Fee plan generated successfully",
    data: { plan_id: `PLAN-${Date.now()}` }
  };
};
