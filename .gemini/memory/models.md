# ERP Application Popup Modal Reference

This document catalogs and defines all interactive popup modal (popup model) components utilized across the **Dazzling ERP Admin** web application. It specifies their file locations, prop signatures, functional roles, and usage patterns.

---

## 1. Shared UI Modals

### ConfirmModal
* **File Location**: [ConfirmModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx)
* **Functional Role**: Standardized confirmation dialog for high-risk actions (such as deletion). It features a multi-state processing screen (`idle`, `processing`, `success`, `error`) to prevent premature dismissal.
* **Prop Signature**:
  ```typescript
  interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string; // Default: "Confirm Action"
    message?: string; // Default: "Are you sure you want to proceed?"
    confirmText?: string; // Default: "Delete"
    cancelText?: string; // Default: "Cancel"
    isProcessing?: boolean;
    status?: 'idle' | 'processing' | 'success' | 'error'; // Default: 'idle'
    resultMessage?: string | null;
  }
  ```
* **Example Usage**:
  ```jsx
  import ConfirmModal from '../components/ui/ConfirmModal';

  const MyComponent = () => {
    const [modal, setModal] = useState({ isOpen: false, status: 'idle', id: null });
    const deleteMutation = useDeleteMutation();

    const handleConfirm = () => {
      setModal(prev => ({ ...prev, status: 'processing' }));
      deleteMutation.mutate({ id: modal.id }, {
        onSuccess: () => setModal(prev => ({ ...prev, status: 'success' })),
        onError: () => setModal(prev => ({ ...prev, status: 'error' }))
      });
    };

    return (
      <ConfirmModal
        isOpen={modal.isOpen}
        status={modal.status}
        onClose={() => setModal({ isOpen: false, status: 'idle', id: null })}
        onConfirm={handleConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action is permanent."
      />
    );
  };
  ```

---

### APIErrorModal
* **File Location**: [APIErrorModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/APIErrorModal.jsx)
* **Functional Role**: Custom error dialog designed to replace default browser alerts. It features collapsible technical detail logs and a quick clipboard copy feature.
* **Prop Signature**:
  ```typescript
  interface APIErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string; // Default: "API Execution Error"
    error?: Error | { name?: string; message?: string; details?: string; stack?: string } | string | null;
    onRetry?: (() => void) | null;
    retryText?: string; // Default: "Try Again"
  }
  ```
* **Example Usage**:
  ```jsx
  import APIErrorModal from '../components/ui/APIErrorModal';

  const App = () => {
    const [error, setError] = useState(null);

    return (
      <APIErrorModal
        isOpen={!!error}
        error={error}
        onClose={() => setError(null)}
        onRetry={() => refetchData()}
      />
    );
  };
  ```

---

## 2. Core / System Modals

### BranchFormModal
* **File Location**: [BranchFormModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/core/components/BranchFormModal.jsx)
* **Functional Role**: Dual-purpose form modal used to either **Create** or **Edit** operational branches. Internally binds inputs to Atomic V2 wrappers (`FormField`, `TextInput`, `SelectInput`).
* **Prop Signature**:
  ```typescript
  interface BranchFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: { branch_name: string; location: string; status: string }) => void;
    initialData?: { branch_name?: string; location?: string; status?: string } | null;
    isPending?: boolean;
    error?: string | null;
  }
  ```
* **Example Usage**:
  ```jsx
  import BranchFormModal from '../features/core/components/BranchFormModal';

  const BranchView = () => {
    const [isOpen, setIsOpen] = useState(false);
    const updateMutation = useUpdateBranch();

    return (
      <BranchFormModal
        isOpen={isOpen}
        initialData={activeBranch}
        isPending={updateMutation.isPending}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => updateMutation.mutate(data, { onSuccess: () => setIsOpen(false) })}
      />
    );
  };
  ```

---

## 3. Academic / Selector Modals

### BatchSelectionModal
* **File Location**: [BatchSelectionModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchSelectionModal.jsx)
* **Functional Role**: Split-pane selector layout enabling admins to assign students to active batch categories. Features a search bar and branch filters on a left sidebar, with matching `BatchCard` elements rendered in a main pane.
* **Prop Signature**:
  ```typescript
  interface BatchSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (batch: Object) => void;
    selectedBatchId?: string | number | null;
    availableBatches?: Array<Object>;
    isLoading?: boolean;
  }
  ```
* **Example Usage**:
  ```jsx
  import BatchSelectionModal from '../features/batch/components/BatchSelectionModal';

  const AssignBatch = () => {
    const [open, setOpen] = useState(false);
    const { data: batches } = useBatchesQuery();

    return (
      <BatchSelectionModal
        isOpen={open}
        availableBatches={batches}
        onClose={() => setOpen(false)}
        onSelect={(batch) => handleBatchAssignment(batch)}
      />
    );
  };
  ```

