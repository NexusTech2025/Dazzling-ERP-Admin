/**
 * React Query Cache-First Detail Resolver Pattern
 * 
 * This pattern optimizes detail views by attempting to resolve data from 
 * existing list query caches before falling back to a network request.
 */

export const useEntityDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.entity.detail(id),
    queryFn: async ({ signal }) => {
      // Step 1: Execute Action
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY, 
        { 
          target: 'Entity', 
          where: { entity_id: id },
          pagination: { limit: 1 }
        }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!id,
    
    // Step 2: Implement the Local Relation Resolver
    initialData: () => {
      if (!id) return undefined;
      
      // 1. Look into the specific detail cache first
      const cachedDetail = queryClient.getQueryData(queryKeys.entity.detail(id));
      if (cachedDetail) return cachedDetail;

      // 2. Fallback: Search all cached list variations (filters, pagination, etc.)
      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.entity.lists() });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData)) {
          // Robust ID matching (handles both 'id' and 'entity_id' conventions)
          const item = listData.find(e => e.entity_id === id || e.id === id);
          if (item) return item;
        }
      }
      return undefined;
    },

    // Step 3: Inherit Data Staleness
    // Ensures the UI knows exactly when the cached data was last updated
    initialDataUpdatedAt: () => 
      queryClient.getQueryState(queryKeys.entity.detail(id))?.dataUpdatedAt,

    // Step 4: Configure Stale Time
    // Prevent immediate background refetch if data was found in cache
    staleTime: 1000 * 60 * 5, // 5 Minutes
  });
};
