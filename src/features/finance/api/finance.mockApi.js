import { mockInstallments, mockRevenueSummary, simulateDelay } from '../../../lib/mockData';

/**
 * Finance Mock API Layer
 * Replaces actual GAS calls with local mock data for testing UI.
 */

export const fetchInstallments = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...mockInstallments];
  if (filter.status) {
    filtered = filtered.filter(i => i.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(i => 
      i.student_name.toLowerCase().includes(s) || 
      i.installment_id.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

export const fetchRevenueSummary = async (token, options = {}) => {
  await simulateDelay(400); // slightly faster for dashboard metrics
  return { success: true, data: { data: [mockRevenueSummary] } };
};

export const fetchOverdueAccounts = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = mockInstallments.filter(i => i.status === 'Overdue');
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(i => i.student_name.toLowerCase().includes(s));
  }

  return { success: true, data: { data: filtered } };
};

export const fetchStudentFeeOverview = async (token, studentId, options = {}) => {
  await simulateDelay();
  const studentInstallments = mockInstallments.filter(i => i.student_id === studentId);
  return { success: true, data: { data: studentInstallments } };
};

export const recordPayment = async (token, data, options = {}) => {
  await simulateDelay(800);
  const index = mockInstallments.findIndex(i => i.installment_id === data.installment_id);
  if (index === -1) return { success: false, message: "Installment not found" };

  const inst = mockInstallments[index];
  const newPaidAmount = inst.paid_amount + Number(data.amount_paid);
  
  // Update mock state
  mockInstallments[index] = {
    ...inst,
    paid_amount: newPaidAmount,
    status: newPaidAmount >= inst.amount ? 'Paid' : 'Partial'
  };

  return { success: true, message: "Payment recorded successfully" };
};

export const generateFeePlan = async (token, data, options = {}) => {
  await simulateDelay(1500); // Simulate complex generation process
  return { success: true, message: "Fee plan generated successfully" };
};
