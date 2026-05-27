import mockTeachers from '../../../mockdata/core/teachers.json';
import mockAttendance from '../../../mockdata/core/teacherAttendance.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Teacher Mock API Layer
 */

let localTeachers = [...mockTeachers.Teachers];
let localAttendance = [...mockAttendance];

export const fetchTeachers = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...localTeachers];
  if (filter.status) {
    filtered = filtered.filter(t => t.status === filter.status);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(t => 
      (t.full_name || t.teacher_name || '').toLowerCase().includes(s) || 
      t.teacher_id.toLowerCase().includes(s) ||
      t.email?.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

export const fetchTeacherDetail = async (token, id, options = {}) => {
  await simulateDelay();
  const teacher = localTeachers.find(t => t.teacher_id === id);
  if (!teacher) return { success: false, message: "Teacher not found" };
  return { success: true, data: { data: teacher } };
};

export const fetchTeacherAttendance = async (token, teacherId, options = {}) => {
  await simulateDelay();
  const attendance = localAttendance.filter(a => a.teacher_id === teacherId);
  return { success: true, data: { data: attendance } };
};

export const updateTeacherAttendance = async (token, { teacherId, date, data }, options = {}) => {
  await simulateDelay(500);
  
  const recordIndex = localAttendance.findIndex(
    a => a.teacher_id === teacherId && a.attendance_date === date
  );

  let updatedRecord;

  if (recordIndex !== -1) {
    updatedRecord = {
      ...localAttendance[recordIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    localAttendance[recordIndex] = updatedRecord;
  } else {
    updatedRecord = {
      attendance_id: `ATT-${teacherId}-${date.replace(/-/g, '')}`,
      teacher_id: teacherId,
      attendance_date: date,
      attendance_source: 'manual',
      created_at: new Date().toISOString(),
      ...data
    };
    localAttendance.push(updatedRecord);
  }

  return { success: true, message: "Attendance updated successfully", data: updatedRecord };
};

export const createTeacher = async (token, userData, profileData, options = {}) => {
  await simulateDelay(1000);
  const newTeacher = {
    teacher_id: `TCH-${Date.now().toString().slice(-4)}`,
    username: userData.username,
    full_name: profileData.full_name || profileData.name || '',
    mobile_number: profileData.mobile_number || profileData.mobile || '',
    profile_photo_url: profileData.profile_photo_url || profileData.avatar || '',
    qualification: profileData.qualification || profileData.designation || '',
    email: userData.email,
    status: 'active',
    notes: profileData.notes || profileData.metadata?.internal_notes || '',
    ...profileData,
    created_at: new Date().toISOString()
  };
  localTeachers.push(newTeacher);
  return { success: true, message: "Teacher registered successfully", data: newTeacher };
};

export const updateTeacher = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = localTeachers.findIndex(t => t.teacher_id === id);
  if (index === -1) return { success: false, message: "Teacher not found" };
  
  // Create a clean update object based on schema
  const updatedTeacher = {
    ...localTeachers[index],
    full_name: data.full_name || data.name || localTeachers[index].full_name,
    mobile_number: data.mobile_number || data.mobile || localTeachers[index].mobile_number,
    gender: data.gender || localTeachers[index].gender,
    date_of_birth: data.date_of_birth || localTeachers[index].date_of_birth,
    qualification: data.qualification || data.designation || localTeachers[index].qualification,
    subject_code: data.subject_code || localTeachers[index].subject_code,
    experience_years: data.experience_years || localTeachers[index].experience_years,
    specialization: data.specialization || localTeachers[index].specialization,
    teacher_type: data.teacher_type || localTeachers[index].teacher_type,
    joining_date: data.joining_date || localTeachers[index].joining_date,
    previous_institute: data.previous_institute || localTeachers[index].previous_institute,
    status: data.status?.toLowerCase() || localTeachers[index].status,
    notes: data.notes || data.metadata?.internal_notes || localTeachers[index].notes,
    updated_at: new Date().toISOString()
  };

  // Merge Metadata properly if it exists in data
  if (data.metadata) {
    updatedTeacher.metadata = {
      ...(localTeachers[index].metadata || {}),
      ...data.metadata
    };
  }

  localTeachers[index] = updatedTeacher;
  
  return { success: true, message: "Teacher profile updated successfully", data: updatedTeacher };
};

export const removeTeacher = async (token, id, options = {}) => {
  await simulateDelay(800);
  localTeachers = localTeachers.filter(t => t.teacher_id !== id);
  return { success: true, message: "Teacher removed successfully" };
};
