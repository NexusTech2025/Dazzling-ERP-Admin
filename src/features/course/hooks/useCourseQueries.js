import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';

// IMPORT FROM REAL API
import { 
  fetchCourses, 
  fetchCourseDetail, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  fetchCourseTypes, 
  createCourseType 
} from '../api/course.api';

// IMPORT FROM MOCK API FOR REMAINING FEATURES (PACKAGES)
import { 
  fetchPackages, 
  createPackage, 
  fetchPackageDetail, 
  updatePackage 
} from '../api/course.mockApi';

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
    staleTime: Infinity,
    refetchOnMount: false,
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

// --- COURSES ---

/**
 * Hook for fetching all courses
 */
export const useCoursesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.course.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchCourses(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch courses');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: Infinity,
    refetchOnMount: false,
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
      const response = await fetchCourseDetail(token, id, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch course details');
      }
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!id,
    initialData: () => {
      if (!id) return undefined;
      const cachedDetail = queryClient.getQueryData(queryKeys.course.detail(id));
      if (cachedDetail) return cachedDetail;

      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.course.lists() });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData)) {
          const item = listData.find(c => c.course_id === id || c.id === id);
          if (item) return item;
        }
      }
      return undefined;
    },
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

// --- PACKAGES ---

export const usePackagesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.course.package.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchPackages(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch packages');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const usePackageDetailQuery = (id) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.course.package.detail(id),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.detail(id) });
      }
    }
  });
};
