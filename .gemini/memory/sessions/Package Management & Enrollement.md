# Engineering Audit Log: Package Management & Relational Enrollment Query Engine

## 1. Session Summary

This session executed a comprehensive refactoring of the Package Management workspace and built a relational data access architecture for student enrollments. Key achievements include:

1. **Multi-Attribute Package Filter Engine**: Extracted package filtering into `usePackageFilter`, enabling synchronized multi-criteria selection across desktop and mobile workspaces.


2. **Component & Prop Consolidation**: Decoupled modal views, integrated `<MobileBaseLayout>`, and consolidated filter states into unified `filters` / `filterSetters` prop objects.


3. **Master Cache Query Strategy**: Authored `useEnrollmentsQuery` using a static master cache key (`queryKeys.enrollment.list(EMPTY_FILTER)`) combined with read-time `select` hydration and in-memory RAM filtering (`resolveEnrollmentList`) to eliminate query cache fragmentation.


4. **Relational Hydration & Schema Engine**: Defined `enrollment.schema.js`, registered normalization/hydration pipelines in `hydrate.js`, and established schema validation.


5. **Hook Composition & Separation of Concerns**: Refactored `usePackageStudent` to consume `usePackageEnrollmentsQuery`, separating raw enrollment data retrieval from student profile cache hydration.


6. **Parallel App Hydration Guard**: Updated `HydrationGuard.jsx` to fetch relational enrollments via `data_query` concurrently alongside flat ERP sheet hydration.


7. **UI Componentization**: Authored the production-ready `PackageEnrollmentCard` derived strictly from hydrated enrollment models.



---

## 2. Files Modified

### Frontend (UI Components & Layouts)

* `src/routes/AppRoutes.jsx`

* `src/components/guards/HydrationGuard.jsx`

* `src/features/course/PackageDetails.jsx`

* `src/features/course/workspaces/PackageWorkspace.jsx`

* `src/features/course/components/CourseFilters.jsx`

* `src/features/course/components/MobilePackageListView.jsx`

* `src/features/course/components/CourseSelectionModal.jsx`

* `src/features/course/components/dektop/DesktopCourseSelectionModel.jsx`

* `src/features/course/components/mobile/MobileCourseSelectionModel.jsx`

* `src/features/course/components/PackageEnrollmentCard.jsx` *(Created)*

* `src/features/course/tabs/PackageEnrollmentsTab.jsx`

* `src/features/course/tabs/PackageRevenueTab.jsx`

* `src/pages/admin/TestButtons.jsx`


### State Hooks & Data Layer

* `src/features/course/hooks/usePackageFilter.js` *(Created)*

* `src/features/course/hooks/usePackageWorkspaceState.js`

* `src/features/course/hooks/usePackageQueries.js`

* `src/features/student/hooks/useEnrollmentQueries.js` *(Created)*

* `src/features/student/api/student.api.js`

* `src/hooks/useErpHydration.js`


### Caching, Schemas & Infrastructure

* `src/lib/react-query/queryKeys.js`

* `src/lib/react-query/cacheHelper.js`

* `src/lib/react-query/cacheStrategies.js`

* `src/lib/react-query/hydrate.js`

* `src/lib/react-query/schemaRegistry.js`

* `src/lib/react-query/schemas/enrollment.schema.js` *(Created)*


---

## 3. Chronological Implementation Tracking

### Task 1: Package Detail View Workspace Audit

* **The 'What'**: Audit `/admin/packages/:id` routing, page controller dependencies, and sub-tab data consumption.


* **The 'How'**: Analyzed `PackageDetails.jsx` layout controller, tab states, relational queries (`detail`, `enrollments`, `feeAccounts`), and header action handlers.


* **File References**:
* `src/routes/AppRoutes.jsx` (Lines 120–128)


* `src/features/course/PackageDetails.jsx` (Lines 45–110)





---

### Task 2: Encapsulated Multi-Criteria Package Filtering Engine in `usePackageFilter`

* **The 'What'**: Replaced segment-only filtering with multi-attribute filtering (class, medium, board, status, search query) across desktop and mobile layouts. Verified schema against `DazzlingDB/Config/Schema/Academic/Package.json`.


