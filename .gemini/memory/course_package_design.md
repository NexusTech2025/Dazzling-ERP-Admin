# Design Specification: Course Package Cards

This document establishes the UI architecture, visual layouts, and field mapping for Course Package Cards inside the Curriculum Catalog (`/admin/courses`). It defines two density-specific variants to ensure optimal layout performance across mobile and desktop devices, based on the approved card layout.

---

## 1. Information Hierarchy & Field Mapping

To integrate the database object `pkg` with the new design, the card details are mapped as follows:

| Section | Visual Element | Source Field | Display Logic / Fallbacks |
| :--- | :--- | :--- | :--- |
| **Header** | Image/Subject Icon | Context Icon | Standard icon representing the package theme (e.g. laptop or book). |
| **Header** | Package Title | `pkg.name` | Bold, primary typography. |
| **Header** | Category / Target Tag | Combined `pkg.target_class` & `pkg.board` | E.g. `Class 10 • CBSE` or `Skills • Computer`. Rendered as a desaturated, semi-transparent outline badge. |
| **Header** | Savings Badge | `pkg.discount_percent` | E.g., `SAVE {pkg.discount_percent}%` (Show only if discount > 0). |
| **Header** | Value Tag | Inferred / Derived | E.g., `POPULAR` (if discount >= 15%), `NEW BUNDLE` (if created recently). |
| **Header** | Status Pill | `pkg.status` | Render status indicator dot + label (e.g., `Active` or `Draft`). |
| **Body** | Subject Badges | `pkg.included_courses` | Map array of subject titles to individual horizontal pills at the top of the body. |
| **Body** | Description | `pkg.description` | Desaturated, mid-density secondary text below the subject badges. |
| **Footer** | Duration & Type | `pkg.month` & `pkg.billing_type` | `{pkg.month}M • {pkg.billing_type || 'ONE-TIME'}` |
| **Footer** | Price Value | `pkg.package_fee` | Highlighted accent currency output (e.g., `₹3,200`). |
| **Footer** | View Button | Navigation Action | Button with `visibility` (Eye) icon linked to `/admin/packages/{id}`. |
| **Footer** | Edit Button | Navigation Action | Button with `edit` (Pencil) icon linked to `/admin/packages/edit/{id}`. |

---

## 2. Desktop Card Wireframe

Designed for 12-column grid containers, optimized for standard desktop viewports:

```
+---------------------------------------------------------------+
| [Icon]  Digital Literacy Core                 [SAVE 15%]      |
|         Class 10 • CBSE                       [• Active]      |
|  -----------------------------------------------------------  |
|  [Python Basics]  [Data Viz]  [Security]                      |
|                                                               |
|  Essential modern computing skills for today's landscape.     |
|  -----------------------------------------------------------  |
|  3M • ONE-TIME                                       [O] [ / ]|
|  ₹3,200                                                       |
+---------------------------------------------------------------+
```

### Visual Specifications
*   **Border Radius:** Soft professional `rounded-2xl` (16px).
*   **Header Section:** Inline row spacing containing icon, title, desaturated scope tag, dynamic discount/popularity pills, and status indicator. Checkboxes are handled externally during dynamic bulk operations and are not hardcoded inside the static card.
*   **Subject Tags:** Positioned at the top of the card body as clean rounded pills with desaturated borders.
*   **Footer Layout:** Split-row layout. Left side renders duration meta-text stacked above the large highlighted price. Right side contains the compact action icon buttons.

---

## 3. Mobile Card Wireframe (Low Density)

Optimized for smaller viewports where vertical space is constrained:

```
+---------------------------------------------------------------+
| [Icon]  Digital Literacy Core                    [• Active]   |
|         Class 10 • CBSE                                       |
|         ----------------------------------------------------  |
|         3 Courses Bundled                                     |
|         3M • ONE-TIME | ₹3,200 (15% OFF)             [O] [ / ]|
+---------------------------------------------------------------+
```

### Visual Specifications
*   **Layout:** Horizontal, space-efficient list row.
*   **Category Badge:** Rendered right below the title.
*   **Subject Tags:** Consolidated to a single pill count label (`3 Courses Bundled`) to prevent multi-line wrap shifts.
*   **Footer Details:** Metadata is condensed inline alongside action icons on the right.
