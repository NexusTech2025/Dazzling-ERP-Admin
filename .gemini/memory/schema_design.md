# Schema Design Standard (V3.0)

> [!IMPORTANT]
> The database schema is defined in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json).
> All other schema `json` files from `src/Schema` are outdated and **MUST** be ignored. `DazzlingDB/full_schemav3.json` is the final and single source of truth for the database schema.

## 1. File Naming Convention

- Files must be named after the entity they represent.
- Use **PascalCase** for the filename (e.g., `CourseType.json`, `StudentFeeAccount.json`).
- Extension must be `.json`.

## 2. Identifier Standardization

As of V2.1, the project has standardized on the following naming convention for identifiers to align the frontend state with the database schema:

- **Primary Keys**: Always use `[entity]_id` (e.g., `course_id`, `batch_id`, `teacher_id`).
- **Legacy Note**: References like `item_id` (used for Courses in some places) are deprecated and MUST be mapped to `course_id` in Data Mappers.
- **Foreign Keys**: Always mirror the target's primary key name (e.g., a Batch table linking to a Teacher should use `teacher_id`).

## 3. Root Object Structure

| Property        | Type       | Required | Description                                  |
| :-------------- | :--------- | :------- | :------------------------------------------- |
| `entity`      | `string` | Yes      | The name of the entity in PascalCase.        |
| `description` | `string` | Yes      | A brief explanation of the entity's purpose. |
| `fields`      | `array`  | Yes      | An array of field definition objects.        |
| `relations`   | `array`  | No       | An array of relationship definition objects. |

## 4. Field Object Structure

Each field in the `fields` array supports the following properties:

| Property         | Type        | Description                                                                                             |
| :--------------- | :---------- | :------------------------------------------------------------------------------------------------------ |
| `name`         | `string`  | The field name (typically `snake_case`).                                                              |
| `type`         | `string`  | Data type:`string`, `integer`, `number`, `boolean`, `enum`, `json`, `date`, `datetime`. |
| `required`     | `boolean` | If `true`, the field must have a value.                                                               |
| `isPrimary`    | `boolean` | If `true`, this is the primary identifier for the entity.                                             |
| `isUnique`     | `boolean` | If `true`, the value must be unique across all records.                                               |
| `isForeignKey` | `boolean` | If `true`, this field references another entity.                                                      |
| `references`   | `string`  | If `isForeignKey` is true, specify `TargetEntity.target_field`.                                     |
| `values`       | `array`   | Required if `type` is `enum`. Lists allowed string values.                                          |
| `default`      | `any`     | The default value if none is provided.                                                                  |
| `description`  | `string`  | Internal documentation for the field's usage.                                                           |

## 5. Relation Object Structure

The `relations` array defines how this entity connects to others:

| Property   | Type       | Description                                                |
| :--------- | :--------- | :--------------------------------------------------------- |
| `type`   | `string` | The cardinality:`1:1`, `1:N`, `N:1`, `N:N`.        |
| `target` | `string` | The name of the target entity.                             |
| `field`  | `string` | The field in the current entity that establishes the link. |

## 5. Standard Data Types & Conventions

- **IDs**: Use `string` for IDs (UUIDs or custom strings).
- **Timestamps**: Use `datetime` for `created_at` or `updated_at`.
- **Dates**: Use `date` for birthdays or schedule dates without time.
- **Metadata/Complex Data**: Use `json` for unstructured or semi-structured data.

## 7. Cohesive Schema Groupings

To maintain system integrity and ease of navigation, schemas are grouped into five functional domains based on their strong cohesiveness:

### Domain A: Student Lifecycle & Identity

*Entities centered around the student profile, background, and their entry into the system.*

- **Student**: Core identity and status.
- **Address**: Residency details linked to a student.
- **ContactInfo**: Communication and emergency details.
- **Education**: Prior qualifications and academic background.
- **Enrollment**: Links a student to a specific course or package.

### Domain B: Academic Core Structure

*The fundamental building blocks of the institute's educational offerings.*

- **CourseType**: High-level segments or categories of courses.
- **Course**: Individual subjects or academic programs.
- **Branch**: Physical or logical centers where courses are offered.
- **Batch**: Operational instances of courses (specific timing, branch, and teacher).

### Domain C: Packages & Ecosystems

*Advanced offerings that bundle multiple courses or add extra value.*

- **Package**: Definitions for course bundles.
- **PackageCourse**: Maps individual courses into packages.
- **PackagePerk**: Additional benefits or value-adds included in packages.
- **PromoCode**: Marketing-driven discounts for courses and packages.

### Domain D: Financial & Fee Ecosystem

*All entities managing pricing, billing, and transactional history.*

