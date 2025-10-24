# The Bit Central - Design System

## Overview

Complete design system for The Bit Central marketplace with consistent visual identity, components, and patterns.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Dark/Light Mode](#darklight-mode)
7. [Responsive Design](#responsive-design)
8. [Animations](#animations)
9. [Implementation Guide](#implementation-guide)

---

## Brand Identity

### Primary Color
**#FFD83D** - Vibrant yellow representing energy, optimism, and trust

### Visual Style
- **Minimalist**: Clean, uncluttered interfaces
- **Modern**: Contemporary design patterns
- **Professional**: Trustworthy and reliable
- **Accessible**: WCAG 2.1 AA compliant

### Design Principles
1. **Clarity**: Information is easy to find and understand
2. **Consistency**: Predictable patterns across the platform
3. **Efficiency**: Minimal steps to complete tasks
4. **Delight**: Subtle animations and interactions

---

## Color System

### Primary Colors

#### Primary Yellow
```css
Main:     #FFD83D
Light:    #FFE570
Dark:     #E6C234
Contrast: #1a1a1a
```

**Usage**: 
- Primary actions (buttons, links)
- Brand elements
- Highlights and accents
- Call-to-action elements

### Background Colors (Dark Mode)

```css
Dark:    #1a1a1a  /* Main background */
Medium:  #2a2a2a  /* Cards, panels */
Light:   #3a3a3a  /* Hover states */
Lighter: #4a4a4a  /* Borders, dividers */
```

### Background Colors (Light Mode)

```css
Dark:    #ffffff  /* Main background */
Medium:  #f5f5f5  /* Cards, panels */
Light:   #e0e0e0  /* Hover states */
Lighter: #d0d0d0  /* Borders, dividers */
```

### Text Colors (Dark Mode)

```css
Primary:   #ffffff  /* Headings, important text */
Secondary: #e0e0e0  /* Body text */
Tertiary:  #b0b0b0  /* Captions, labels */
Disabled:  #808080  /* Disabled elements */
```

### Text Colors (Light Mode)

```css
Primary:   #1a1a1a  /* Headings, important text */
Secondary: #2a2a2a  /* Body text */
Tertiary:  #4a4a4a  /* Captions, labels */
Disabled:  #808080  /* Disabled elements */
```

### Semantic Colors

#### Success
```css
Main:  #4CAF50
Light: #81C784
Dark:  #388E3C
```
**Usage**: Success messages, positive actions, confirmations

#### Error
```css
Main:  #F44336
Light: #E57373
Dark:  #D32F2F
```
**Usage**: Error messages, destructive actions, warnings

#### Warning
```css
Main:  #FF9800
Light: #FFB74D
Dark:  #F57C00
```
**Usage**: Warnings, cautions, important notices

#### Info
```css
Main:  #2196F3
Light: #64B5F6
Dark:  #1976D2
```
**Usage**: Informational messages, tips, neutral actions

### Color Usage Guidelines

**Do's**:
- Use primary yellow for main actions
- Use semantic colors for their intended purpose
- Maintain sufficient contrast (4.5:1 for text)
- Test colors in both light and dark modes

**Don'ts**:
- Don't use primary yellow for backgrounds
- Don't mix semantic colors (e.g., red for success)
- Don't use low-contrast color combinations
- Don't rely solely on color to convey information

---

## Typography

### Font Family

**Primary**: System font stack
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
'Helvetica Neue', Arial, sans-serif
```

**Monospace**: For code and technical content
```css
'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
Consolas, 'Courier New', monospace
```

### Font Sizes

```css
xs:   0.75rem   (12px)
sm:   0.875rem  (14px)
base: 1rem      (16px)
lg:   1.125rem  (18px)
xl:   1.25rem   (20px)
2xl:  1.5rem    (24px)
3xl:  1.875rem  (30px)
4xl:  2.25rem   (36px)
5xl:  3rem      (48px)
```

### Font Weights

```css
Light:     300
Normal:    400
Medium:    500
Semibold:  600
Bold:      700
Extrabold: 800
```

### Line Heights

```css
Tight:   1.25  /* Headings */
Normal:  1.5   /* Body text */
Relaxed: 1.75  /* Long-form content */
```

### Heading Styles

```css
H1: 3rem (48px), Bold, Tight
H2: 2.25rem (36px), Bold, Tight
H3: 1.875rem (30px), Bold, Tight
H4: 1.5rem (24px), Semibold, Tight
H5: 1.25rem (20px), Semibold, Normal
H6: 1.125rem (18px), Semibold, Normal
```

### Typography Guidelines

**Do's**:
- Use headings hierarchically (H1 → H2 → H3)
- Maintain consistent line heights
- Use appropriate font weights for emphasis
- Keep line length between 50-75 characters

**Don'ts**:
- Don't skip heading levels
- Don't use all caps for long text
- Don't use multiple font families
- Don't use font sizes smaller than 14px for body text

---

## Spacing & Layout

### Spacing Scale

```css
xs:  0.25rem  (4px)
sm:  0.5rem   (8px)
md:  1rem     (16px)
lg:  1.5rem   (24px)
xl:  2rem     (32px)
2xl: 3rem     (48px)
3xl: 4rem     (64px)
4xl: 6rem     (96px)
```

### Border Radius

```css
none: 0
sm:   0.25rem  (4px)
md:   0.5rem   (8px)
lg:   0.75rem  (12px)
xl:   1rem     (16px)
2xl:  1.5rem   (24px)
full: 9999px
```

### Shadows

```css
sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05)
md:   0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1)
2xl:  0 25px 50px -12px rgba(0, 0, 0, 0.25)
glow: 0 0 20px rgba(255, 216, 61, 0.3)
```

### Container Widths

```css
xs:  320px
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Grid System

**12-column grid** with responsive breakpoints

```css
/* Mobile First */
.col-12  /* Full width */
.col-6   /* Half width */
.col-4   /* Third width */
.col-3   /* Quarter width */

/* Responsive */
.sm:col-6  /* Half on small screens */
.md:col-4  /* Third on medium screens */
.lg:col-3  /* Quarter on large screens */
```

---

## Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Primary Action
</button>
```

**Styles**:
- Background: Primary yellow (#FFD83D)
- Text: Dark (#1a1a1a)
- Hover: Lighter yellow + glow + lift
- Padding: 0.75rem 1.5rem
- Border radius: 0.5rem

#### Secondary Button
```html
<button class="btn btn-secondary">
  Secondary Action
</button>
```

**Styles**:
- Background: Light gray (#3a3a3a)
- Text: White (#ffffff)
- Hover: Lighter gray
- Same padding and radius as primary

#### Outline Button
```html
<button class="btn btn-outline">
  Outline Action
</button>
```

**Styles**:
- Background: Transparent
- Border: 2px solid primary
- Text: Primary yellow
- Hover: Filled with primary

#### Button Sizes
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    Card footer
  </div>
</div>
```

**Styles**:
- Background: Medium gray (#2a2a2a)
- Border radius: 0.75rem
- Padding: 1.5rem
- Shadow: Medium
- Hover: Lift + larger shadow

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-info">Info</span>
```

**Styles**:
- Padding: 0.25rem 0.75rem
- Font size: 0.875rem
- Border radius: Full (pill shape)
- Font weight: Medium

### Inputs

```html
<input type="text" class="input" placeholder="Enter text">
```

**Styles**:
- Background: Light gray (#3a3a3a)
- Border: 1px solid medium gray
- Padding: 0.75rem 1rem
- Border radius: 0.5rem
- Focus: Primary border + glow

### Loading Spinner

```html
<div class="spinner"></div>
```

**Styles**:
- Size: 2rem
- Border: 3px
- Color: Primary yellow
- Animation: Spin 0.8s

---

## Dark/Light Mode

### Implementation

#### ThemeProvider
```typescript
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

#### Using Theme
```typescript
import { useTheme } from './theme/ThemeProvider';

function Component() {
  const { mode, theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Toggle to {mode === 'dark' ? 'light' : 'dark'} mode
    </button>
  );
}
```

### Theme Toggle Button

```html
<button class="theme-toggle">
  <!-- Sun icon for dark mode -->
  <!-- Moon icon for light mode -->
</button>
```

**Behavior**:
- Saves preference to localStorage
- Respects system preference initially
- Smooth transition between modes
- Updates meta theme-color

### Color Adjustments

**Dark Mode**:
- High contrast for readability
- Darker backgrounds
- Lighter text
- Subtle shadows

**Light Mode**:
- Lower contrast for comfort
- Lighter backgrounds
- Darker text
- More pronounced shadows

---

## Responsive Design

### Breakpoints

```css
xs:  320px  /* Small phones */
sm:  640px  /* Large phones */
md:  768px  /* Tablets */
lg:  1024px /* Laptops */
xl:  1280px /* Desktops */
2xl: 1536px /* Large desktops */
```

### Mobile-First Approach

**Base styles**: Mobile (320px+)
**Progressive enhancement**: Add complexity for larger screens

```css
/* Mobile first */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

### Responsive Patterns

#### Stack to Grid
```css
/* Mobile: Stack */
.grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Desktop: Grid */
@media (min-width: 768px) {
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Hide/Show Elements
```css
/* Hide on mobile */
.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}

/* Hide on desktop */
.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}
```

### Touch-Friendly Design

**Minimum touch target**: 44x44px

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem;
}
```

**Spacing between targets**: Minimum 8px

```css
.touch-list > * + * {
  margin-top: 0.5rem;
}
```

---

## Animations

### Transitions

```css
Fast:   150ms ease-in-out  /* Hover states */
Normal: 300ms ease-in-out  /* Most transitions */
Slow:   500ms ease-in-out  /* Complex animations */
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 300ms ease-in-out;
}
```

#### Slide In
```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideIn 300ms ease-in-out;
}
```

#### Spin (Loading)
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 0.8s linear infinite;
}
```

### Hover Effects

#### Button Lift
```css
.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}
```

#### Card Lift
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Icon Rotate
```css
.theme-toggle:hover {
  transform: rotate(15deg);
}
```

### Animation Guidelines

**Do's**:
- Use subtle animations
- Keep duration under 500ms
- Provide reduced motion option
- Use easing functions

**Don'ts**:
- Don't animate everything
- Don't use long durations
- Don't ignore accessibility
- Don't use jarring movements

---

## Implementation Guide

### 1. Setup Theme

```bash
# Install dependencies (if needed)
npm install

# Import global styles
# In your main App.tsx or index.tsx
import './styles/globals.css';
```

### 2. Wrap App with ThemeProvider

```typescript
// App.tsx
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 3. Use Theme in Components

```typescript
import { useTheme } from './theme/ThemeProvider';

function Component() {
  const { mode, theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.background.dark,
      color: theme.colors.text.primary,
    }}>
      Current mode: {mode}
    </div>
  );
}
```

### 4. Use CSS Classes

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>

<!-- Cards -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">Content</div>
</div>

<!-- Badges -->
<span class="badge badge-success">Success</span>

<!-- Inputs -->
<input type="text" class="input" placeholder="Enter text">
```

