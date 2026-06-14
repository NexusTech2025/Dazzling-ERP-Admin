# Technical Proposal: Multi-Enrollment Transaction Support for DazzlingDB Backend

This document proposes a backend transaction enhancement for **DazzlingDB** (Google Apps Script environment) to support registering a student and enrolling them in multiple packages, courses, and batches simultaneously in a single atomic transaction.

---

## 1. The Problem Statement

Currently, the `student_register` API controller assumes a **1-to-1 relationship** between a student registration and their academic enrollment. The request payload accepts a single `enrollment` object:

```json
"enrollment": {
  "item_id": "PKG-12-SCI",
  "batch_id": "BAT-PHY-12A",
  "enrollment_date": "2026-05-28",
  "status": "active"
}
```

### The Limitations:
1. **Inability to enroll in add-ons**: If a student registers for a primary board class (e.g. Class 12th Science Package) and also wants a computer course (e.g. Full-Stack Web Development Batch), the frontend has to perform sequential API calls (`student_register` followed by `academic_enroll_student`).
2. **Transactional Vulnerability**: If the secondary enrollment call fails due to a network drop or sheets lock timeout, the database is left in a **partially-enrolled state**, violating relational data integrity.
3. **Ledger Discrepancy**: A student paying a single consolidated deposit has their fee record split across multiple tables asynchronously, making billing reconciliation error-prone.

---

## 2. Proposed Solution: The `enrollments` Array

We propose updating the `student_register` payload contract to replace the singular `"enrollment"` object with a plural **`"enrollments"` array**.

### Old Payload vs. New Payload Structure

#### Old Structure (Single Enrollment)
```json
{
  "action": "student_register",
  "payload": {
    "profile": { "student_name": "Rohan Sharma", ... },
    "address": { ... },
    "contact": { ... },
    "education": { ... },
    "enrollment": {
      "item_id": "PKG-12-SCI",
      "batch_id": "BAT-PHY-12A"
    },
    "feeAccount": { "total_fee": 12000, "final_fee": 12000, "amount_paid": 5000 },
    "payment": { "amount_paid": 5000, "payment_method": "cash" }
  }
}
```

#### New Proposed Structure (Multi-Enrollment Array)
```json
{
  "action": "student_register",
  "payload": {
    "profile": { "student_name": "Rohan Sharma", ... },
    "address": { ... },
    "contact": { ... },
    "education": { ... },
    "enrollments": [
      {
        "item_id": "PKG-12-SCI",
        "batch_id": "BAT-PHY-12A",
        "fee": 12000
      },
      {
        "item_id": "CRS-COMP-DEV",
        "batch_id": "BAT-WEBDEV-AM",
        "fee": 5000
      }
    ],
    "feeAccount": {
      "total_fee": 17000,
      "discount": 1700,
      "final_fee": 15300,
      "amount_paid": 8000,
      "balance_due": 7300
    },
    "payment": {
      "amount_paid": 8000,
      "payment_method": "upi",
      "transaction_reference": "TXN-728193"
    }
  }
}
```

---

## 3. Backend Implementation (Google Apps Script)

Below is the proposed update to the backend Apps Script transaction handler. It maps over the `enrollments` array, creates corresponding rows in the `Enrollment` sheet, links them to the newly generated `student_id`, and creates the consolidated `StudentFeeAccount` entries.

