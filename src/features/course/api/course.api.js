import { query, postToGoogleScript } from '../../../services/api';

/**
 * Course API Layer
 */

const createAdminPayload = (action, token, extraData = {}) => ({
  action,
  token,
  ...extraData
});

export const fetchCourses = (token, filter = {}, options = {}) => 
  query(token, 'Courses', filter, options);

export const fetchCourseDetail = (token, id, options = {}) => 
  query(token, 'Courses', { course_id: id }, options);

export const createCourse = (token, data, options = {}) => 
  postToGoogleScript(createAdminPayload('addcourse', token, { data }), options);

export const updateCourse = (token, id, data, options = {}) => 
  postToGoogleScript(createAdminPayload('updatecourse', token, { id, data }), options);

export const deleteCourse = (token, id, options = {}) => 
  postToGoogleScript(createAdminPayload('deletecourse', token, { id }), options);
