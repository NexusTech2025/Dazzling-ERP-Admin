import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedRecord, resolveRecord, getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';
import { normalizeRecord, hydrateRecord } from '../../../lib/react-query/hydrate.js';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

// IMPORT FROM REAL API
import {
  fetchCourses,
  fetchCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCourseTypes,
  createCourseType,
  updateCourseType,
  deleteCourseType
} from '../api/course.api';

// --- COURSE TYPES ---

export const useCourseTypesQuery = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.course.type.list(),
    queryFn: async ({ signal }) => {
      const response = await fetchCourseTypes(token, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch course types');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 2.5, // 2.5 Minute Grace Window
    refetchOnMount: true,       // Background revalidation once stale
    refetchOnWindowFocus: false,
  });
};

export const useCreateCourseTypeMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => createCourseType(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all });
      }
    }
  });
};

export const useUpdateCourseTypeMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updateCourseType(token, id, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all });
      }
    }
  });
};

export const useDeleteCourseTypeMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => deleteCourseType(token, id, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.type.all });
      }
    }
  });
};

// --- COURSES ---

export const useCoursesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.course.list(filter),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'course',
        filter,
        async () => {
          const response = await fetchCourses(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch courses');
          }
          return normalizeRecord('course', response.data?.data || []);
        }
      );
    },
    select: (data) => hydrateRecord('course', data, queryClient),
    enabled: !!token,
    initialData: () => getCachedList(queryClient, 'course', filter),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.course.list(filter))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 2.5, // 2.5 Minute Grace Window
    refetchOnMount: true,       // Background revalidation once stale
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching a single course detail
 */
export const useCourseDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.course.detail(id),
    queryFn: async ({ signal }) => {
      return resolveRecord(
        queryClient,
        'course',
        id,
        async () => {
          const response = await fetchCourseDetail(token, id, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch course details');
          }
          return normalizeRecord('course', response.data?.data?.[0] || null);
        }
      );
    },
    enabled: !!token && !!id,
    select: (data) => hydrateRecord('course', data, queryClient),
    initialData: () => getCachedRecord(queryClient, 'course', id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.course.detail(id))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for creating a new course
 */
export const useCreateCourseMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => createCourse(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.all });
      }
    }
  });
};

/**
 * Hook for updating a course
 */
export const useUpdateCourseMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updateCourse(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.detail(id) });
      }
    }
  });
};

/**
 * Hook for deleting a course
 */
export const useDeleteCourseMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => deleteCourse(token, id, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.all });
      }
    }
  });
};

/**
 * Hook for fetching teachers assigned to a specific course
 */
export const useCourseTeachersQuery = (courseId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.course.detail(courseId), 'teachers'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherSubject', where: { subject_id: courseId } },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for fetching student allocations (enrollments) for a specific course
 */
export const useCourseAllocationsQuery = (courseId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.course.detail(courseId), 'allocations'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        {
          target: 'BatchAllocation',
          where: { course_id: courseId },
          include: ['student', 'batch']
        },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for assigning a teacher to a course/subject
 */
export const useAssignCourseTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, courseId }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.CREATE,
        {
          table: 'TeacherSubject',
          data: {
            teacher_id: teacherId,
            subject_id: courseId
          }
        },
        token
      ),
    onSuccess: (response, { courseId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.course.detail(courseId), 'teachers'] });
      }
    }
  });
};

/**
 * Hook for unassigning a teacher from a course/subject
 */
export const useUnassignCourseTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherSubjectId }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.DELETE,
        {
          table: 'TeacherSubject',
          id: teacherSubjectId
        },
        token
      ),
    onSuccess: (response, { courseId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.course.detail(courseId), 'teachers'] });
      }
    }
  });
};
