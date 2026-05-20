# Course API Specifications

This document details the payload requirements and implementation rules for Academic Course and Course Type management.

## 1. Course Type (Segment) Management

### Create Course Type
- **Registry Action**: `ACADEMIC.CREATE_COURSE_TYPE`
- **Backend Action**: `academic_create_course_type`
- **Frontend ID Generation**: `SEG-` + last 6 digits of timestamp (e.g., `SEG-123456`).
- **Payload Schema**:
    ```json
    {
      "segment_id": "string",
      "segment_name": "string",
      "entity_label": "string", // Defaults to 'Subject' or 'Course'
      "description": "string"
    }
    ```

## 2. Course Management

### Create New Course
- **Registry Action**: `ACADEMIC.CREATE_COURSE`
- **Backend Action**: `academic_create_course`
- **Frontend ID Generation**: `CRS-` + last 6 digits of timestamp (e.g., `CRS-654321`).
- **Payload Schema**:
    ```json
    {
      "segment_id": "string", // Must link to existing CourseType
      "entity_type": "enum", // 'subject' or 'course'
      "name": "string",
      "short_code": "string", // Forced to UPPERCASE
      "language_medium": "enum", // 'English', 'Hindi', 'Urdu'
      "description": "string",
      "duration_value": "number",
      "duration_unit": "enum", // 'months', 'weeks', 'days'
      "base_fee": "number",
      "default_installment_count": "number",
      "status": "enum", // 'active', 'inactive'
      "metadata": "json" // Conditional structure
    }
    ```

### Metadata Alignment Rules
- **For 'subject'**: `metadata` must include `{ "class": "...", "board": "..." }`.
- **For 'course'**: `metadata` must include `{ "min_class": "...", "max_class": "..." }`.

## 3. Implementation Patterns

### Schema Alignment in AddCourse.jsx
To ensure data integrity, payloads are surgically constructed in the `handleSubmit` function before being passed to the mutation:
1.  **Extract only required fields** from form state.
2.  **Cast numeric strings** to `Number`.
3.  **Standardize casing** for codes (e.g., `.toUpperCase()`).
4.  **Assemble metadata object** based on `entity_type`.
