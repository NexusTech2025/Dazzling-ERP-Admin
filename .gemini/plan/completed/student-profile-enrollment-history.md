---
Date: 2026-06-19T16:25:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Student Profile Enrollment History Mapping (No Legacy Support)

This plan resolves the broken mapping and rendering in the **Enrollment History** section on the student detailed page view by implementing database-schema-compliant joins without any backward-compatibility legacy code.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Schemas:**
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Enrollment.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/BatchAllocation.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Package.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Course.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Batch.json`
* **Referenced Core Modules:**
  * `src/features/profile/api/profile.api.js`
  * `src/features/student/components/profile/EnrollmentDetails.jsx`

---

## **2. Fact vs. Assumption Boundary (Rule N3)**

### **Actual Verified Facts:**
1. **Schema Structure:** The `Enrollment` table schema does not contain a `batch_id` column.
2. **Stitching Mechanics:** Batch allocations are maintained in the separate `BatchAllocation` table mapping `enrollment_id` to `batch_id`.
3. **Polymorphic Types:** An enrollment can represent either a `Course` (when `enrollment_type` is `"course"` or `"subject"`) or a `Package` (when `enrollment_type` is `"package"`). The foreign key is `item_id`.
4. **Current Frontend Behavior:** `profile.api.js` attempts to read `enr.batch_id` directly from the `Enrollment` row and does not query `BatchAllocation` or `Package` models, resulting in fallback values ("Unknown Batch" and "Unknown Course" or "N/A" durations).

### **System Assumptions:**
1. **Network Performance:** Combining two additional query requests (`BatchAllocation` and `Package`) into the parallel `Promise.all` block maintains client performance with minimal latency addition, resolving in a single round-trip.

---

## **3. Proposed Changes (Rule N1)**

### **Student Profile Aggregator API**

#### [MODIFY] `src/features/profile/api/profile.api.js`

We will modify `fetchProfileDetails` to query `BatchAllocation` and `Package` models in parallel and correctly map course names and allocated batch details.

```javascript
/**
 * Orchestrates parallel query requests using the centralized query DSL (DATA.QUERY)
 * to construct a fully hydrated Student Profile dossier.
 * Resolves address info, secondary contact info, education records, and active course enrollments
 * joined against batch, course, and package catalog details.
 * 
 * @async
 * @function fetchProfileDetails
 * @param {string} token - The active user authorization session token.
 * @param {string} studentId - The unique primary student identifier (prefix: STU-).
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @returns {Promise<object>} Returns a compiled profile details payload containing:
 * - success {boolean} Indicator indicating transaction outcomes.
 * - data.data.address {object|null} Home residency details.
 * - data.data.contact {object|null} Email, emergency phone, and kinship mappings.
 * - data.data.education {Array<object>} Past qualifications.
 * - data.data.enrollments {Array<object>} Current active courses, joined with durations, batch names, and courses.
 * @throws {Error} Network error or API execution failure.
 */
export const fetchProfileDetails = async (token, studentId, options = {}) => {
  // Execution breakdown:
  // 1. Fetch Student-specific Address, ContactInfo, Education, and Enrollments.
  // 2. Fetch Student-specific BatchAllocation records to identify associated batches.
  // 3. Fetch global Course, Package, and Batch lists to resolve titles and durations.
  // 4. Map and stitch relations dynamically on the client.
}
```

##### **Step-by-Step Technical Execution Workflow:**
1. **Parallel Ingestion:** Add `BatchAllocation` (filtered by `student_id`) and `Package` (unfiltered query) to the `Promise.all` sequence.
2. **Success Validation:** Check execution outcome status for all eight requests. If any database query fails, return a graceful error status payload.
3. **Clean Schema Data Stitching (No Legacy Fallbacks):**
   - For each `Enrollment` record:
     - Find the corresponding allocation in the `BatchAllocation` response where `allocation.enrollment_id === enr.enrollment_id`.
     - Resolve the allocated `batch_id` and find the matching `Batch` object. Map the name to `batch_name` (defaulting to `"Not Allocated"` if no allocation exists).
     - Check `enr.enrollment_type`.
       - If it is `"package"`, find the matching `Package` object where `package_id === enr.item_id`. Set `course_name` to `package.name` and `duration` to `${package.month} Months`.
       - If it is `"course"` or `"subject"`, find the matching `Course` object where `course_id === enr.item_id`. Set `course_name` to `course.name` and `duration` to `${course.duration_value} ${course.duration_unit}`.

---

## **4. Legacy Maintenance Mitigation (Rule N6)**

> [!CAUTION]
> **NO LEGACY MAINTENANCE:**
> 
> * **Technical Path Endpoint:** `src/features/profile/api/profile.api.js` (Lines 56-65)
> * **Core Technical Debt Risk:** All backward-compatibility checks for outdated fields `enr.batch_id` and `enr.course_id` are completely removed.
> * **Remediation Option:** Strictly map relations using `BatchAllocation` and `item_id`.

---

## **5. Performance Regression & Benchmark Assertions (Rule N5)**

* **Metric Formula:** `T(n) = O(1) API calls` (a single batch parallel round-trip of independent table fetches resolved on the backend in parallel).
* **Assertion:** The data mapping operation on the client resolves in `< 5ms` for typical student enrollment history sizes (1–5 enrollments).

---

## **6. Verification Plan**

### **Manual Verification**
1. Navigate to `/admin/Student/:id` in the application for a student record containing enrollments.
2. Verify that **Enrollment History** displays the correct Batch Name (e.g. `"React Evening Batch"`) instead of `"Unknown Batch"`.
3. Verify that Package names and Course names are properly resolved and duration matches the database values.
