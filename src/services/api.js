import axios from 'axios';

const API_URL = 'https://script.google.com/macros/s/AKfycbz_jZEJIANX2taLYylJgz6OSbfSoTovdZebORyXzC1iBwPVPKhu_977i_cK-uQ9xQQT/exec';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
});

/**
 * Common handler for Google Script POST requests
 * Supports AbortController signal via options
 */
export const postToGoogleScript = async (data, options = {}) => {
  try {
    const response = await axios.post(API_URL, JSON.stringify(data), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: options.signal
    });
    
    // Log logic errors from the server (GAS returns 200 even on failures)
    if (response.data && response.data.success === false) {
      console.error('API Logic Error:', response.data);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else {
      console.error('API Network/System Error:', error);
    }
    throw error;
  }
};

/**
 * Helper to create admin payloads with token
 */
const createAdminPayload = (action, token, extraData = {}) => ({
  action,
  token,
  ...extraData
});

// Generic Retrieval Actions (ORM Query Engine)
export const query = (token, entity, filter = {}, options = {}) => 
  postToGoogleScript(createAdminPayload('query', token, { entity, filter }), options);

export const retrieve = (token, entity, id, options = {}) => 
  postToGoogleScript(createAdminPayload('retrieve', token, { entity, id }), options);

// Student CRUD
export const addStudent = (token, userData, profileData, options = {}) => 
  postToGoogleScript(createAdminPayload('addstudent', token, { userData, profileData }), options);

export const updateStudent = (token, id, data, options = {}) => 
  postToGoogleScript(createAdminPayload('updatestudent', token, { id, data }), options);

export const deleteStudent = (token, id, options = {}) => 
  postToGoogleScript(createAdminPayload('deletestudent', token, { id }), options);

// Teacher CRUD
export const addTeacher = (token, userData, profileData, options = {}) => 
  postToGoogleScript(createAdminPayload('addteacher', token, { userData, profileData }), options);

export const updateTeacher = (token, id, data, options = {}) => 
  postToGoogleScript(createAdminPayload('updateteacher', token, { id, data }), options);

export const deleteTeacher = (token, id, options = {}) => 
  postToGoogleScript(createAdminPayload('deleteteacher', token, { id }), options);

export default api;