```javascript
/**
 * Handles atomic multi-enrollment student registration transaction.
 * Path: GAS/src/controllers/studentController.gs
 * 
 * @param {object} payload - The transaction payload containing profile, address, contact, and enrollments array.
 * @returns {object} Response object indicating transaction status.
 */
function handleStudentRegisterTransaction(payload) {
  return Database.transaction(function(db) {
    // 1. Validate required segments
    if (!payload.profile || !payload.address || !payload.contact) {
      throw new Error("Missing profile, address, or contact details in payload.");
    }
    if (!payload.enrollments || !Array.isArray(payload.enrollments) || payload.enrollments.length === 0) {
      throw new Error("At least one enrollment item is required.");
    }

    // 2. Insert Student Profile Row
    const studentId = db.insert("Student", {
      student_name: payload.profile.student_name,
      gender: payload.profile.gender,
      dob: payload.profile.dob,
      mother_name: payload.profile.mother_name,
      father_name: payload.profile.father_name,
      status: payload.profile.status || "active",
      avatar_url: payload.profile.avatarUrl || null,
      phone: payload.contact.mobile_number
    });

    // 3. Insert Address Row
    const addressId = db.insert("Address", {
      student_id: studentId,
      line1: payload.address.line1,
      line2: payload.address.line2 || "",
      city: payload.address.city,
      state: payload.address.state,
      pin_code: payload.address.pin_code,
      country: payload.address.country || "India"
    });

    // 4. Insert ContactInfo Row
    db.insert("ContactInfo", {
      student_id: studentId,
      address_id: addressId,
      email: payload.contact.email,
      mobile_number: payload.contact.mobile_number,
      emergency_name: payload.contact.emergency_name,
      emergency_phone: payload.contact.emergency_phone,
      emergency_relationship: payload.contact.emergency_relationship
    });

    // 5. Insert Education Row (If provided)
    if (payload.education) {
      db.insert("Education", {
        student_id: studentId,
        highest_qualification: payload.education.highest_qualification,
        institution_name: payload.education.institution_name,
        year_of_passing: payload.education.year_of_passing,
        percentage_or_cgpa: payload.education.percentage_or_cgpa
      });
    }

    // 6. Process Multiple Enrollments & Fee Accounts
    const enrollmentIds = [];
    payload.enrollments.forEach(function(enroll) {
      // Create individual Enrollment Row
      const enrollmentId = db.insert("Enrollment", {
        student_id: studentId,
        item_id: enroll.item_id,
        batch_id: enroll.batch_id,
        enrollment_date: enroll.enrollment_date || new Date().toISOString().split('T')[0],
        status: "active"
      });
      enrollmentIds.push(enrollmentId);

      // Create individual StudentFeeAccount Row for each enrollment to preserve ledger tracking
      const proportion = enroll.fee / payload.feeAccount.total_fee;
      const calculatedDiscount = Math.round(payload.feeAccount.discount * proportion);
      const calculatedFinalFee = enroll.fee - calculatedDiscount;
      
      // Split the paid amount proportionally across fee accounts
      const calculatedAmountPaid = Math.round(payload.feeAccount.amount_paid * proportion);
      const balanceDue = calculatedFinalFee - calculatedAmountPaid;

      db.insert("StudentFeeAccount", {
        enrollment_id: enrollmentId,
        fee_plan_id: payload.feeAccount.fee_plan_id || "FPL-STD-001",
        total_fee: enroll.fee,
        discount: calculatedDiscount,
        final_fee: calculatedFinalFee,
        amount_paid: calculatedAmountPaid,
        balance_due: balanceDue,
        status: "active"
      });
    });

    // 7. Record Payment (Single payment for all enrollments)
    if (payload.payment && payload.payment.amount_paid > 0) {
      db.insert("Payment", {
        student_id: studentId,
        amount_paid: payload.payment.amount_paid,
        payment_date: payload.payment.payment_date || new Date().toISOString(),
        payment_method: payload.payment.payment_method,
        transaction_reference: payload.payment.transaction_reference || "CONSOLIDATED",
        status: "success"
      });
    }

    return {
      student_id: studentId,
      enrollment_ids: enrollmentIds
    };
  });
}
```

---

## 4. Why This Approach Wins

1. **Transactional Safety (`Database.transaction`)**: In Google Sheets, multiple writes can collide. By wrapping this in a transaction block, we lock the sheet and rollback (delete inserted rows) if any insert fails.
2. **Proportionate Accounting**: Each course/package enrollment retains its own `StudentFeeAccount` balance due, which complies with tax and accounting rules, while the student makes a single integrated payment.
3. **Fewer Network Requests**: The client makes exactly one network call, reducing mobile latency and server processing overhead.
