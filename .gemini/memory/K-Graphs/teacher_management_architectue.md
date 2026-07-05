An architectural analysis of the provided codebase confirms a highly unified **Teacher Component Subsystem** utilizing a strict layout-driven design system. State mutations and global fetches are handled dynamically via TanStack Query integrations, while core primitives (Cards, Forms, Timelines) construct the presentation architecture.

Here is the structured analysis followed by the corresponding knowledge graph.

---

## Teacher Component Component Analysis

### 1. Architectural Structure

The subsystem is broken down into four structural zones:

* **API Layer (`teacher.api.js`):** Interacts natively with central system registers (`API_REGISTRY.DATA` and `API_REGISTRY.STAFF`), wrapping payload mapping routines for asynchronous execution.
* **Data Hook Infrastructure (`useTeacherQueries.js`):** Extends TanStack React Query to implement global queries and targeted mutations, utilizing explicit cache invalidations to update downstream components dynamically.
* **Page/Feature Managers (`TeacherAttendanceManager.jsx`, `TeacherSelectionModal.jsx`):** Root dashboard panels orchestrating composite layouts, multi-layered lookups, dynamic analytics, state diffing, and user action flows.
* **Granular Presentation Layer (`TeacherCard.jsx`, `TeacherForm.jsx`, etc.):** Decoupled, multi-density design modules implementing strict schema configurations, client validations, and modular slots.

### 2. Dependency Infrastructure

* **Data Routing:** `apiClient` / `API_REGISTRY` $\rightarrow$ `teacher.api.js` $\rightarrow$ `useTeacherQueries.js` $\rightarrow$ Presentation Layer.
* **Shared Primitives:** The layer imports system core wrappers (`MainLayout`, `Card`, `DataTable`, `Badge`, `Avatar`, `Timeline`, `KeyValuePair`).
* **Cross-Domain Interaction:** Integrates directly with the `Batch` subdomain hooks (`useBatchesQuery`) to parse weekly schedule models, room locations, and enrollment metrics ($E_{ratio} = \frac{\text{enrolled}}{\text{capacity}} \times 100$).

---

## Subsystem Knowledge Graph (JSON Representation)

