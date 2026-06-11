import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { normalizeCourse, normalizeCourseList } from '../utils/courseMappers';
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
  deleteCourseType,
  fetchPackages,
  fetchPackageItems,
  fetchPackagePerks,
  fetchPackageDetail,
  createPackage,
  updatePackage,
  deletePackage
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
    select: normalizeCourseList,
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
      return normalizeCourse(response.data?.data?.[0] || null);
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
          if (item) return normalizeCourse(item);
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

/**
 * Ensures relation catalogs (Courses and PackageItems) are loaded in the query client cache.
 * 
 * @async
 * @function ensurePackageRelations
 * @param {QueryClient} queryClient - The active TanStack QueryClient instance.
 * @param {string} token - Authorization token.
 * @returns {Promise<void>}
 */
export const ensurePackageRelations = async (queryClient, token) => {
  await Promise.all([
    queryClient.ensureQueryData({
      queryKey: queryKeys.course.list(EMPTY_FILTER),
      queryFn: async () => {
        const res = await fetchCourses(token, EMPTY_FILTER);
        if (!res.success) throw new Error(res.message || 'Failed to fetch courses');
        return res.data?.data || [];
      }
    }),
    queryClient.ensureQueryData({
      queryKey: queryKeys.course.packageItem.list(),
      queryFn: async () => {
        const res = await fetchPackageItems(token);
        if (!res.success) throw new Error(res.message || 'Failed to fetch package items');
        return res.data?.data || [];
      }
    }),
    queryClient.ensureQueryData({
      queryKey: queryKeys.course.packagePerk.list(),
      queryFn: async () => {
        const res = await fetchPackagePerks(token);
        if (!res.success) throw new Error(res.message || 'Failed to fetch package perks');
        return res.data?.data || [];
      }
    })
  ]);
};

/**
 * Hydrates a package record by scanning the PackageItems cache for courses.
 * 
 * @function hydratePackageRelations
 * @param {object} pkg - The raw package record.
 * @param {QueryClient} queryClient - The active TanStack QueryClient instance.
 * @returns {object} Hydrated package record with included_courses array.
 */
export const hydratePackageRelations = (pkg, queryClient) => {
  if (!pkg) return null;

  const packageItems = queryClient.getQueryData(queryKeys.course.packageItem.list()) || [];
  const courses = queryClient.getQueryData(queryKeys.course.list(EMPTY_FILTER)) || [];
  const packagePerks = queryClient.getQueryData(queryKeys.course.packagePerk.list()) || [];
  
  // Find all items associated with this package
  const items = packageItems.filter(item => item.package_id === pkg.package_id);
  
  // Map items to include their full course objects
  const hydratedItems = items.map(item => {
    const course = courses.find(c => c.course_id === item.entity_id);
    return {
      ...item,
      course
    };
  });

  // Extract entity_id (pointing to course_id) for compatibility
  const includedCourses = items
    .filter(item => item.entity_type === 'course' || item.entity_type === 'subject')
    .map(item => item.entity_id);

  const resolvedCourses = courses.filter(c => includedCourses.includes(c.course_id));

  // Find all perks associated with this package
  const perks = packagePerks.filter(perk => perk.package_id === pkg.package_id);

  return {
    ...pkg,
    included_courses: includedCourses,
    courses: resolvedCourses,
    package_items: hydratedItems,
    perks: perks
  };
};

export const usePackagesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.course.package.list(filter),
    queryFn: async ({ signal }) => {
      await ensurePackageRelations(queryClient, token);
      const response = await fetchPackages(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch packages');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    select: (data) => {
      const hydrated = (data || []).map(pkg => hydratePackageRelations(pkg, queryClient));
      console.log('[usePackagesQuery] Loaded and Hydrated Packages:', hydrated);
      return hydrated;
    },
    staleTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

export const usePackageDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.course.package.detail(id),
    queryFn: async ({ signal }) => {
      await ensurePackageRelations(queryClient, token);
      const response = await fetchPackageDetail(token, id, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch package details');
      }
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!id,
    initialData: () => {
      if (!id) return undefined;
      const cachedDetail = queryClient.getQueryData(queryKeys.course.package.detail(id));
      if (cachedDetail) return cachedDetail;

      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.course.package.all });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData)) {
          const item = listData.find(p => p.package_id === id);
          if (item) return item;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.course.package.detail(id))?.dataUpdatedAt,
    select: (data) => hydratePackageRelations(data, queryClient),
    staleTime: 1000 * 60 * 5,
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
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
      }
    }
  });
};

export const useDeletePackageMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => {
      console.log('[useDeletePackageMutation] Deleting Package ID:', id);
      return deletePackage(token, id, options);
    },
    onSuccess: (response) => {
      console.log('[useDeletePackageMutation] API Response:', response);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
      }
    },
    onError: (err) => {
      console.error('[useDeletePackageMutation] API Error:', err);
    }
  });
};

export const usePackageItemsQuery = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.course.packageItem.list(),
    queryFn: async () => {
      const res = await fetchPackageItems(token);
      if (!res.success) throw new Error(res.message || 'Failed to fetch package items');
      return res.data?.data || [];
    },
    enabled: !!token,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