### 5. Add Theme Toggle

```typescript
import ThemeToggle from './components/ThemeToggle';

function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation */}
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

---

## Best Practices

### Accessibility

1. **Color Contrast**: Maintain 4.5:1 ratio for text
2. **Focus States**: Visible focus indicators
3. **Keyboard Navigation**: All interactive elements accessible
4. **Screen Readers**: Proper ARIA labels
5. **Reduced Motion**: Respect prefers-reduced-motion

### Performance

1. **CSS Variables**: Use for dynamic theming
2. **Transitions**: Hardware-accelerated properties (transform, opacity)
3. **Images**: Optimize and lazy load
4. **Fonts**: Use system fonts when possible
5. **Bundle Size**: Tree-shake unused styles

### Consistency

1. **Component Library**: Use predefined components
2. **Spacing**: Use spacing scale
3. **Colors**: Use theme colors
4. **Typography**: Use defined styles
5. **Patterns**: Follow established patterns

---

## Resources

### Files Created

```
app/src/theme/
├── theme.ts              # Theme configuration
└── ThemeProvider.tsx     # Theme context provider

app/src/components/
└── ThemeToggle.tsx       # Theme toggle button

app/src/styles/
└── globals.css           # Global styles
```

### Usage Examples

See individual component files for implementation examples.

### Design Tools

- **Figma**: Design mockups
- **ColorBox**: Color palette generation
- **Type Scale**: Typography scale calculator
- **Contrast Checker**: WCAG compliance

---

## Conclusion

The Bit Central design system provides:

✅ Consistent visual identity
✅ Comprehensive component library
✅ Dark/light mode support
✅ Responsive design patterns
✅ Accessibility compliance
✅ Performance optimization

All components follow the design system and are production-ready.

---

**Status**: ✅ Implementation Complete

**Version**: 1.0.0

**Last Updated**: 2025-10-24
