# Design System Documentation

## Overview

This design system is centralized in `lib/design-system.ts` and `app/globals.css` to allow easy updates from a single location.

## Color System

All colors are defined in `lib/design-system.ts` and mapped to CSS variables in `app/globals.css`.

### Primary Colors
- **Primary Font**: `#1A1A1A` - Main text color
- **Secondary Font**: `#888888` - Secondary text color
- **Description Font**: `#E0E0E0` - Description/subtitle text color

### UI Colors
- **Border**: `#F7F7F7` - Border color
- **Left Panel**: `#444444` - Sidebar/left panel background
- **Tab Background**: `#FAFAFA` - Tab background color
- **Button Default**: `#3C3C3C` - Default button background
- **Icon**: `#888888` - Icon color

### Usage in Components

```tsx
// Using CSS variables (recommended)
<div className="bg-left-panel text-primary-font">
  Content
</div>

// Using Tailwind classes
<div className="text-[#1A1A1A] bg-[#444444]">
  Content
</div>

// Using design system import
import { colors } from '@/lib/design-system';
<div style={{ color: colors.primaryFont }}>
  Content
</div>
```

## Typography System

### Font Family
- **Primary**: Inter (loaded via Next.js font optimization)

### Heading Styles
- **H1**: 24px / 36px line-height / 600 weight
- **H2**: 14px / 21px line-height / 600 weight
- **H3**: 12px / 18px line-height / 400 weight

### Usage

```tsx
// Automatic via HTML tags
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Description text</h3>

// Using utility classes
<div className="text-[24px] leading-[36px] font-semibold">
  Custom heading
</div>

// Using design system import
import { typographyClasses } from '@/lib/tailwind-utils';
<div className={typographyClasses.h1}>
  Heading
</div>
```

## Updating the Design System

### To Change Colors:

1. **Update `lib/design-system.ts`**:
```typescript
export const colors = {
  primaryFont: '#NEW_COLOR',
  // ... other colors
};
```

2. **Update `app/globals.css`**:
```css
:root {
  --primary-font: #NEW_COLOR;
}
```

### To Change Typography:

1. **Update `lib/design-system.ts`**:
```typescript
export const typography = {
  heading: {
    h1: {
      fontSize: '28px', // new size
      lineHeight: '40px', // new line height
    },
  },
};
```

2. **Update `app/globals.css`**:
```css
h1 {
  font-size: 28px;
  line-height: 40px;
}
```

## Dark Mode

Dark mode colors are automatically handled via the `.dark` class. Update dark mode colors in:
- `lib/design-system.ts` → `darkColors` object
- `app/globals.css` → `.dark` selector

## Available Utility Classes

- `.text-primary-font` - Primary text color
- `.text-secondary-font` - Secondary text color
- `.text-description-font` - Description text color
- `.bg-left-panel` - Left panel background
- `.bg-tab-background` - Tab background
- `.bg-button-default` - Button default background
- `.text-icon` - Icon color
- `.border-design` - Design system border color