- **FeePlan**: Master price lists and financial templates.
- **StudentFeeAccount**: Tracks the overall financial state of a student.
- **Installment**: Scheduled payment breakdowns.
- **Payment**: Individual transaction records.
- **FeeAdjustment**: Modifications to base fees or manual discounts.

### Domain E: Staff & Resource Management

*Entities representing the institute's workforce.*

- **Teacher**: Faculty profiles and professional assignments.

## 8. Example Schema (`Course.json`)

```json
{
  "entity": "Course",
  "description": "Individual subjects or academic offerings provided by the institute.",
  "fields": [
    { "name": "course_id", "type": "string", "isPrimary": true },
    { "name": "name", "type": "string", "required": true },
    { 
      "name": "language_medium", 
      "type": "enum", 
      "values": ["English", "Hindi", "Urdu"], 
      "required": true 
    },
    { "name": "base_fee", "type": "number", "required": true },
    { "name": "status", "type": "enum", "values": ["active", "inactive"], "default": "active" }
  ],
  "relations": [
    { "type": "N:1", "target": "CourseType", "field": "segment_id" }
  ]
}
```

## 9. Targets & Primary Keys

The following table lists all valid `target` entities (PascalCase) and their corresponding primary keys as defined in the master `DATABASE_SCHEMA`.

| Target | Primary Key | Description |
| :--- | :--- | :--- |
| **Branch** | `branch_id` | Physical or logical institute centers. |
| **PromoCode** | `promo_id` | Discount and marketing codes. |
| **User** | `user_id` | System users and authentication. |
| **Session** | `token` | Active user sessions. |
| **Batch** | `batch_id` | Operational instances of courses. |
| **Enrollment** | `enrollment_id` | Student-Course/Package mapping. |
| **Package** | `package_id` | Bundled course offerings. |
| **PackageItem** | `item_id` | Items within a package. |
| **CourseType** | `segment_id` | High-level course categories. |
| **Course** | `course_id` | Individual subjects/programs. |
| **PackageCourse** | `package_course_id` | Course-Package mapping. |
| **PackagePerk** | `perk_id` | Value-adds for packages. |
| **Student** | `student_id` | Core student identity. |
| **Address** | `address_id` | Student residential details. |
| **ContactInfo** | `contact_id` | Student communication details. |
| **Education** | `education_id` | Student academic background. |
| **Teacher** | `teacher_id` | Faculty profiles. |
| **TeacherSubject** | `teacher_subject_id` | Teacher-Subject mapping. |
| **TeacherAttendance** | `attendance_id` | Staff attendance records. |
| **TeacherPayment** | `payment_id` | Staff payment history. |
| **TeacherDocument** | `document_id` | Staff uploaded documents. |
| **SalaryConfig** | `config_id` | Salary structure templates. |
| **TeacherSalaryConfig** | `salary_config_id` | Specific teacher salary settings. |
| **TeacherPaymentTransaction** | `transaction_id` | Detailed payment transactions. |
| **FeePlan** | `fee_plan_id` | Financial templates/price lists. |
| **StudentFeeAccount** | `student_fee_id` | Student financial master record. |
| **Installment** | `installment_id` | Scheduled payment breakdowns. |
| **Payment** | `payment_id` | Individual student payments. |
| **FeeAdjustment** | `adjustment_id` | Manual fee modifications. |

## 10. Strict Field Alignment (UI-to-Schema)

To ensure zero-mapping overhead and data integrity, the frontend `formData` keys **MUST** perfectly match the field names defined in the schema.

### Example (Teacher Entity):
- **❌ Legacy UI Name**: `fullName`, `mobile`, `experience`
- **✅ Schema Correct Name**: `full_name`, `mobile_number`, `experience_years`

> **Rationale**: Using schema-correct names in UI state allows for direct payload submission (`updateMutation.mutate(formData)`) and automated form hydration from API responses.

## 11. Cross-Entity Identifier Resolution

When an entity references another (e.g., Teacher assigning Courses), the UI **MUST** store and transmit the **Primary Key** (`course_id`) of the target, not its semantic name.

### Standard for Many-to-Many Assignment (e.g., Teacher Subjects):
1. **Frontend State**: Store as an array of IDs: `subjects: ['CRS-001', 'CRS-002']`.
2. **Persistence (API Payload)**:
   - `subject_code`: Join IDs with a comma: `"CRS-001, CRS-002"` (for legacy compatibility).
   - `metadata.subjects`: Store as raw JSON array `['CRS-001', 'CRS-002']` (for modern querying).
3. **UI Display**: Use a `useMemo` filter to resolve IDs into objects for rendering:
   ```javascript
   const selectedObjects = coursesData.filter(c => subjects.includes(c.course_id));
   return selectedObjects.map(c => <span>{c.name}</span>);
   ```

