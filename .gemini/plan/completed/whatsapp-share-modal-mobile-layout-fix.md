---
Title: Implementation Plan: Mobile Viewport Height & Layout Optimization for `WhatsAppShareModal`
Date: 2026-07-27T16:12:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Mobile Viewport Height & Layout Optimization for `WhatsAppShareModal`

This document outlines the technical plan to refactor [WhatsAppShareModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/WhatsAppShareModal.jsx) so that on mobile devices the modal container covers ~92% of viewport height with a small margin, while optimizing internal padding so the text preview area expands to fill maximum vertical space.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Core Primitive:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\components\ui\Modal.jsx` (`Modal` container and subcomponent API)
* **Referenced Target Modal:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\tests\components\WhatsAppShareModal.jsx`
* **Design Runbooks:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/zero-new-ui-components-policy.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. On mobile viewports, fixed `rows={10}` on `<textarea>` combined with `p-6 space-y-4` padding on `Modal.Body` restricts the text preview area height, causing double margins, heavy inner scrolling, and large blank backdrop space above and below the modal.
2. `Modal.jsx` supports custom container styling via `className` prop (`className="h-[92vh] max-h-[92vh] sm:h-auto"`).

### System Assumptions
1. Setting modal height to `h-[92vh] max-h-[92vh]` on mobile with `flex-1 flex flex-col` on `Modal.Body` and the chat bubble container allows the textarea to grow dynamically and fill up to 70% of screen height.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [WhatsAppShareModal.jsx:L25-L65](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/WhatsAppShareModal.jsx#L25-L65)
> * **Core Technical Debt Risk:** Double padding (`p-6` body + `p-4` bubble) and static `rows={10}` causes text compression and tight vertical scrolling on mobile phones.
> * **Remediation Option:** Refactor `WhatsAppShareModal.jsx` into a flex-grow column layout with `h-[92vh] max-h-[92vh]` on mobile and `flex-1 min-h-0` on the textarea.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Pure UI Layout Adjustment:** 100% client-side DOM layout styling update; zero API round-trips.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Render Performance:** $< 1\text{ ms}$ layout paint time.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### Refactored `WhatsAppShareModal.jsx` ([WhatsAppShareModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/WhatsAppShareModal.jsx))

```javascript
import React, { useState, useEffect } from 'react';
import Modal from '../../../../../../components/ui/Modal';
import Button from '../../../../../../components/ui/v2/Button';
import { openWhatsAppShare } from '../utils/whatsappShareUtils';

/**
 * Interactive preview dialog rendering a WhatsApp message bubble preview before broadcasting.
 * Optimized for mobile viewport height expansion and flex-grow text editing.
 */
export default function WhatsAppShareModal({
  isOpen,
  onClose,
  title = 'Share Report via WhatsApp',
  message = '',
  phone = ''
}) {
  const [editableMessage, setEditableMessage] = useState(message);

  useEffect(() => {
    setEditableMessage(message);
  }, [message, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="h-[92vh] max-h-[92vh] sm:h-auto sm:max-h-[85vh]"
    >
      <Modal.Header
        title={title}
        subtitle="Preview and customize your message before broadcasting to WhatsApp groups or parents"
        icon="chat"
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-100 dark:bg-emerald-950/50"
        onClose={onClose}
      />

      <Modal.Body className="flex-1 flex flex-col min-h-0 p-3 sm:p-6 space-y-2 sm:space-y-3 overflow-hidden">
        {/* WhatsApp Chat Bubble Stylized Flex Container */}
        <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 rounded-2xl bg-[#E5DDD5] dark:bg-[#0B141A] border border-emerald-500/20 shadow-inner space-y-2 font-sans">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400 px-1 shrink-0">
            <span>WHATSAPP MESSAGE PREVIEW</span>
            {phone && <span>Target Parent: +91 {phone.slice(-10)}</span>}
          </div>

          <textarea
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            className="flex-1 min-h-[160px] w-full p-3 rounded-xl bg-white dark:bg-[#111B21] text-xs font-mono text-slate-800 dark:text-slate-100 border border-emerald-500/30 focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
          />
        </div>

        <p className="text-[11px] text-text-secondary italic shrink-0">
          💡 Tip: WhatsApp supports *bold*, _italics_, and bullet points. Choose where to send using the buttons below.
        </p>
      </Modal.Body>

      <Modal.Footer className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
        <Button variant="outlined" size="sm" onClick={onClose}>
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          {/* Action Button 1: General Share (Group / Contact Picker in WhatsApp) */}
          <Button
            variant="contained"
            size="sm"
            startIcon="groups"
            onClick={() => {
              openWhatsAppShare(editableMessage, '');
              onClose();
            }}
            className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
          >
            Share to Group / Contact
          </Button>

          {/* Action Button 2: Direct Parent Chat (if student phone available) */}
          {phone && (
            <Button
              variant="outlined"
              size="sm"
              startIcon="person"
              onClick={() => {
                openWhatsAppShare(editableMessage, phone);
                onClose();
              }}
              className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
            >
              Direct to Parent
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Preview Modal | `Modal` | `src/components/ui/Modal.jsx` |
| Action Buttons | `Button` | `src/components/ui/v2/Button.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the proposed Mobile Viewport Height & Layout Optimization for `WhatsAppShareModal`.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [MODIFY] [WhatsAppShareModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/WhatsAppShareModal.jsx)
- Pass `className="h-[92vh] max-h-[92vh] sm:h-auto sm:max-h-[85vh]"` to `<Modal>`.
- Make `Modal.Body` a flex-grow column (`flex-1 flex flex-col min-h-0`).
- Reduce outer mobile padding from `p-6` to `p-3 sm:p-6`.
- Make chat bubble container and `<textarea>` flex-grow (`flex-1 min-h-[160px] resize-none`), maximizing text display area.

---

## Verification Plan

### Manual Verification
1. Open WhatsApp Share modal on a mobile device or responsive mobile inspector ($\le 414\text{px}$).
2. Observe modal container — verify it expands smoothly to fill ~92% of screen height with an elegant 4% top/bottom margin.
3. Observe message text box — verify double padding is removed and the text box expands vertically to show nearly the entire test report message without compression.
4. Verify footer action buttons (**Share to Group / Contact**, **Cancel**) remain fixed and cleanly accessible at the bottom of the modal.
