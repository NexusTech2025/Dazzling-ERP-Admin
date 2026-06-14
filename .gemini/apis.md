Listed directory DazzlingDB
Listed directory DBServices
Viewed BaseActions.js:1-90
Searched for "class Delete"
Viewed ConcreteActionsX.js:1-413
Viewed ConcreteActions.js:153-952
Viewed ApiDispatcher.js:1-167
Listed directory Schema
Listed directory Students
Viewed REST-api-doc.md:460-540
Searched for "GLOBAL_CRUD_WHITELIST"
Viewed Config.js:1-128
Searched for "delete_many"
Searched for "delete"
Searched for "delete_many"
Viewed REST-api-doc.md:490-600
Searched for "students"
Used tool: list_permissions

Here is the bulk delete API action reference for **Batch, Course, Students, Teachers, Packages, and Student Lead**, Moni.

The bulk deletion engine divides operations into two execution categories:
1. **Generic Bulk Deletes (`data_delete_many`)**: Used for tables registered in the `GLOBAL_CRUD_WHITELIST`.
2. **Specialized Bulk Deletes**: Used for tables that require custom domain validations, cascaded child table cleanups, or balance recalculations.

---

### Category A: Generic Bulk Deletion (`data_delete_many`)
Used for whitelisted entities: **`Batch`**, **`Course`**, and **`StudentLead`**.

#### 1. Batch (`Batch`)
*   **Action Name**: `data_delete_many`
*   **Request Payload**:
```json
{
  "action": "data_delete_many",
  "token": "YOUR_AUTH_TOKEN",
  "payload": {
    "table": "Batch",
    "ids": ["BAT-E20D1E4B", "BAT-H71A2E3C"],
    "dryRun": false
  }
}
```
*   **Response (Success)**:
```json
{
  "success": true,
  "action": "data_delete_many",
  "data": {
    "success": true,
    "dryRun": false,
    "deletedCount": 2,
    "manifest": {
      "deleted": ["BAT-E20D1E4B", "BAT-H71A2E3C"],
      "skipped": [],
      "failed": {}
    }
  }
}
```

#### 2. Course (`Course`)
*   **Action Name**: `data_delete_many`
*   **Request Payload**:
```json
{
  "action": "data_delete_many",
  "token": "YOUR_AUTH_TOKEN",
  "payload": {
    "table": "Course",
    "ids": ["CRS-D40D4661", "CRS-9A8D7C"],
    "dryRun": false
  }
}
```

#### 3. Student Lead (`StudentLead`)
*   **Action Name**: `data_delete_many`
*   **Request Payload**:
```json
{
  "action": "data_delete_many",
  "token": "YOUR_AUTH_TOKEN",
  "payload": {
    "table": "StudentLead",
    "ids": ["SLD-A1B2C3", "SLD-D4E5F6"],
    "dryRun": false
  }
}
```

---

### Category B: Specialized Bulk Deletion
Used for entities with complex relational schemas: **`Student`**, **`Teacher`**, and **`Package`**.

#### 4. Students (`Student`)
*   **Action Name**: `student_delete_many_students`
*   **Behavior**: Executes the high-performance relational cascades (deletes associated Address, ContactInfo, Education, and updates foreign keys).
*   **Request Payload**:
```json
{
  "action": "student_delete_many_students",
  "token": "YOUR_AUTH_TOKEN",
  "payload": {
    "table": "Student",
    "ids": ["STU-C3NEA67", "STU-XYZ123"],
    "dryRun": false
  }
}
```
*   **Response (Success)**:
```json
{
  "success": true,
  "action": "student_delete_many_students",
  "data": {
    "success": true,
    "dryRun": false,
    "deletedCount": 2,
    "manifest": {
      "deleted": ["STU-C3NEA67", "STU-XYZ123"],
      "skipped": [],
      "failed": {}
    }
  }
}
```

#### 5. Teachers (`Teacher`)
*   **Action Name**: `staff_delete_many_teachers`
*   **Behavior**: Cascades deletion to `TeacherSubject`, `TeacherDocument`, and `TeacherSalaryConfig`. Restricts and blocks deletion if a teacher is currently assigned to an active `Batch` or has financial `TeacherPaymentTransaction` history.
*   **Request Payload**:
```json
{
  "action": "staff_delete_many_teachers",
  "token": "YOUR_AUTH_TOKEN",
  "payload": {
    "table": "Teacher",
    "ids": ["TCH-A1B2C3", "TCH-D4E5F6"],
    "dryRun": false
  }
}
```

#### 6. Packages (`Package`)
*   **Action Name**: `academic_delete_many_packages`
*   **Behavior**: Cascades deletion to `PackagePerk` and `PackageItem`. Restricts and blocks deletion if active student enrollments reference the package.
*   **Request Payload**:
```json
{
  "action": "academic_delete_many_packages",
  "token": "YOUR_AUTH_TOKEN",
  "payload": {
    "table": "Package",
    "ids": ["PKG-A1B2C3", "PKG-D4E5F6"],
    "dryRun": false
  }
}
```

---

### Other Specialized Bulk Deletes (`etc.`)
If you need to perform bulk deletions on other relational tables, use their respective endpoints:
*   **Enrollment**: `academic_delete_many_enrollments`
*   **StudentFeeAccount**: `finance_delete_many_fee_accounts`
*   **Installment**: `finance_delete_many_installments`
*   **Payment**: `finance_delete_many_payments`
*   **FeeAdjustment**: `finance_delete_many_adjustments`
*   **Users**: `auth_delete_many_users`
*   **Sessions**: `auth_delete_many_sessions`