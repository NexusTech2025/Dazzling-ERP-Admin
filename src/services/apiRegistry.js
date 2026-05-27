/**
 * src/services/apiRegistry.js
 * Centralized mapping of all DazzlingDB backend actions.
 */

export const API_REGISTRY = {
  AUTH: {
    LOGIN: 'user_login',
    REGISTER: 'user_register',
    LOGOUT: 'user_logout'
  },
  STUDENT: {
    REGISTER: 'student_register',
    ADD_LEAD: 'student_add_lead'
  },
  ACADEMIC: {
    CREATE_COURSE_TYPE: 'academic_create_course_type',
    CREATE_COURSE: 'academic_create_course',
    CREATE_BATCH: 'academic_create_batch',
    CREATE_PACKAGE: 'academic_create_package',
    ENROLL_STUDENT: 'academic_enroll_student'
  },
  DATA: {
    QUERY: 'data_query',
    CREATE: 'data_create',
    UPDATE: 'data_update',
    DELETE: 'data_delete'
  },
  STAFF: {
    ONBOARD_TEACHER: 'staff_onboard_teacher',
    UPDATE_TEACHER: 'staff_update_teacher',
    ASSIGN_SUBJECTS: 'staff_assign_subjects',
    MARK_ATTENDANCE: 'staff_mark_attendance',
    RECORD_PAYMENT: 'staff_record_payment',
    SET_SALARY_CONFIG: 'staff_set_salary_config',
    ADD_DOCUMENT: 'staff_add_document'
  },
  ADMIN: {
    QUERY: 'query',
    RETRIEVE: 'retrieve',
    GET_SCHEMA: 'admin_get_schema',
    ANALYZE_TABLE: 'admin_analyze_table',
    REPAIR_TABLE: 'admin_repair_table',
    PEEK_DATA: 'admin_peek_data',
    BOOTSTRAP: 'admin_bootstrap',
    INIT_ERP: 'init_erp'
  },
  BATCH: {
    CREATE: 'academic_create_batch',
    UPDATE: 'batch_update',
    DELETE: 'batch_delete',
    UPDATE_BULK: 'batch_update_bulk',
    GET_DETAILS: 'batch_get_details',
    GET_STUDENTS: 'batch_get_students',
    GET_WEEKLY_SCHEDULE: 'batch_get_weekly_schedule',
    GET_MASTER_TIMETABLE: 'batch_get_master_timetable'
  },
  ATTENDANCE: {
    GET_BATCH_REGISTRY: 'attendance_get_batch_registry',
    GET_MATRIX: 'attendance_get_matrix',
    MARK: 'staff_mark_attendance',
    GET_STUDENT_STATS: 'attendance_get_student_stats'
  }
};
