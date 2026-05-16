import mockStudentsData from '../../../mockdata/student/students.json';
import mockAddressData from '../../../mockdata/profile/address.json';
import mockContactData from '../../../mockdata/profile/contactInfo.json';
import mockEducationData from '../../../mockdata/profile/education.json';
import mockEnrollmentsData from '../../../mockdata/student/enrollments.json';
import mockFeeAccountsData from '../../../mockdata/finance/studentFeeAccounts.json';
import mockInstallmentsData from '../../../mockdata/finance/installments.json';
import mockPaymentsData from '../../../mockdata/finance/payments.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Student Mock API Layer
 */

let localStudents = [...mockStudentsData.Students];
let localAddress = [...mockAddressData.Address];
let localContact = [...mockContactData.ContactInfo];
let localEducation = [...mockEducationData.Education];
let localEnrollments = [...mockEnrollmentsData.Enrollments];
let localFeeAccounts = [...mockFeeAccountsData.StudentFeeAccounts];
let localInstallments = [...mockInstallmentsData.Installments];
let localPayments = [...mockPaymentsData.Payments];

export const fetchStudents = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...localStudents];
  
  if (filter.student_id) {
    filtered = filtered.filter(s => s.student_id === filter.student_id);
  }
  
  if (filter.status) {
    filtered = filtered.filter(s => s.status === filter.status);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.student_name.toLowerCase().includes(s) || 
      s.student_id.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

/**
 * Perform a full student registration transaction
 */
export const registerStudentTransaction = async (token, data, options = {}) => {
  await simulateDelay(2000); // Simulate heavy transaction

  const studentId = `STU-${Date.now().toString().slice(-6)}`;
  const addressId = `ADDR-${Date.now().toString().slice(-6)}`;
  const contactId = `CON-${Date.now().toString().slice(-6)}`;
  const educationId = `EDU-${Date.now().toString().slice(-6)}`;
  const enrollmentId = `ENR-${Date.now().toString().slice(-6)}`;
  const feeAccountId = `SFA-${Date.now().toString().slice(-6)}`;

  // 1. Create Student Profile
  const newStudent = {
    student_id: studentId,
    student_name: data.fullName,
    email: data.email,
    phone: data.mobile,
    gender: data.gender,
    date_of_birth: data.date_of_birth,
    mother_name: data.motherName,
    father_name: data.fatherName,
    status: 'active',
    avatarUrl: data.profilePhoto ? URL.createObjectURL(data.profilePhoto) : null,
    created_at: new Date().toISOString()
  };
  localStudents.unshift(newStudent);

  // 2. Create Address
  const newAddress = {
    address_id: addressId,
    student_id: studentId,
    line1: data.address1,
    line2: data.address2,
    city: data.city,
    state: data.state,
    pin_code: data.pincode,
    country: "India"
  };
  localAddress.unshift(newAddress);

  // 3. Create Contact Info
  const newContact = {
    contact_id: contactId,
    student_id: studentId,
    address_id: addressId,
    email: data.email,
    mobile_number: data.mobile,
    emergency_name: data.emergencyContactName,
    emergency_phone: data.emergencyContactPhone
  };
  localContact.unshift(newContact);

  // 4. Create Education Record
  const newEducation = {
    education_id: educationId,
    student_id: studentId,
    highest_qualification: data.highestQualification,
    institution_name: data.previousInstitution,
    year_of_passing: data.passingYear,
    percentage_or_cgpa: data.grade
  };
  localEducation.unshift(newEducation);

  // 5. Create Enrollment
  const newEnrollment = {
    enrollment_id: enrollmentId,
    student_id: studentId,
    item_id: data.courseId,
    batch_id: data.batchId,
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active'
  };
  localEnrollments.unshift(newEnrollment);

  // 6. Create Fee Account
  const newFeeAccount = {
    student_fee_id: feeAccountId,
    enrollment_id: enrollmentId,
    fee_plan_id: data.feePlanId || 'FPL-STD-001',
    total_fee: data.totalFee || 12000,
    discount: data.discount || 0,
    final_fee: data.finalFee || 12000,
    amount_paid: Number(data.initialPaymentAmount) || 0,
    balance_due: (data.finalFee || 12000) - (Number(data.initialPaymentAmount) || 0),
    status: 'active',
    created_at: new Date().toISOString()
  };
  localFeeAccounts.unshift(newFeeAccount);

  // 7. Create Payment (if initial payment made)
  if (Number(data.initialPaymentAmount) > 0) {
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;
    const newPayment = {
      payment_id: paymentId,
      student_fee_id: feeAccountId,
      amount_paid: Number(data.initialPaymentAmount),
      payment_date: data.paymentDate || new Date().toISOString(),
      payment_method: data.paymentMethod,
      transaction_reference: data.transactionRef,
      status: 'success',
      created_by: 'ADMIN-01'
    };
    localPayments.unshift(newPayment);
  }

  return { 
    success: true, 
    message: "Registration completed successfully", 
    data: { student_id: studentId, enrollment_id: enrollmentId } 
  };
};

export const createStudent = async (token, userData, profileData, options = {}) => {
  await simulateDelay(1000);
  const newStudent = {
    student_id: `STU-${Date.now()}`,
    student_name: userData.name,
    email: userData.email,
    phone: userData.phone,
    status: 'active',
    ...profileData
  };
  localStudents.push(newStudent);
  return { success: true, message: "Student created successfully", data: newStudent };
};

export const modifyStudent = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = localStudents.findIndex(s => s.student_id === id);
  if (index === -1) return { success: false, message: "Student not found" };
  
  localStudents[index] = { ...localStudents[index], ...data };
  return { success: true, message: "Student updated successfully", data: localStudents[index] };
};

export const removeStudent = async (token, id, options = {}) => {
  await simulateDelay(800);
  localStudents = localStudents.filter(s => s.student_id !== id);
  return { success: true, message: "Student removed successfully" };
};
