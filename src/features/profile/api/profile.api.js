/**
 * @file profile.api.js
 * @module ProfileAPI
 * @description Aggregator layer for student profile directories. Pre-fetches and joins
 * parallel databases (address, contact, academic history, batch allocations) in a single request transaction.
 */

import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Orchestrates parallel query requests using the centralized query DSL (DATA.QUERY)
 * to construct a fully hydrated Student Profile dossier.
 * Resolves address info, secondary contact info, education records, and active course enrollments
 * joined against batch and course catalog details.
 * 
 * @async
 * @function fetchProfileDetails
 * @param {string} token - The active user authorization session token.
 * @param {string} studentId - The unique primary student identifier (prefix: STU-).
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @returns {Promise<object>} Returns a compiled profile details payload containing:
 * - success {boolean} Indicator indicating transaction outcomes.
 * - data.data.address {object|null} Home residency details.
 * - data.data.contact {object|null} Email, emergency phone, and kinship mappings.
 * - data.data.education {Array<object>} Past qualifications.
 * - data.data.enrollments {Array<object>} Current active courses, joined with durations and batch names.
 */
export const fetchProfileDetails = async (token, studentId, options = {}) => {
  try {
    // Query Address, ContactInfo, Education, and Enrollments in parallel, plus Courses, Batches, Packages,
    // and BatchAllocations for dynamic relation mapping (using the modern Query DSL engine DATA.QUERY)
    const [
      addressRes,
      contactRes,
      educationRes,
      enrollmentsRes,
      coursesRes,
      batchesRes,
      allocationsRes,
      packagesRes
    ] = await Promise.all([
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Address', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'ContactInfo', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Education', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Enrollment', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Course', where: {} }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Batch', where: {} }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'BatchAllocation', where: { student_id: studentId } }, token, options),
      apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Package', where: {} }, token, options)
    ]);

    if (
      !addressRes.success ||
      !contactRes.success ||
      !educationRes.success ||
      !enrollmentsRes.success ||
      !coursesRes.success ||
      !batchesRes.success ||
      !allocationsRes.success ||
      !packagesRes.success
    ) {
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
    const allocations = allocationsRes.data?.data || [];
    const packages = packagesRes.data?.data || [];

    const enrollments = (enrollmentsRes.data?.data || []).map(enr => {
      // Resolve allocated batch via BatchAllocation table
      const allocation = allocations.find(a => a.enrollment_id === enr.enrollment_id);
      const batch = allocation ? batches.find(b => b.batch_id === allocation.batch_id) : null;
      
      let course_name = 'Unknown Course';
      let duration = 'N/A';

      if (enr.enrollment_type === 'package') {
        const pkg = packages.find(p => p.package_id === enr.item_id);
        course_name = pkg ? pkg.name : 'Unknown Package';
        duration = pkg ? `${pkg.month} Months` : 'N/A';
      } else if (enr.enrollment_type === 'course' || enr.enrollment_type === 'subject') {
        const course = courses.find(c => c.course_id === enr.item_id);
        course_name = course ? course.name : 'Unknown Course';
        duration = course ? `${course.duration_value} ${course.duration_unit}` : 'N/A';
      }

      return {
        ...enr,
        course_name,
        batch_name: batch ? batch.batch_name : 'Not Allocated',
        duration
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
