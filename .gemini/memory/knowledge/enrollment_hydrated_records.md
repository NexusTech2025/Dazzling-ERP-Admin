```json
{
    "student_id": "STU-CFF573D5",
    "enrollment_type": "package",
    "item_id": "PKG-8E7F42CE",
    "roll_number": null,
    "enrollment_date": "2026-06-25",
    "status": "active",
    "academic_status": "active",
    "metadata": {
        "course_fees": {
            "CRS-FB15A55B": 30000,
            "CRS-8FD279B7": 30000,
            "CRS-79E92F19": 32000,
            "CRS-140B5888": 32000
        }
    },
    "enrollment_id": "ENR-938112AF",
    "studentfeeaccounts": [
        {
            "enrollment_id": "ENR-938112AF",
            "fee_plan_id": "FPL-87E2381D",
            "total_fee": 110000,
            "discount": 0,
            "adjustment_type": null,
            "coupon_code": null,
            "final_fee": 110000,
            "amount_paid": 27500,
            "balance_due": 82500,
            "is_overdue": false,
            "penalty_amount": 0,
            "next_due_date": null,
            "status": "active",
            "remarks": "Provisioned during student registration",
            "created_by": null,
            "student_fee_id": "SFA-45791402",
            "feeplan": {
                "entity_id": "PKG-8E7F42CE",
                "entity_type": "package",
                "plan_name": "Default Standard Plan",
                "total_fee": 110000,
                "discount_allowed": true,
                "installment_allowed": true,
                "fee_plan_id": "FPL-87E2381D"
            },
            "feeadjustments": [],
            "installments": [
                {
                    "student_fee_id": "SFA-45791402",
                    "installment_number": 1,
                    "due_amount": 27500,
                    "paid_amount": 27500,
                    "late_fee_amount": 0,
                    "due_date": "2026-07-01",
                    "status": "paid",
                    "installment_id": "INS-D6DAC000",
                    "payments": [
                        {
                            "installment_id": "INS-D6DAC000",
                            "student_fee_id": "SFA-45791402",
                            "amount_paid": 27500,
                            "payment_date": "2026-06-25T19:30:00.000Z",
                            "payment_method": "upi",
                            "transaction_reference": "TXN-ONB-PCM-20261102",
                            "status": "success",
                            "remarks": null,
                            "created_by": null,
                            "payment_id": "PAY-12164F3D"
                        }
                    ]
                },
                {
                    "student_fee_id": "SFA-45791402",
                    "installment_number": 2,
                    "due_amount": 27500,
                    "paid_amount": 0,
                    "late_fee_amount": 0,
                    "due_date": "2026-08-01",
                    "status": "pending",
                    "installment_id": "INS-53690082",
                    "payments": []
                },
                {
                    "student_fee_id": "SFA-45791402",
                    "installment_number": 3,
                    "due_amount": 27500,
                    "paid_amount": 0,
                    "late_fee_amount": 0,
                    "due_date": "2026-09-01",
                    "status": "pending",
                    "installment_id": "INS-32771CFB",
                    "payments": []
                },
                {
                    "student_fee_id": "SFA-45791402",
                    "installment_number": 4,
                    "due_amount": 27500,
                    "paid_amount": 0,
                    "late_fee_amount": 0,
                    "due_date": "2026-10-01",
                    "status": "pending",
                    "installment_id": "INS-F4DB79AF",
                    "payments": []
                }
            ]
        }
    ],
    "id": "ENR-938112AF"
}
```