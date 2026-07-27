---
Date: 2026-06-12T15:20:00+05:30
Status: Proposed
---

# Restructure Quick Student Lead Capture Layout to Centered Compact Page

This plan outlines the layout redesign of the Quick Student Lead form (`QuickAddStudent.jsx`) from a 12-column dual-column sidebar layout to a centered, compact single-column layout (`max-w-3xl`) with wider input rows on desktop.

## User Review Required

> [!IMPORTANT]
> **Layout Restructuring Details**:
> - **Container Bounds**: Change the card wrapper width from `max-w-5xl` (1024px) to a centered, focused `max-w-3xl` (768px).
> - **Core Inputs**: Place all primary inputs in horizontal double-column rows on desktop screens (which expands their individual widths for easier data entry):
>   - *Row 1*: Full Name and Mobile Number (`grid grid-cols-1 sm:grid-cols-2 gap-4`)
>   - *Row 2*: Email Address and Target Batch (`grid grid-cols-1 sm:grid-cols-2 gap-4`)
>   - *Row 3*: Referral ID (Half width / `col-span-1`)
>   - *Row 4*: Internal Notes (Full width textarea)
> - **Advanced CRM Options Accordion**: Move the collapsible advanced options sheet from the right sidebar column to a full-width accordion container placed directly below the core fields.
>   - *Collapsed state*: Shows a dynamic summary pill highlighting selected parameters (e.g. `Walk-In Inquiry • Hot Lead • Clear Form`).
>   - *Expanded state*: Renders advanced settings cleanly:
>     - Lead Source and Lead Status (if editing) in a `sm:grid-cols-2` row.
>     - Lead Temperature (Priority) selection options in a layout.
>     - Submit Action (Workflow) selection options in a layout.

## Stitch Redesign Prototype

We have generated and verified a new high-fidelity design prototype in Stitch Project `15095001889415551191` matching this layout:

| Viewport | Screen ID | Title | Design Preview Link |
|---|---|---|---|
| **Desktop** | `dc92ab6f15094e3d91f35bc1e19c0a78` | Quick Student Lead Capture - Dazzling ERP | [Stitch Prototype Preview](https://lh3.googleusercontent.com/aida/AP1WRLu6inrq9_4vpXnRUKyQcE0KCoMaTJfenz5p92W9nL0d-pdvXp2HlAy0qs5g0znrb72mNBI-OaEovfGlUJaf6JcggH3imTMEMcwO7-ThGkNiKbqb6kHa2MwcmySS9ab1uRTx_62Qv7zUpQK0gyakZgwm9cgZCfQHJccOPiisEJKRf8Ao0FhcAxgNySFtJ_0iwYanpGd059wuAw8b1Es7PEjk3FRxbIGJfipAHEVAahw85WoyevMdKM6ZwiFu) |

## Proposed Changes

### Student Feature

#### [MODIFY] [QuickAddStudent.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)
- **Wrapper Card Class**: Update from `max-w-5xl` to `max-w-3xl mx-auto`.
- **Form Layout**:
  - Remove the outer dual-column sidebar layout grid `grid-cols-1 lg:grid-cols-12 gap-8`.
  - Put core inputs into rows:
    - Wrap Full Name & Mobile Number in a `grid grid-cols-1 sm:grid-cols-2 gap-4` container.
    - Wrap Email & Target Batch in a `grid grid-cols-1 sm:grid-cols-2 gap-4` container.
    - Make Referral ID half width (`grid grid-cols-1 sm:grid-cols-2 gap-4` container with only one child, or wrapper `w-full sm:w-1/2`).
  - Move the Advanced Options accordion (`div` card) to be full-width, rendering directly below Internal Notes.
  - Simplify advanced settings layout:
    - Wrap Lead Source & Lead Status in a `grid grid-cols-1 sm:grid-cols-2 gap-4` container.

## Verification Plan

### Automated/Syntax Verification
- Verify that the React components compile with no syntax errors.

### Manual Verification
- Navigate to `/admin/students/add` (Quick Student Lead mode).
- Verify the form renders in a centered card (`max-w-3xl`) with double-column horizontal rows for main inputs.
- Expand and collapse the Advanced Options accordion and check the dynamic summary text updates correctly.
- Submit a student lead and check that the correct mutation and workflow behaviors are triggered.
