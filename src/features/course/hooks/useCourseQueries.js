import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { fetchCourses, fetchCourseDetail, createCourse, updateCourse, deleteCourse, fetchCourseTypes, createCourseType, fetchPackages, createPackage, fetchPackageDetail, updatePackage } from '../api/course.mockApi';

// --- COURSE TYPES ---

export const useCourseTypesQuery = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['courseTypes'], // You can add this to queryKeys if needed
    queryFn: async ({ signal }) => {
      const response = await fetchCourseTypes(token, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch course types');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

export const useCreateCourseTypeMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => createCourseType(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['courseTypes'] });
      }
    }
  });
};

// --- COURSES ---

/**
 * Hook for fetching all courses
 */
export const useCoursesQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.courses.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchCourses(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch courses');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

/**
 * Hook for fetching a single course detail
 */
export const useCourseDetailQuery = (id) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: async ({ signal }) => {
      const response = await fetchCourseDetail(token, id, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch course details');
      }
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!id,
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
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      }
    }
  });
};

// --- PACKAGES ---

export const usePackagesQuery = (filter = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['packages', filter],
    queryFn: async ({ signal }) => {
      const response = await fetchPackages(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch packages');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

export const usePackageDetailQuery = (id) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['packages', 'detail', id],
    queryFn: async ({ signal }) => {
      const response = await fetchPackageDetail(token, id, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch package details');
      }
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!id,
  });
};

export const useCreatePackageMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => createPackage(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['packages'] });
      }
    }
  });
};

export const useUpdatePackageMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updatePackage(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['packages'] });
        queryClient.invalidateQueries({ queryKey: ['packages', 'detail', id] });
      }
    }
  });
};
