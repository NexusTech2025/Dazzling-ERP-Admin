/**
 * Centralized Query Key Factory
 * 
 * Provides a structured and predictable way to manage query keys across the application.
 * This prevents cache collisions and makes invalidation simpler and more reliable.
 */
export const queryKeys = {
  students: {
    all: ['students'],
    lists: () => [...queryKeys.students.all, 'list'],
    list: (filter) => [...queryKeys.students.lists(), { filter }],
    details: () => [...queryKeys.students.all, 'detail'],
    detail: (id) => [...queryKeys.students.details(), id],
  },
  teachers: {
    all: ['teachers'],
    lists: () => [...queryKeys.teachers.all, 'list'],
    list: (filter) => [...queryKeys.teachers.lists(), { filter }],
    details: () => [...queryKeys.teachers.all, 'detail'],
    detail: (id) => [...queryKeys.teachers.details(), id],
  },
  courses: {
    all: ['courses'],
    lists: () => [...queryKeys.courses.all, 'list'],
    list: (filter) => [...queryKeys.courses.lists(), { filter }],
    details: () => [...queryKeys.courses.all, 'detail'],
    detail: (id) => [...queryKeys.courses.details(), id],
    analytics: (id) => [...queryKeys.courses.detail(id), 'analytics'],
  },
  finance: {
    all: ['finance'],
    installments: {
      all: ['finance', 'installments'],
      list: (filter) => [...queryKeys.finance.installments.all, 'list', { filter }],
      student: (studentId) => [...queryKeys.finance.installments.all, 'student', studentId],
    },
    revenue: {
      all: ['finance', 'revenue'],
      summary: ['finance', 'revenue', 'summary'],
    },
    delinquent: (filter) => ['finance', 'delinquent', { filter }],
    payments: (filter) => ['finance', 'payments', { filter }],
  }
};