* **The 'How'**: Authored `usePackageFilter.js` to manage state, compute static select options, and memoize package array filtering. Delegated state from `usePackageWorkspaceState.js` while maintaining backward compatibility. Forced `isAcademicFilterActive = true` unconditionally so Board and Class dropdowns remain visible regardless of segment selection.


* **File References**:
* `src/features/course/hooks/usePackageFilter.js` (Lines 1–95)


* `src/features/course/hooks/usePackageWorkspaceState.js` (Lines 18–42)


* `src/features/course/components/CourseFilters.jsx` (Lines 30–85)


* `src/features/course/workspaces/PackageWorkspace.jsx` (Lines 50–105)


* `src/features/course/components/MobilePackageListView.jsx` (Lines 40–88)





#### Code Evidence

```javascript
// src/features/course/hooks/usePackageFilter.js
export const usePackageFilter = (packages = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Unconditionally keep board & class filters active
  const isAcademicFilterActive = true;

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch = !searchQuery || pkg.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || pkg.segment_id === segmentFilter;
      const matchesBoard = !boardFilter || pkg.board === boardFilter;
      const matchesClass = !classFilter || pkg.target_class === classFilter;
      const matchesStatus = !statusFilter || pkg.status === statusFilter;
      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesStatus;
    });
  }, [packages, searchQuery, segmentFilter, boardFilter, classFilter, statusFilter]);

  return { searchQuery, setSearchQuery, statusFilter, setStatusFilter, isAcademicFilterActive, filteredPackages };
};

```

#### Task-Level Insights & Future Actionability

* **Learning Key Points**: Hot-reload caching mismatches in Vite can cause `TypeError: observer.getOptimisticResult is not a function` in React Query. Solved by forcing client asset recompilation (`npx vite --force`) or clearing `.vite` cache.


* **Best Practices vs. Anti-Patterns**:
* *Best Practice*: Isolated complex filter memoization inside a dedicated custom hook (`usePackageFilter`).


* *Anti-Pattern Avoided*: Avoided duplicating state setters across desktop and mobile view components.




* **Future Session Action Items**: Synchronize filter states with URL query parameters (`useSearchParams`) for shareable workspace deep-linking.

---

### Task 3: Dynamic Category Option Mapping in `CourseSelectionModal`

* **The 'What'**: Fix bug where category selections failed to return courses due to hardcoded segment IDs (`SEG-ACA`) mismatching dynamic DB primary keys (`SEG1`, `SEG2`).


* **The 'How'**: Fetched dynamic segments via `useCourseTypesQuery()` inside `CourseSelectionModal.jsx`, mapped options, passed `segmentOptions` down to sub-views, and synchronized the `IB` board option.


* **File References**:
* `src/features/course/components/CourseSelectionModal.jsx` (Lines 35–82)





#### Task-Level Insights & Future Actionability

* **Learning Key Points**: Hardcoding entity identifiers in selection option lists introduces silent client-side mismatches when database seeds assign dynamic primary keys.


* **Best Practices vs. Anti-Patterns**:
* *Best Practice*: Sourced selection dropdown models dynamically from reactive backend schema queries.


* *Anti-Pattern Avoided*: Eliminated static hardcoded domain arrays for dynamic entities.




* **Future Session Action Items**: Implement dynamic schema type validation for board/medium options across all modal components.

---

### Task 4: Mobile Layout Refactoring to `<MobileBaseLayout>` & Prop Consolidation

* **The 'What'**: Decouple inline modal views, adapt mobile course selection to standard layout system, and consolidate prop signatures.


* **The 'How'**: Extracted child views into standalone modules (`DesktopCourseSelectionModel.jsx`, `MobileCourseSelectionModel.jsx`). Wrapped mobile layout inside `<MobileBaseLayout>` slots (`FilterSlot`, `TabsSlot`, `ListSlot`) and replaced raw button wrappers with atomic `Chip` components. Consolidated 10+ granular filter props into single `filters` and `filterSetters` objects.


* **File References**:
* `src/features/course/components/CourseSelectionModal.jsx` (Lines 20–65)


