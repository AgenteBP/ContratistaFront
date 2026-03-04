# Design System: ProCer (ContratistaFront)

This document serves as the "source of truth" for the design language used in the ProCer project. It details the visual theme, color palette, typography, and component styling to ensure consistency across the application.

## 1. Visual Theme & Atmosphere

The ProCer interface is designed with a **Clean Industrial** aesthetic. It aims to be **professional, dependable, and efficient**, focusing on clear data presentation for utility and contractor management. The atmosphere is **Utilitarian yet Premium**, characterized by high contrast between dark text and light backgrounds, with vibrant indigo and lime accents providing a modern feel.

## 2. Color Palette & Roles

The system uses a combination of modern Indigo for brand identity and high-visibility Lime for success states, supported by a neutral slate scale for structure.

### Brand Identity
*   **Vibrant Indigo (#6366f1):** Primary brand color. Used for main actions, active states, and focus rings.
*   **Deep Indigo-Hover (#4f46e5):** Darker variation used for hover states on primary elements.
*   **Soft Indigo-Light (#e0e7ff):** Used for subtle backgrounds, row highlights, and ring effects.

### Structure & Neutrals
*   **Slate-Dark (#1e293b):** Used for headings and primary body text to ensure maximum readability.
*   **Slate-Standard (#64748b):** Used for icons, borders, and secondary text.
*   **Slate-App-Background (#f8fafc):** General background for the application, providing a clean, "airy" feel.
*   **Pure White (#ffffff):** Surface color for cards, containers, and inputs.

### Semantic Feedback
*   **Electric Lime (#84cc16):** Success color. Used for affirmative actions, graduation badges, and "Success" notifications.
*   **Electric Lime-Light (#ecfccb):** Background for success badges and alerts.
*   **Standard Red (#ef4444):** Danger/Error color. Used for destructive actions and error states.
*   **Standard Amber (#f59e0b):** Warning color. Used for cautionary information.
*   **Standard Sky (#0ea5e9):** Info color. Used for neutral informative messages.

## 3. Typography Rules

*   **Font Family:** Primarily **Inter** (sans-serif), chosen for its exceptional readability in dense data environments.
*   **Headings:** Bold and extra-bold weights (700-800) using `Slate-Dark` for a strong hierarchical structure.
*   **Body Text:** Medium weight (500) for regular content, ensuring clarity without overwhelming the user.
*   **Buttons:** Semibold (600) to provide a firm, actionable character.

## 4. Component Stylings

### Buttons
*   **Shape:** Gently rounded corners (`rounded-lg` or `border-radius: 8px`). Some specialized buttons (like Sign In) use a **Pill-shaped** (`rounded-full`) design for a friendlier interaction.
*   **Weight:** All buttons feature a semibold font-weight (600) for a premium industrial feel.

### Cards & Containers
*   **Geometry:** Subtly rounded corners (`rounded-xl` or `12px`).
*   **Depth:** Uses **whisper-soft diffused shadows** (`shadow-lg` with low opacity) to create subtle elevation without clutter.
*   **Borders:** Fine, low-contrast borders (`Slate-200`) are used to define boundaries on white surfaces.

### Inputs & Forms
*   **Style:** Clean white background with secondary slate borders.
*   **Feedback:** Active inputs feature a vibrant indigo border and a soft indigo-light focus ring (`ring-4`).
*   **Roundness:** Standardized at `8px` for consistency with button geometry.

### Toasts & Notifications
*   **Design:** Premium floating cards with a solid colored left-border indicating the status (Lime for Success, Red for Error).
*   **Interactions:** Micro-interaction on hover (slight lift) and crisp, legible typography.

## 5. Layout Principles

*   **Grid Alignment:** Follows a structured grid system for layout stability, especially in complex forms and data tables.
*   **Whitespace:** Generous padding (`p-4`, `p-8`) is used around main containers to reduce cognitive load in data-heavy views.
*   **Responsive Strategy:** Tables are optimized for mobile by hiding secondary toggles and using card-like layouts when space is restricted.
