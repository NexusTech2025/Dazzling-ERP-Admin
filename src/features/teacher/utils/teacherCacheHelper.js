/**
 * @file teacherCacheHelper.js
 * @module TeacherCacheHelper
 * @description Enterprise Repository for Teacher domain relational lookups,
 * direct cache updates, and analytical aggregations on queryKeys.teacher.list(EMPTY_FILTER).
 */

import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';

/**
 * Enterprise Repository for Teacher domain relational lookups, direct cache updates, and analytical aggregations.
 * Operates directly on the canonical React Query cache key `queryKeys.teacher.list(EMPTY_FILTER)`.
 */
export class TeacherRepo {
  /**
   * Resolves all batches assigned to a specific teacher from the global batch cache in RAM.
   *
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} teacherId - Unique teacher identifier.
   * @returns {Array<Object>} List of hydrated batch records assigned to the teacher.
   */
  getAssignedBatches(queryClient, teacherId) {
    if (!teacherId) return [];
    const listKey = queryKeys.batch.list(EMPTY_FILTER);
    const cachedBatches = queryClient.getQueryData(listKey);
    if (!Array.isArray(cachedBatches) || cachedBatches.length === 0) return [];
    return cachedBatches.filter(b => b && (b.teacher_id === teacherId || b.teacherId === teacherId));
  }

  /**
   * Directly updates a teacher's salary configuration in the canonical list cache without triggering network round-trips.
   *
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} teacherId - Unique teacher identifier.
   * @param {Object} updatedConfig - Updated or newly created salary configuration object.
   * @returns {Array<Object>} Updated teachers list written to cache.
   */
  updateSalaryConfigCache(queryClient, teacherId, updatedConfig) {
    const listKey = queryKeys.teacher.list(EMPTY_FILTER);
    const cachedTeachers = queryClient.getQueryData(listKey) || [];

    const nextTeachers = cachedTeachers.map(teacher => {
      const currentId = teacher.teacher_id || teacher.id;
      if (currentId !== teacherId) return teacher;

      const configs = Array.isArray(teacher.teachersalaryconfig) ? [...teacher.teachersalaryconfig] : [];
      const configId = updatedConfig.salary_config_id || updatedConfig.id;
      const index = configs.findIndex(c => (c.salary_config_id || c.id) === configId);

      if (index >= 0) {
        configs[index] = { ...configs[index], ...updatedConfig };
      } else {
        configs.unshift(updatedConfig);
      }

      return { ...teacher, teachersalaryconfig: configs };
    });

    queryClient.setQueryData(listKey, nextTeachers);
    return nextTeachers;
  }

  /**
   * Directly removes a teacher's salary configuration from the canonical list cache.
   *
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} teacherId - Unique teacher identifier.
   * @param {string} salaryConfigId - Configuration identifier to remove.
   * @returns {Array<Object>} Updated teachers list written to cache.
   */
  deleteSalaryConfigCache(queryClient, teacherId, salaryConfigId) {
    const listKey = queryKeys.teacher.list(EMPTY_FILTER);
    const cachedTeachers = queryClient.getQueryData(listKey) || [];

    const nextTeachers = cachedTeachers.map(teacher => {
      const currentId = teacher.teacher_id || teacher.id;
      if (currentId !== teacherId) return teacher;

      const configs = Array.isArray(teacher.teachersalaryconfig)
        ? teacher.teachersalaryconfig.filter(c => (c.salary_config_id || c.id) !== salaryConfigId)
        : [];

      return { ...teacher, teachersalaryconfig: configs };
    });

    queryClient.setQueryData(listKey, nextTeachers);
    return nextTeachers;
  }

  /**
   * Directly appends a new payment transaction entry to the teacher's transaction ledger in RAM.
   *
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} teacherId - Unique teacher identifier.
   * @param {Object} newTransaction - Newly created payment transaction object.
   * @returns {Array<Object>} Updated teachers list written to cache.
   */
  recordPaymentCache(queryClient, teacherId, newTransaction) {
    const listKey = queryKeys.teacher.list(EMPTY_FILTER);
    const cachedTeachers = queryClient.getQueryData(listKey) || [];

    const nextTeachers = cachedTeachers.map(teacher => {
      const currentId = teacher.teacher_id || teacher.id;
      if (currentId !== teacherId) return teacher;

      const txns = Array.isArray(teacher.teacherpaymenttransaction) ? [...teacher.teacherpaymenttransaction] : [];
      txns.unshift(newTransaction);

      return { ...teacher, teacherpaymenttransaction: txns };
    });

    queryClient.setQueryData(listKey, nextTeachers);
    return nextTeachers;
  }
}

export const teacherRepo = new TeacherRepo();