---

### CourseSelectionModal
* **File Location**: [CourseSelectionModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseSelectionModal.jsx)
* **Functional Role**: A high-fidelity, multi-pane course selection modal that allows filtering by academic segments, languages, Medium, and Boards. Supports both single-select (radio-style) and multi-select (checkbox-style) modes.
* **Prop Signature**:
  ```typescript
  interface CourseSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selected: Array<Object> | Object) => void;
    selectedCourses?: Array<Object> | Object;
    availableCourses?: Array<Object>;
    singleSelect?: boolean; // Default: false
  }
  ```
* **Example Usage**:
  ```jsx
  import CourseSelectionModal from '../features/course/components/CourseSelectionModal';

  const CourseSelector = () => {
    const [open, setOpen] = useState(false);

    return (
      <CourseSelectionModal
        isOpen={open}
        singleSelect={true}
        selectedCourses={chosenCourse}
        onClose={() => setOpen(false)}
        onSelect={(course) => setChosenCourse(course)}
      />
    );
  };
  ```

---

### CreateCourseTypeModal
* **File Location**: [CreateCourseTypeModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CreateCourseTypeModal.jsx)
* **Functional Role**: Minimal modal wrapper designed to register a new Segment/Course Category (e.g. Academy, Computer). Bypasses TanStack Query mutations to call `executeAction('ACADEMIC.CREATE_COURSE_TYPE')` directly.
* **Prop Signature**:
  ```typescript
  interface CreateCourseTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (newSegment: Object) => void;
  }
  ```

---

### PerksSelectionModal
* **File Location**: [PerksSelectionModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/PerksSelectionModal.jsx)
* **Functional Role**: Modal grid interface used to assign course perks or discounts. Contains a pre-defined library of master perks alongside inputs to register a new, ad-hoc custom perk.
* **Prop Signature**:
  ```typescript
  interface PerksSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (perks: Array<Object>) => void;
    selectedPerks?: Array<Object>;
  }
  ```

---

### TeacherSelectionModal
* **File Location**: [TeacherSelectionModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/TeacherSelectionModal.jsx)
* **Functional Role**: Split-pane grid interface used to assign faculty members. Contains a vertical filter sidebar (Status, Specialization, Type) and matches selections based on teacher cards.
* **Prop Signature**:
  ```typescript
  interface TeacherSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selected: Array<Object> | Object) => void;
    selectedTeacher?: Array<Object> | Object | null;
    availableTeachers?: Array<Object>;
    singleSelect?: boolean; // Default: true
  }
  ```

---

## 4. Finance Modals

### RecordPaymentModal
* **File Location**: [RecordPaymentModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/RecordPaymentModal.jsx)
* **Functional Role**: Transaction logging sheet. Binds form parameters to execute installment payment mutations on backend ledger sheets.
* **Prop Signature**:
  ```typescript
  interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    installment: {
      installment_id: string | number;
      amount: string | number;
      paid_amount: string | number;
    } | null;
  }
  ```

---

## 5. Student / CRM Modals

### StudentDetailModal
* **File Location**: [StudentDetailModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentDetailModal.jsx)
* **Functional Role**: High-density card displaying a student's full profile (ID, Father/Mother names, Contacts, Branch, Profile image) in a neat, read-only window.
* **Prop Signature**:
  ```typescript
  interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
      student_id: string;
      student_name: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
      [key: string]: any;
    } | null;
  }
  ```

---

### StudentEditModal
* **File Location**: [StudentEditModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentEditModal.jsx)
* **Functional Role**: Form sheet designed to edit registered student columns. Binds inputs using Atomic V2 components (`FormField`, `TextInput`, `SelectInput`, `DateInput`).
* **Prop Signature**:
  ```typescript
  interface StudentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Object | null;
    onSave: (updatedData: Object) => void;
  }
  ```

---

### StudentLeadDetailModal
* **File Location**: [StudentLeadDetailModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentLeadDetailModal.jsx)
* **Functional Role**: Detailed popup showing CRM callback details, priority tags (e.g. Hot Lead, Demo Scheduled), and next callback timings for prospects.
* **Prop Signature**:
  ```typescript
  interface StudentLeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Object | null;
  }
  ```

---

### StudentLeadEditModal
* **File Location**: [StudentLeadEditModal.jsx](E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentLeadEditModal.jsx)
* **Functional Role**: Large form sheet wrapper that hosts the `QuickAddStudent` component in editing mode to modify a lead's metadata or batch assignments.
* **Prop Signature**:
  ```typescript
  interface StudentLeadEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Object | null;
  }
  ```
