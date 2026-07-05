# DazzlingDB Database Schema Status Diagnostics

This document outlines the support matrix for active/inactive operational status flags across the primary database tables.

---

## 1. Tables Supporting `"active"` / `"inactive"` Status (or Equivalent Lifecycle Enums)
These tables contain a `"status"` (or `"contract_status"`) column defining operational availability:

* **Course** (`Academic.Course`): `choices: ["active", "inactive"]`
* **CourseType** (`Academic.CourseType`): `choices: ["active", "inactive"]`
* **Package** (`Academic.Package`): `choices: ["active", "inactive", "draft"]`
* **Branch** (`Core.Branch`): `choices: ["active", "inactive"]`
* **StaffMember** (`Staff.StaffMember`): `choices: ["active", "inactive"]`
* **Teacher** (`Staff.Teacher`): `choices: ["active", "inactive", "pending"]`
* **Student** (`Students.Student`): `choices: ["active", "inactive", "applicant"]`
* **Batch** (`Academic.Batch`): `choices: ["active", "completed", "cancelled"]`
* **BatchAllocation** (`Academic.BatchAllocation`): `choices: ["active", "suspended", "completed", "dropped"]`
* **Enrollment** (`Academic.Enrollment`): `choices: ["active", "completed", "withdrawn"]`
* **StudentFeeAccount** (`Finance.StudentFeeAccount`): `choices: ["active", "completed", "defaulted", "refunded"]`
* **PromoCode** (`Core.PromoCode`): `choices: ["active", "expired", "disabled"]`
* **User** (`Auth.User`): `choices: ["active", "locked", "disabled"]`
* **TeacherSalaryConfig** (`Staff.TeacherSalaryConfig`): `contract_status` column `choices: ["drafted", "active", "expired", "terminated", "voided"]`

---

## 2. Tables That Do NOT Support `"active"` / `"inactive"` Status
These tables either have no status tracking at all, or track transaction/attendance workflows rather than logical record activity:

* **StudentAttendance** & **TeacherAttendance**: `status` defines present/absent states (`["P", "A", "L"]`).
* **Installment**: `status` defines payment status (`["pending", "partially_paid", "paid", "overdue"]`).
* **Payment**: `status` defines transaction status (`["success", "pending", "failed"]`).
* **MoneyTransaction**: Tracks `reconciliation_status` (`["unreconciled", "matched", "discrepancy"]`).
* **StudentLead**: `status` defines conversion stage (`["prospect", "contacted", "converted", "lost"]`).
* **Test**: `status` defines publishing lifecycle (`["Draft", "Completed", "Published"]`).
* **No Status Column:** 
  * `Academic.PackageItem` / `Academic.PackagePerk`
  * `Auth.Session`
  * `Finance.ExpenseCategory` / `Finance.FeeAdjustment` / `Finance.FeePlan`
  * `Staff.TeacherDocument` / `Staff.TeacherSubject` / `Staff.TeacherPaymentTransaction`
  * `Students.Address` / `Students.ContactInfo` / `Students.Education`
  * `Test.TestMarks` / `Test.TestPaper`
