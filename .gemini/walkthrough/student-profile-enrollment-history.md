---
Date: 2026-06-19T16:25:00+05:30
Status: Completed
---

# Walkthrough - Student Profile Enrollment History Mapping

We resolved the broken enrollment history mapping on the student detailed page view by updating the client-side data aggregator to comply with the normalized database schema.

## **Changes Made**

### **Student Profile Aggregator API**

#### [src/features/profile/api/profile.api.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/profile/api/profile.api.js)
- Extended `fetchProfileDetails` to query `BatchAllocation` and `Package` models in parallel using the central `apiClient.executeAction` Query DSL engine.
- Replaced the legacy field mapping (where `enr.batch_id` and `enr.course_id` were assumed to exist directly on the `Enrollment` table).
- Implemented clean schema data stitching:
  - Finds the student's batch assignment using the corresponding record from the `BatchAllocation` table and maps it to `batch_name` (falling back to `"Not Allocated"`).
  - Handles polymorphic item mapping:
    - `"package"`: Resolves package information from `Package` table to get the name and duration (represented as `month` months).
    - `"course"` / `"subject"`: Resolves course information from `Course` table to get the name and duration.

---

## **Verification Results**

- Checked schema constraints for `Enrollment`, `BatchAllocation`, `Package`, `Course`, and `Batch`.
- Ensured all mapped fields match the target schemas strictly with zero legacy compatibility code remaining.
