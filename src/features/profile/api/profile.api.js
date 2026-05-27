import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Profile API Layer
 * Fetches and aggregates student contact, address, education, and enrollments.
 */
export const fetchProfileDetails = async (token, studentId, options = {}) => {
  try {
    // Query Address, ContactInfo, Education, and Enrollments in parallel, plus Courses and Batches for joins
    // using the modern Query DSL engine (DATA.QUERY)
    const [addressRes, contactRes, educationRes, enrollmentsRes, coursesRes, batchesRes] = await Promise.all([
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Address', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'ContactInfo', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Education', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Enrollment', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Course', where: {} }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Batch', where: {} }, token, options)
    ]);

    if (!addressRes.success || !contactRes.success || !educationRes.success || !enrollmentsRes.success || !coursesRes.success || !batchesRes.success) {
      return {
        success: false,
        message: 'Failed to retrieve profile details from the database.'
      };
    }

    const address = addressRes.data?.data?.[0] || null;
    const contact = contactRes.data?.data?.[0] || null;
    const education = educationRes.data?.data || [];
    
    const courses = coursesRes.data?.data || [];
    const batches = batchesRes.data?.data || [];

    const enrollments = (enrollmentsRes.data?.data || []).map(enr => {
      const course = courses.find(c => c.course_id === enr.item_id || c.course_id === enr.course_id);
      const batch = batches.find(b => b.batch_id === enr.batch_id);
      
      return {
        ...enr,
        course_name: course ? course.name : 'Unknown Course',
        batch_name: batch ? batch.batch_name : 'Unknown Batch',
        duration: course ? `${course.duration_value} ${course.duration_unit}` : 'N/A'
      };
    });

    return {
      success: true,
      data: {
        data: {
          address,
          contact,
          education,
          enrollments
        }
      }
    };
  } catch (error) {
    if (error.name === 'CanceledError' || error.name === 'AbortError' || error.message === 'canceled') {
      throw error;
    }
    console.error('fetchProfileDetails error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while compiling profile data.'
    };
  }
};