```json
{
  "subsystem": "Teacher Management Architecture",
  "nodes": [
    {
      "id": "teacher.api.js",
      "type": "API Layer Module",
      "purpose": "Provides clean abstraction wrappers over central data protocols, mapping runtime params directly into data action configurations.",
      "references": [
        "../../../services/apiClient",
        "../../../services/apiRegistry"
      ]
    },
    {
      "id": "useTeacherQueries.js",
      "type": "State & Fetch Hooks Layer",
      "purpose": "Manages network operations, initial cache staging, cache lookups, and precise pipeline invalidation trees upon query resolution.",
      "references": [
        "@tanstack/react-query",
        "../../../context/AuthContextCore",
        "../../../lib/react-query/queryKeys",
        "../../../services/apiClient",
        "../../../services/apiRegistry",
        "../../../lib/react-query/cacheHelper"
      ]
    },
    {
      "id": "TeacherAttendanceManager.jsx",
      "type": "Feature Controller / Presenter",
      "purpose": "Orchestrates batch-filtered daily check-in workflows, status filters, bulk record staging, dirty-state validations, and role-based permissions logic.",
      "references": [
        "@tanstack/react-query",
        "../hooks/useTeacherQueries",
        "../../batch/hooks/useBatchQueries",
        "../../../lib/react-query/queryKeys",
        "../../../context/AuthContextCore",
        "../../../lib/dateUtils",
        "../../../components/layout/MainLayout",
        "../../../components/ui/Breadcrumbs",
        "../../../components/ui/DataTable",
        "../../../components/ui/filters",
        "../../../components/ui/btn/RefreshButton"
      ]
    },
    {
      "id": "TeacherCard.jsx",
      "type": "Presentation Component",
      "purpose": "Encapsulates adaptive information layouts via discrete density options ('low', 'medium', 'high'), managing tag rendering and user action buttons.",
      "references": [
        "../../../components/ui/v2/cards",
        "../../../components/ui/v2/Button",
        "../../../components/ui/v2/indicators"
      ]
    },
    {
      "id": "TeacherForm.jsx",
      "type": "Form Manager Component",
      "purpose": "Decoupled form state controller governing biometric onboarding inputs, account registration setups, financial settings, and course assignment modals.",
      "references": [
        "react-router-dom",
        "../../../components/ui/v2/FormSection",
        "../../../components/ui/v2/FormField",
        "../../../components/ui/v2/TextInput",
        "../../../components/ui/v2/SelectInput",
        "../../../components/ui/v2/DateInput",
        "../../../components/ui/v2/PhoneInput",
        "../../../components/ui/v2/FileUpload",
        "../../../components/ui/v2/RadioGroup",
        "../../../components/ui/v2/ToggleSwitch",
        "../../../components/ui/v2/SegmentedControl",
        "../../course/components/CourseSelectionModal",
        "../../../components/ui/v2/Button",
        "../../../components/layout/MainLayout"
      ]
    },
    {
      "id": "TeacherSelectionModal.jsx",
      "type": "Responsive Interface Modal",
      "purpose": "Provides dual-viewport (desktop split sidebar grid vs mobile accordion stack) interactions for multi-criteria search and faculty assignment.",
      "references": [
        "./TeacherCard",
        "../../../components/ui/v2/indicators"
      ]
    },
    {
      "id": "TeachersMobileView.jsx",
      "type": "Mobile Presentation Viewport",
      "purpose": "Renders an inline-expandable list of high-density cards for small screens, embedding action nodes to execute cascading detail, edit, and deletion routines.",
      "references": [
        "../../../components/ui/v2/cards/ExpandableLowDensityCard",
        "../../../components/ui/v2/indicators"
      ]
    },
    {
      "id": "TeacherAssignedClasses.jsx",
      "type": "Profile Dashboard Subcard",
      "purpose": "Calculates cross-domain metadata mappings to extract, calculate, and present classroom enrollment metrics and multi-day scheduling frames.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/Badge",
        "../../../../components/ui/v2/Button",
        "../../../batch/hooks/useBatchQueries"
      ]
    },
    {
      "id": "TeacherContactDetails.jsx",
      "type": "Profile Presentation Subcard",
      "purpose": "Exposes demographic properties utilizing standard core KeyValuePair layout elements with system indicators.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KeyValuePair"
      ]
    },
    {
      "id": "TeacherDocumentsCard.jsx",
      "type": "Profile Document Controller",
      "purpose": "Lists specific file attachments, identifying proof signatures and academic dossiers with direct access utilities.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "TeacherPersonalInfo.jsx",
      "type": "Profile Presentation Subcard",
      "purpose": "Displays core biometric parameters by re-mapping raw strings into verified data layouts.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KeyValuePair"
      ]
    },
    {
      "id": "TeacherProfessionalCard.jsx",
      "type": "Profile Contextual Subcard",
      "purpose": "Combines active profile schemas with finance configs to present operational parameters alongside administrative notes.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KeyValuePair",
        "../../hooks/useTeacherQueries"
      ]
    },
    {
      "id": "TeacherProfessionalLog.jsx",
      "type": "Profile Logging Interface",
      "purpose": "Builds a reverse-chronological view tracking internal history modifications and operational items.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/Timeline",
        "../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "TeacherProfileHeader.jsx",
      "type": "Composite Structural Hero Section",
      "purpose": "Serves as the main profile identity header, handling unified status indicators, core actions, and multi-tab routing switches.",
      "references": [
        "react-router-dom",
        "../../../../components/ui/Badge",
        "../../../../components/ui/v2/Avatar",
        "../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "TeacherSalarySnapshot.jsx",
      "type": "Financial Analytics Subcard",
      "purpose": "Presents a high-level summary of pay cycles, processing statuses, and payout amounts.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/Badge"
      ]
    },
    {
      "id": "TeachersAttendance.jsx",
      "type": "Complex Calendar Domain Interface",
      "purpose": "Builds a calendar interface executing metrics calculations (shift lengths, scores) while rendering daily exception sheets and punch editors.",
      "references": [
        "../../hooks/useTeacherQueries",
        "../../../../context/AuthContextCore",
        "../../../../lib/dateUtils"
      ]
    }
  ],
  "edges": [
    { "source": "useTeacherQueries.js", "target": "teacher.api.js", "relation": "wraps_and_caches_asynchronous_requests" },
    { "source": "TeacherAttendanceManager.jsx", "target": "useTeacherQueries.js", "relation": "consumes_queries_and_bulk_mutations" },
    { "source": "TeacherProfessionalCard.jsx", "target": "useTeacherQueries.js", "relation": "fetches_salary_configuration" },
    { "source": "TeachersAttendance.jsx", "target": "useTeacherQueries.js", "relation": "executes_presents_and_mutates_daily_punches" },
    { "source": "TeacherSelectionModal.jsx", "target": "TeacherCard.jsx", "relation": "renders_nested_instances_based_on_viewport" },
    { "source": "TeacherSelectionModal.jsx", "target": "TeachersMobileView.jsx", "relation": "delegates_mobile_layout_rendering" },
    { "source": "TeacherProfileHeader.jsx", "target": "TeacherCard.jsx", "relation": "shares_identity_schema_context" }
  ]
}

```