# Design System

## Overview

The Family Wealth design system provides a consistent set of components, styles, and patterns for building the user interface. All components are built with React, TypeScript, and Tailwind CSS.

## Color Palette

### Primary Colors

- **Blue (Primary)**: Used for main actions and important elements
  - Hover: `#2563eb` (600)
  - Active: `#1d4ed8` (700)
  - Default: `#3b82f6` (500)

- **Green (Secondary)**: Used for positive actions and success states
  - Default: `#22c55e` (500)
  - Hover: `#16a34a` (600)

- **Purple (Accent)**: Used for special features and highlights
  - Default: `#a855f7` (500)
  - Hover: `#9333ea` (600)

### Status Colors

- **Success**: `#10b981` - For successful operations
- **Warning**: `#f59e0b` - For warnings and alerts
- **Error**: `#ef4444` - For errors and destructive actions
- **Info**: `#3b82f6` - For informational messages

## Spacing

Consistent spacing scale for margins, padding, and gaps:

- `xs` - 4px
- `sm` - 8px
- `md` - 16px
- `lg` - 24px
- `xl` - 32px
- `2xl` - 48px
- `3xl` - 64px

## Typography

### Font Family

- **Sans-serif** (Default): System fonts for better performance
- **Monospace**: For code blocks and technical content

### Font Sizes

- `xs`: 12px - Small labels and captions
- `sm`: 14px - Secondary text
- `base`: 16px - Body text (default)
- `lg`: 18px - Large text
- `xl`: 20px - Headings (H4)
- `2xl`: 24px - Headings (H3)
- `3xl`: 30px - Headings (H2)
- `4xl`: 36px - Headings (H1)

### Font Weights

- `light`: 300 - Minimal emphasis
- `normal`: 400 - Body text
- `medium`: 500 - Labels and secondary headings
- `semibold`: 600 - Prominent elements
- `bold`: 700 - Headings and strong emphasis

## Components

### Button

Primary interactive element for actions.

```tsx
import { Button } from '@ui/components';

export default function MyComponent() {
  return (
    <Button variant="primary" size="md" onClick={() => {}}>
      Click Me
    </Button>
  );
}
```

**Variants:**
- `primary` - Blue, for primary actions
- `secondary` - Green, for secondary actions
- `outline` - Outlined button
- `ghost` - Minimal button with no background

**Sizes:**
- `sm` - Small (12px text)
- `md` - Medium (16px text)
- `lg` - Large (18px text)

**Props:**
- `disabled` - Disable the button
- `loading` - Show loading state
- `children` - Button content

### Card

Container for grouping related content.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@ui/components';

export default function MyCard() {
  return (
    <Card>
      <CardHeader>
        <h2>Title</h2>
      </CardHeader>
      <CardBody>
        <p>Content goes here</p>
      </CardBody>
      <CardFooter>
        <button>Action</button>
      </CardFooter>
    </Card>
  );
}
```

**Props:**
- `hoverable` - Add hover effect

### Input

Text input field with validation support.

```tsx
import { Input } from '@ui/components';

export default function MyForm() {
  return (
    <Input
      label="Email"
      type="email"
      placeholder="user@example.com"
      error={errors.email}
      helperText="We'll never share your email"
    />
  );
}
```

**Props:**
- `label` - Label text above input
- `error` - Error message (shows in red)
- `helperText` - Helper text below input
- `required` - Mark field as required
- All standard HTML input props

## Usage

### Importing Components

```tsx
// Import from the UI package
import { Button, Card, Input } from '@ui/components';

// Use them in your component
export default function MyComponent() {
  return (
    <Card>
      <Input label="Name" placeholder="Enter your name" />
      <Button>Submit</Button>
    </Card>
  );
}
```

### Theming

All components use Tailwind CSS classes and the design system colors. To customize:

1. Edit `apps/web/tailwind.config.ts` for frontend
2. Update component classes as needed

### Accessibility

All components follow WAI-ARIA guidelines:

- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Color contrast compliance

## Creating New Components

When adding new components:

1. Create the component in `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Write TypeScript interfaces for props
4. Use Tailwind classes for styling
5. Add JSDoc comments for documentation
6. Include accessibility features

Example:

```tsx
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-green-100 text-green-800',
      success: 'bg-emerald-100 text-emerald-800',
      error: 'bg-red-100 text-red-800',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full
          text-sm font-medium
          ${variantStyles[variant]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
```

## Future Plans

- [ ] Storybook integration for component documentation
- [ ] Interactive component playground
- [ ] Animation guidelines
- [ ] Icon library
- [ ] Form validation patterns
- [ ] Dark mode support
- [ ] Component variants documentation
