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
    ADD_LEAD: 'student_add_lead',
    ADD: 'addstudent',
    UPDATE: 'updatestudent',
    DELETE: 'student_delete',
    DELETE_MANY: 'student_delete_many_students'
  },
  LEAD: {
    QUERY: 'data_query',
    CREATE: 'student_add_lead',
    UPDATE: 'data_update',
    DELETE: 'data_delete'
  },
  FINANCE: {
    GET_STUDENT_FEES: 'getstudentfees',
    RECORD_PAYMENT: 'recordpayment',
    GENERATE_FEE_PLAN: 'generatefeeplan',
    PREVIEW_FEE: 'finance_preview_fee',
    GET_ACCOUNTING_DATA: 'sheet_get_accounting_data'
  },
  ACADEMIC: {
    CREATE_COURSE_TYPE: 'academic_create_course_type',
    CREATE_COURSE: 'academic_create_course',
    CREATE_BATCH: 'academic_create_batch',
    CREATE_PACKAGE: 'academic_create_package',
    UPDATE_PACKAGE: 'academic_update_package',
    DELETE_PACKAGE: 'academic_delete_package',
    DELETE_MANY_PACKAGES: 'academic_delete_many_packages',
    DELETE_MANY_COURSES: 'academic_delete_many_courses',
    DELETE_MANY_COURSE_TYPES: 'academic_delete_many_course_types',
    ENROLL_STUDENT: 'academic_enroll_student'
  },
  DATA: {
    QUERY: 'data_query',
    CREATE: 'data_create',
    UPDATE: 'data_update',
    DELETE: 'data_delete',
    DELETE_MANY: 'data_delete_many'
  },
  STAFF: {
    ONBOARD_TEACHER: 'staff_onboard_teacher',
    UPDATE_TEACHER: 'staff_update_teacher',
    ASSIGN_SUBJECTS: 'staff_assign_subjects',
    RECORD_PAYMENT: 'staff_record_payment',
    SET_SALARY_CONFIG: 'staff_set_salary_config',
    GET_SALARY_CONFIGS: 'staff_get_salary_configs',
    GET_SALARY_CONFIG: 'staff_get_salary_config',
    UPDATE_SALARY_CONFIG: 'staff_update_salary_config',
    DELETE_SALARY_CONFIG: 'staff_delete_salary_config',
    ADD_DOCUMENT: 'staff_add_document',
    DELETE_MANY: 'staff_delete_many_teachers'
  },
  ADMIN: {
    QUERY: 'query',
    RETRIEVE: 'retrieve',
    GET_SCHEMA: 'admin_get_schema',
    ANALYZE_TABLE: 'admin_analyze_table',
    REPAIR_TABLE: 'admin_repair_table',
    PEEK_DATA: 'admin_peek_data',
    BOOTSTRAP: 'admin_bootstrap',
    SHEET_BATCH_READ: 'sheet_batch_read'
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
    // Queries daily check-in logs for students in a specific batch on a given date.
    STUDENT_GET_BATCH_ATTENDANCE: 'student_query_attendance',

    // Retrieves a grid matrix showing historical attendance status over multiple days for a batch.
    STUDENT_GET_ATTENDANCE: 'student_query_attendance',

    // Saves or updates a single student attendance record.
    STUDENT_MARK: 'student_mark_attendance',

    // Commits bulk student check-in/out records for an entire batch.
    STUDENT_MARK_BULK: 'student_mark_attendance_bulk',

    // Aggregates statistics (present count, absent count, late count) for an individual student.
    STUDENT_GET_STATS: 'attendance_get_student_stats',

    // Records a single teacher's daily attendance entry.
    TEACHER_MARK: 'staff_mark_attendance',

    // Commits multiple teacher attendance records simultaneously (e.g. daily register roster).
    TEACHER_MARK_BULK: 'staff_mark_attendance_bulk',

    // Queries daily registry logs or historical profile stats for teacher attendance.
    TEACHER_QUERY: 'staff_query_attendance'
  }
};
