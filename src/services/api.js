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
 */
export const postToGoogleScript = async (data) => {
  try {
    const response = await axios.post(API_URL, JSON.stringify(data), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    
    // Log logic errors from the server (GAS returns 200 even on failures)
    if (response.data && response.data.success === false) {
      console.error('API Logic Error:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('API Network/System Error:', error);
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
export const query = (token, entity, filter = {}) => 
  postToGoogleScript(createAdminPayload('query', token, { entity, filter }));

export const retrieve = (token, entity, id) => 
  postToGoogleScript(createAdminPayload('retrieve', token, { entity, id }));

// Student CRUD (Addition, Update, Deletion)
export const addStudent = (token, userData, profileData) => {
  const payload = createAdminPayload('addstudent', token, { userData, profileData });
  console.log('Add Student Payload:', payload);
  return postToGoogleScript(payload);
};

export const updateStudent = (token, id, data) => 
  postToGoogleScript(createAdminPayload('updatestudent', token, { id, data }));

export const deleteStudent = (token, id) => 
  postToGoogleScript(createAdminPayload('deletestudent', token, { id }));

// Teacher CRUD (Addition, Update, Deletion)
export const addTeacher = (token, userData, profileData) => {
  const payload = createAdminPayload('addteacher', token, { userData, profileData });
  console.log('Add Teacher Payload:', payload);
  return postToGoogleScript(payload);
};

export const updateTeacher = (token, id, data) => 
  postToGoogleScript(createAdminPayload('updateteacher', token, { id, data }));

export const deleteTeacher = (token, id) => 
  postToGoogleScript(createAdminPayload('deleteteacher', token, { id }));

export default api;
