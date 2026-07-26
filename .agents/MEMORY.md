# Dazzling ERP Admin — Agent Memory Key Points

This file captures reusable behavioral learnings, critical patterns, and anti-pattern corrections that emerged from past development sessions. Agents MUST consult this file alongside `AGENTS.md`.

---

## 1. Cross-Table Composite Reference Key Standard

When linking records between two tables (e.g. StudentPayment → MoneyTransaction), the `payment_reference` composite key **MUST** include ALL identifying segments down to the individual record level, not just parent-level IDs.

- **Standard Format**: `${parent_account_id}_${sub_entity_id}_${record_id}` (e.g. `SFA-002002_INS-002001_PMT-001001`)
- **Anti-Pattern**: Using only parent-level keys (`SFA-002002_INS-002001`) causes false-positive matches when multiple child records share the same parent — one synced record falsely marks siblings as synced.
- **Sync Check Helper Pattern**:
  ```javascript
  const checkIsRecordSynced = (parentId, subEntityId, recordId) => {
    if (!parentId || !subEntityId || !recordId) return false;
    const compositeKey = `${parentId}_${subEntityId}_${recordId}`;
    return targetRecords.some(tx => (tx.payment_reference || '').trim() === compositeKey);
  };
  ```

---

## 2. Form Modal Create vs Update Disambiguation

When a form modal accepts an `initialData` prop to pre-populate fields, the submit handler **MUST NOT** assume that the presence of `initialData` alone means "update mode."

- **Create Mode**: `initialData` exists but has NO primary key (`transaction_id`, `id`). Dispatch `createMutation` / `data_create`.
- **Update Mode**: `initialData` exists AND has a primary key. Dispatch `updateMutation` / `data_update`.
- **Guard Pattern**:
  ```javascript
  if (initialData && (initialData.transaction_id || initialData.id)) {
    // UPDATE existing record
    await updateMutation.mutateAsync({ id: initialData.transaction_id || initialData.id, data: payload });
  } else {
    // CREATE new record (data_create with no id)
    await createMutation.mutateAsync(payload);
  }
  ```
- **Origin**: MoneyTransactionForm initially checked `if (initialData)` which always triggered update mode even for new sync entries that only had pre-populated field values but no existing record ID.
