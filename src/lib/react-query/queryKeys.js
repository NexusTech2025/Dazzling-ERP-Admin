/**
 * Centralized Query Key Factory
 * 
 * Provides a structured and predictable way to manage query keys across the application.
 * This prevents cache collisions and makes invalidation simpler and more reliable.
 */

// 🔒 Immutable empty reference to ensure query key stability
export const EMPTY_FILTER = Object.freeze({});

export const queryKeys = {
  student: {
    all: ['student'],
    lists: () => [...queryKeys.student.all, 'list'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.student.lists(), { filter }],
    details: () => [...queryKeys.student.all, 'detail'],
    detail: (id) => [...queryKeys.student.details(), id],
    profile: (id) => [...queryKeys.student.all, 'profile', id],
  },
  lead: {
    all: ['lead'],
    lists: () => [...queryKeys.lead.all, 'list'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.lead.lists(), { filter }],
    details: () => [...queryKeys.lead.all, 'detail'],
    detail: (id) => [...queryKeys.lead.details(), id],
  },
  teacher: {
    all: ['teacher'],
    lists: () => [...queryKeys.teacher.all, 'list'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.teacher.lists(), { filter }],
    details: () => [...queryKeys.teacher.all, 'detail'],
    detail: (id) => [...queryKeys.teacher.details(), id],
  },
  course: {
    all: ['course'],
    lists: () => [...queryKeys.course.all, 'list'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.course.lists(), { filter }],
    details: () => [...queryKeys.course.all, 'detail'],
    detail: (id) => [...queryKeys.course.details(), id],
    analytics: (id) => [...queryKeys.course.detail(id), 'analytics'],
    type: {
      all: ['course-type'],
      list: () => [...queryKeys.course.type.all, 'list'],
    },
    package: {
      all: ['package'],
      list: (filter = EMPTY_FILTER) => [...queryKeys.course.package.all, 'list', { filter }],
      detail: (id) => [...queryKeys.course.package.all, 'detail', id],
    },
    packageItem: {
      all: ['package-item'],
      list: () => [...queryKeys.course.packageItem.all, 'list'],
    },
    packagePerk: {
      all: ['package-perk'],
      list: () => [...queryKeys.course.packagePerk.all, 'list'],
    }
  },
  batch: {
    all: ['batch'],
    lists: () => [...queryKeys.batch.all, 'list'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.batch.lists(), { filter }],
    details: () => [...queryKeys.batch.all, 'detail'],
    detail: (id) => [...queryKeys.batch.details(), id],
    student: (id) => [...queryKeys.batch.detail(id), 'student'],
    schedule: (id) => [...queryKeys.batch.detail(id), 'schedule'],
    master: (day) => [...queryKeys.batch.all, 'master-timetable', day],
  },
  attendance: {
    all: ['attendance'],
    batch: (batchId, date) => [...queryKeys.attendance.all, 'batch', batchId, date],
    matrix: (batchId, days) => [...queryKeys.attendance.all, 'matrix', batchId, days],
    student: (studentId) => [...queryKeys.attendance.all, 'student', studentId],
  },
  branch: {
    all: ['branch'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.branch.all, 'list', { filter }],
    detail: (id) => [...queryKeys.branch.all, 'detail', id],
  },
  staff: {
    all: ['staff'],
    lists: () => [...queryKeys.staff.all, 'list'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.staff.lists(), { filter }],
  },
  finance: {
    all: ['finance'],
    installment: {
      all: ['finance', 'installment'],
      list: (filter = EMPTY_FILTER) => [...queryKeys.finance.installment.all, 'list', { filter }],
      student: (studentId) => [...queryKeys.finance.installment.all, 'student', studentId],
    },
    revenue: {
      all: ['finance', 'revenue'],
      summary: ['finance', 'revenue', 'summary'],
    },
    transaction: {
      all: ['finance', 'transaction'],
      list: (filter = EMPTY_FILTER) => [...queryKeys.finance.transaction.all, 'list', { filter }],
    },
    category: {
      all: ['finance', 'category'],
      list: (filter = EMPTY_FILTER) => [...queryKeys.finance.category.all, 'list', { filter }],
    },
    overdue: (filter = EMPTY_FILTER) => ['finance', 'overdue', { filter }],
    payments: (filter = EMPTY_FILTER) => ['finance', 'payments', { filter }],
  }
};