* `src/features/course/components/mobile/MobileCourseSelectionModel.jsx` (Lines 1–110)


* `src/features/course/components/dektop/DesktopCourseSelectionModel.jsx` (Lines 1–90)





#### Code Evidence

```javascript
// Consolidating filter props in parent modal
const filters = useMemo(() => ({
  search: searchQuery,
  segment: categoryFilter,
  board: boardFilter,
  class: classFilter,
  language: mediumFilter
}), [searchQuery, categoryFilter, boardFilter, classFilter, mediumFilter]);

const filterSetters = useMemo(() => ({
  setSearch: setSearchQuery,
  setSegment: setCategoryFilter,
  setBoard: setBoardFilter,
  setClass: setClassFilter,
  setLanguage: setMediumFilter
}), []);

```

#### Task-Level Insights & Future Actionability

* **Learning Key Points**: Consolidating multiple state parameters into cohesive objects prevents prop signature bloat and optimizes multi-field filter reset transactions.


* **Best Practices vs. Anti-Patterns**:
* *Best Practice*: Enforced design system consistency by using `<MobileBaseLayout>` slots and atomic `Chip` UI primitives.


* *Anti-Pattern Avoided*: Avoided prop drilling 10+ individual state getters and setters down component trees.




* **Future Session Action Items**: Refactor remaining modal views in the course feature module to adopt unified `filters` prop objects.

---

### Task 5: Engineered Relational `useEnrollmentsQuery` Hook with Progressive Caching

* **The 'What'**: Implement data access hook to fetch nested enrollment relations (`studentfeeaccounts` -> `feeplan`, `feeadjustments`, `installments` -> `payments`).


* **The 'How'**: Added `enrollment` cache namespace in `queryKeys.js`, configured `ENTITY_CONFIGS` entry in `cacheHelper.js`, implemented `fetchEnrollments` service endpoint in `student.api.js`, and authored `useEnrollmentQueries.js` utilizing `resolveList` and `getCachedList`.


* **File References**:
* `src/lib/react-query/queryKeys.js` (Lines 42–48)


* `src/lib/react-query/cacheHelper.js` (Lines 80–92)


* `src/features/student/api/student.api.js` (Lines 30–62)


* `src/features/student/hooks/useEnrollmentQueries.js` (Lines 1–65)


* `src/pages/admin/TestButtons.jsx` (Lines 25–58)





---

### Task 6: Normalization and Relational Hydration for `Enrollment` Entities

* **The 'What'**: Transform raw enrollment responses and inject relational student dependencies.


* **The 'How'**: Authored `normalizeEnrollment` to parse stringified `metadata` JSON strings and standardize entity IDs. Authored `hydrateEnrollment` to scan active `student` cache namespaces (`queryKeys.student.list/detail`) and map parent `student` objects to `enrollment.student` and nested `studentfeeaccounts` items. Registered normalizer/hydrator handlers in `hydrate.js`.


* **File References**:
* `src/lib/react-query/hydrate.js` (Lines 140–195)





#### Code Evidence

```javascript
// src/lib/react-query/hydrate.js
export function normalizeEnrollment(enrollment) {
  if (!enrollment) return enrollment;
  const id = enrollment.enrollment_id || enrollment.id;
  let metadata = enrollment.metadata;
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch (e) { metadata = {}; }
  }
  return { ...enrollment, id, enrollment_id: id, metadata };
}

export function hydrateEnrollment(enrollment, queryClient) {
  if (!enrollment) return enrollment;
  const normalized = normalizeEnrollment(enrollment);
  const students = queryClient.getQueryData(queryKeys.student.list(EMPTY_FILTER)) || [];
  const matchingStudent = students.find(s => (s.student_id || s.id) === normalized.student_id) || null;

  return {
    ...normalized,
    student: matchingStudent,
    studentfeeaccounts: (normalized.studentfeeaccounts || []).map(acc => ({
      ...acc,
      student: matchingStudent
    }))
  };
}

```

---

### Task 7: Authored `enrollment.schema.js` Data Validation Model

* **The 'What'**: Resolve `[ValidationEngine] No schema registered for entity type: "enrollment"` runtime warning.


