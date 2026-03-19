import mockAddressData from '../../../mockdata/profile/address.json';
import mockContactData from '../../../mockdata/profile/contactInfo.json';
import mockEducationData from '../../../mockdata/profile/education.json';
import mockStudentsData from '../../../mockdata/student/students.json';
import mockEnrollmentsData from '../../../mockdata/student/enrollments.json';
import mockCoursesData from '../../../mockdata/academic/courses.json';
import mockBatchesData from '../../../mockdata/academic/batches.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Profile Mock API Layer
 * Correctly aggregates linked data from multiple JSON sources.
 */

export const fetchProfileDetails = async (token, studentId, options = {}) => {
  await simulateDelay();
  
  // 1. Find the student to get the linked contact and education IDs
  const student = mockStudentsData.Students.find(s => s.student_id === studentId);
  
  if (!student) {
    return { success: false, message: "Student record not found for profile lookup" };
  }

  // 2. Lookup contact info
  const contact = mockContactData.ContactInfo.find(c => c.contact_id === student.contact_id);

  // 3. Lookup address info
  const address = contact 
    ? mockAddressData.Address.find(a => a.address_id === contact.address_id)
    : null;

  // 4. Lookup education records
  const education = mockEducationData.Education.find(e => e.education_id === student.education_id);

  // 5. Lookup and Join Enrollments
  const studentEnrollments = mockEnrollmentsData.Enrollments
    .filter(enr => enr.student_id === studentId)
    .map(enr => {
      const course = mockCoursesData.Course.find(c => c.course_id === enr.item_id);
      const batch = mockBatchesData.Batches.find(b => b.batch_id === enr.batch_id);
      
      return {
        ...enr,
        course_name: course ? course.name : "Unknown Course",
        batch_name: batch ? batch.batch_name : "Unknown Batch",
        duration: course ? `${course.duration_value} ${course.duration_unit}` : "N/A"
      };
    });

  return { 
    success: true, 
    data: { 
      data: {
        address,
        contact,
        education: education ? [education] : [],
        enrollments: studentEnrollments
      } 
    } 
  };
};
