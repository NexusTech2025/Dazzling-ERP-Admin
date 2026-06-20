For screens wider than `1024px` (Tailwind's `lg:` breakpoint), we can use the following classes in our `slotClasses.container` property to achieve a dynamic, centered layout that expands beautifully while remaining compact on mobile/tablet viewports:

### 1. Narrow Forms (e.g., Course / Subject Creation Forms)
*   **Breakpoint Classes**: `w-full lg:max-w-4xl lg:mx-auto`
*   **Result**: 100% width on mobile/tablet; centers and caps at **896px** width for desktop viewports.

### 2. Medium density Forms (e.g., Two-Column Batch / Teacher Forms)
*   **Breakpoint Classes**: `w-full lg:max-w-5xl lg:mx-auto`
*   **Result**: 100% width on mobile/tablet; centers and caps at **1024px** width on desktop.

### 3. Wide Directories & Dashboard Lists (e.g., Student Registry, Batch Directories)
*   **Breakpoint Classes**: `w-full lg:max-w-7xl lg:mx-auto`
*   **Result**: 100% width on mobile/tablet; centers and caps at **1280px** width on desktop.

### 4. Extra Large Dashboard Canvas (High density overview panels)
*   **Breakpoint Classes**: `w-full xl:max-w-screen-2xl xl:mx-auto`
*   **Result**: Stretches full-width up to **1536px** (`xl`/`2xl`) for extra large screens, keeping details readable on ultra-wide desktop monitors without text lines becoming too wide.