* **The 'How'**: Authored `enrollment.schema.js` with field definitions (`enrollment_id`, `student_id`, `item_id`, `status`, `metadata`, etc.) and registered `enrollment: enrollmentSchema` in `schemaRegistry.js`.


* **File References**:
* `src/lib/react-query/schemas/enrollment.schema.js` (Lines 1–45)


* `src/lib/react-query/schemaRegistry.js` (Lines 15–32)





---

### Task 8: Master Query Cache & Strategy-Based In-Memory Filtering (`resolveEnrollmentList`)

* **The 'What'**: Eliminate cache key fragmentation caused by passing dynamic filter objects into TanStack Query keys.


* **The 'How'**:
1. Updated `prepareFilters` in `cacheStrategies.js` to strip pagination parameters (`limit`, `offset`, `page`, `sort`, `order`).


2. Implemented `resolveEnrollmentList` strategy in `cacheStrategies.js` to execute RAM filtering against cached master collections without applying array slicing.


3. Bound `useEnrollmentsQuery` to a static Master Cache Key (`queryKeys.enrollment.list(EMPTY_FILTER)`) and applied hydration + filtering in `select`.


4. Updated `cacheHelper.js` (`isGlobalList`) so `getCachedList` recognizes keys with pagination controls as candidate targets for RAM strategy resolution.




* **File References**:
* `src/lib/react-query/cacheStrategies.js` (Lines 40–82)


* `src/lib/react-query/cacheHelper.js` (Lines 275–295)


* `src/features/student/hooks/useEnrollmentQueries.js` (Lines 20–58)





#### Code Evidence

```javascript
// src/features/student/hooks/useEnrollmentQueries.js
export const useEnrollmentsQuery = (filter = EMPTY_FILTER, options = {}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { enabled = true } = options;

  return useQuery({
    // 🔒 Static master cache key prevents query cache key fragmentation
    queryKey: queryKeys.enrollment.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(queryClient, 'enrollment', filter, async () => {
        const response = await fetchEnrollments(token, EMPTY_FILTER, { signal });
        if (!response.success) throw new Error(response.message || 'Failed to fetch enrollments');
        return response.data?.data || [];
      });
    },
    select: (data) => {
      const hydrated = hydrateRecord('enrollment', data, queryClient);
      if (!filter || filter === EMPTY_FILTER || Object.keys(filter).length === 0) return hydrated;
      return resolveEnrollmentList(hydrated, filter);
    },
    enabled: !!token && enabled,
    initialData: () => getCachedList(queryClient, 'enrollment', filter),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });
};

```

#### Task-Level Insights & Future Actionability

* **Learning Key Points**: Dynamic objects inside React Query keys create isolated cache entries. Sourcing views from a single Master Cache Key with client-side `select` filtering guarantees global reactivity across all subscribers when any record mutates.


* **Best Practices vs. Anti-Patterns**:
* *Best Practice*: Applied Master Cache + Read-Time Selection Strategy.


* *Anti-Pattern Avoided*: Prevented Dynamic Query Key Fragmentation where identical backend items are stored across separate query key slots.




* **Future Session Action Items**: Audit existing query hooks (`useBatchQueries`, `useCourseQueries`) to migrate from fragmented filter keys to Master Cache `select` filtering.

---

### Task 9: Re-Engineered `usePackageStudent` and `usePackageEnrollmentsQuery` Hooks

* **The 'What'**: Eliminate multi-step network request cascades (`usePackageDetailQuery` -> `packageitems` -> `useEnrollmentsQuery`) and enforce separation of responsibilities between raw enrollment retrieval and student profile hydration.


* **The 'How'**:
1. Authored `usePackageEnrollmentsQuery(packageId)` to call `useEnrollmentsQuery({ item_id: packageId })` directly.


2. Authored `usePackageStudent(packageId)` to compose with `usePackageEnrollmentsQuery`, extract unique `student_id`s, prioritize `enrollment.student`, and fallback to `getCachedRecord(queryClient, 'student', student_id)` if missing.


3. Removed artificial fallback object generation (`{ student_name: 'Student (...)' }`) to enforce strict record integrity.




* **File References**:
* `src/features/course/hooks/usePackageQueries.js` (Lines 210–270)





#### Code Evidence

```javascript
// src/features/course/hooks/usePackageQueries.js
export const usePackageEnrollmentsQuery = (packageId) => {
  const queryFilter = useMemo(() => packageId ? { item_id: packageId } : null, [packageId]);
  return useEnrollmentsQuery(queryFilter || EMPTY_FILTER, { enabled: !!packageId });
};

export const usePackageStudent = (packageId) => {
  const queryClient = useQueryClient();
  const enrollmentsQuery = usePackageEnrollmentsQuery(packageId);

  const students = useMemo(() => {
    if (!enrollmentsQuery.data) return [];
    const seen = new Set();
    const result = [];

    for (const enrollment of enrollmentsQuery.data) {
      if (enrollment.student_id && !seen.has(enrollment.student_id)) {
        seen.add(enrollment.student_id);
        const studentProfile = enrollment.student || getCachedRecord(queryClient, 'student', enrollment.student_id);
        if (studentProfile) result.push(studentProfile);
      }
    }
    return result;
  }, [enrollmentsQuery.data, queryClient]);

  return { data: students, isLoading: enrollmentsQuery.isLoading, error: enrollmentsQuery.error };
};

```

---

### Task 10: Parallel Application Initialization Guard in `HydrationGuard.jsx`

* **The 'What'**: Separate flat sheet batch reads (`sheet_batch_read`) from relational server queries (`data_query`) during application boot.


* **The 'How'**: Reverted inline modifications to `useErpHydration.js`, maintaining its focus on flat sheet tables (`Course`, `Batch`, `Teacher`, `Student`, `Branch`, `Package`). Added concurrent execution of `useEnrollmentsQuery` inside `HydrationGuard.jsx` using `API_REGISTRY.DATA.QUERY` (`data_query`).


* **File References**:
* `src/components/guards/HydrationGuard.jsx` (Lines 12–42)


* `src/hooks/useErpHydration.js` (Lines 1–80)





---

### Task 11: Designed & Implemented `PackageEnrollmentCard` & Modularized `PackageEnrollmentsTab`

* **The 'What'**: Extract loading/empty states in `PackageEnrollmentsTab.jsx` into memoized subcomponents, and build `PackageEnrollmentCard` derived from hydrated enrollment models.


* **The 'How'**:
1. Authored `EnrollmentsLoadingSkeleton` and `EnrollmentsEmptyState` in `PackageEnrollmentsTab.jsx`.


2. Created `PackageEnrollmentCard.jsx` mapping hydrated fields (`enrollment.student`, `feeAccount.final_fee`, `balance_due`, `amount_paid`), dynamic progress bar, installment stepper timeline (`✔` paid checks, `○` pending circles), last payment details, and next due details.


3. Removed all mock/prototype data fallbacks.




* **File References**:
* `src/features/course/components/PackageEnrollmentCard.jsx` (Lines 1–135)


* `src/features/course/tabs/PackageEnrollmentsTab.jsx` (Lines 1–85)





#### Code Evidence

```javascript
// src/features/course/components/PackageEnrollmentCard.jsx
export const PackageEnrollmentCard = memo(({ enrollment }) => {
  const student = enrollment?.student;
  const studentName = student?.full_name || student?.student_name || enrollment?.student_id;
  const feeAccount = enrollment?.studentfeeaccounts?.[0];
  
  const totalFee = feeAccount?.final_fee ?? feeAccount?.total_fee ?? 0;
  const amountPaid = feeAccount?.amount_paid ?? 0;
  const balanceDue = feeAccount?.balance_due ?? 0;
  const progressPercent = totalFee > 0 ? Math.min(100, Math.round((amountPaid / totalFee) * 100)) : 0;
  const installments = feeAccount?.installments || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      {/* Student Identity Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:slate-200">
            {studentName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{studentName}</h4>
            <span className="text-xs text-slate-500 font-mono">{enrollment.student_id}</span>
          </div>
        </div>
        <Badge variant={enrollment.status === 'active' ? 'success' : 'neutral'}>{enrollment.status}</Badge>
      </div>

      {/* Progress & Financial Bar */}
      <div className="space-y-1.5 my-3">
        <div className="flex justify-between text-xs font-semibold">
          <span>₹{amountPaid.toLocaleString()} Paid</span>
          <span className="text-slate-500">{progressPercent}%</span>
          <span className="text-amber-600 dark:text-amber-400">₹{balanceDue.toLocaleString()} Due</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Installment Stepper Timeline */}
      <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 my-3">
        {installments.map((inst, idx) => (
          <div key={inst.installment_id || idx} className="flex items-center gap-1">
            <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
              inst.status === 'paid' ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 dark:border-slate-700 text-slate-400'
            }`}>
              {inst.status === 'paid' ? '✓' : idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

```

---

## 4. Architectural Learnings & Patterns

* **Master Cache + Read-Time Selection Strategy**: Sourcing dataset queries from a single static query key (`queryKeys.enrollment.list(EMPTY_FILTER)`) and executing filtration/hydration inside `select` eliminates query cache fragmentation and maintains reactivity across all consuming components.


* **Separation of Data Access vs. Relational Hydration**: Separating raw enrollment fetching (`usePackageEnrollmentsQuery`) from student profile hydration (`usePackageStudent`) ensures individual hooks adhere to the Single Responsibility Principle and can be composed modularly.


* **In-Memory Strategy Resolution**: Stripping pagination parameters (`limit`, `offset`) prior to evaluating active filter entries allows global cached datasets to fulfill subset queries in RAM without firing unnecessary network requests.



---

## 5. Future Roadmap

* [ ] Add `useSearchParams` URL state binding to `usePackageFilter` for persistent workspace filtering across route navigations.
* [ ] Audit and migrate `useBatchQueries` and `useCourseQueries` from dynamic filter query keys to the Master Cache `select` strategy.
* [ ] Extend `usePackageStudent` to support multi-package comparison hydration.

---

## 6. Knowledge Graph & Data Flow

### Entity Relationships

```
[HydrationGuard]
       │
       ├──► Invokes Concurrent Bootstrapping
       │         │
       │         ├──► [useErpHydration] ──► Fetches Flat Sheets (Course, Batch, Package)
       │         │
       │         └──► [useEnrollmentsQuery] ──► Executes API_REGISTRY.DATA.QUERY (data_query)
       │
[PackageDetails View]
       │
       ├──► Consumes ──► [usePackageEnrollmentsQuery] ──► Filters Master Cache by { item_id: packageId }
       │                         │
       │                         ▼
       │              [PackageEnrollmentsTab] ──► Renders ──► [PackageEnrollmentCard]
       │
       └──► Consumes ──► [usePackageStudent] ──► Extracts student_id ──► Hydrates via [student] Cache

```

### Data Flow Diagram: Master Cache & In-Memory Strategy Resolution Pipeline

```
                       Component Request
            useEnrollmentsQuery({ item_id: 'PKG-8E7F42CE' })
                               │
                               ▼
                        Query Key Anchor
             ['enrollment', 'list', { filter: {} }]
                               │
                               ▼
                    TanStack Query Cache Check
                               │
        ┌──────────────────────┴──────────────────────┐
        │ Cache Hit                                   │ Cache Miss
        ▼                                             ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│ Retrieve Master Dataset │               │ Fetch via API Endpoint  │
└───────────┬─────────────┘               │ (fetchEnrollments)      │
            │                             └────────────┬────────────┘
            │                                          │
            └──────────────────┬───────────────────────┘
                               │
                               ▼
                   Query `select` Transformation
                               │
                               ▼
┌────────────────────────────────────────────────────────┐
│ 1. Relational Hydration (hydrateRecord)                │
│    - Normalizes metadata JSON string                   │
│    - Stitches matching Student object from cache       │
└──────────────────────────────┬─────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────┐
│ 2. In-Memory Strategy Resolution (resolveEnrollmentList)│
│    - Strips pagination controls (limit/offset)         │
│    - Filters records in RAM matching { item_id }       │
└──────────────────────────────┬─────────────────────────┘
                               │
                               ▼
                    Returned Hydrated Dataset
                Rendered by PackageEnrollmentCard

```