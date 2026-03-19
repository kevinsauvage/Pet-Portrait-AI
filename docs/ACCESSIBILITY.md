# Accessibility Guide

This document describes the accessibility features, testing, and best practices for the application.

## Overview

This application follows [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa) standards to ensure accessibility for all users, including those using assistive technologies.

## Features Implemented

### 1. Skip Links

Skip links allow keyboard users to bypass repetitive navigation and jump directly to main content areas.

**Implementation:**
- Located at the top of every page
- Visible when focused (keyboard navigation)
- Links to: Main content, Navigation, Footer

**Usage:**
- Press `Tab` on page load to focus skip links
- Press `Enter` to jump to the target section

**Component:** `src/ui/components/navigation/SkipLinks.tsx`

### 2. Semantic HTML

- Proper use of semantic elements (`<header>`, `<main>`, `<footer>`, `<nav>`)
- ARIA landmarks for screen reader navigation
- Proper heading hierarchy (h1 → h2 → h3)

### 3. Form Accessibility

All forms include:
- Proper label associations (`<label>` with `for` attribute or `aria-label`)
- Error announcements via `aria-live` regions
- Error messages linked to inputs via `aria-describedby`
- `aria-invalid` attributes on invalid fields

**Component:** `src/ui/components/shared/FormFieldError.tsx`

### 4. Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are visible
- Logical tab order
- Keyboard shortcuts where appropriate

### 5. ARIA Labels and Roles

- Icon-only buttons have `aria-label` attributes
- Decorative images have `alt=""` or `role="presentation"`
- Interactive elements have appropriate ARIA roles
- Live regions for dynamic content updates

### 6. Color Contrast

- Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Color is not the only means of conveying information
- Focus indicators have sufficient contrast

## Testing

### Automated Testing

We use [axe-core](https://github.com/dequelabs/axe-core) with Playwright for automated accessibility testing.

**Run accessibility tests:**
```bash
yarn test:a11y
```

**Run all E2E tests (including accessibility):**
```bash
yarn test:e2e
```

**Test files:**
- `e2e/accessibility.spec.ts` - Comprehensive accessibility tests

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] Skip links work correctly
- [ ] All forms can be completed with keyboard only
- [ ] Escape key closes modals/dialogs

#### Screen Reader Testing
- [ ] Test with NVDA (Windows) or VoiceOver (macOS)
- [ ] All images have descriptive alt text
- [ ] Form labels are announced correctly
- [ ] Error messages are announced
- [ ] Navigation landmarks are identified
- [ ] Dynamic content updates are announced

#### Visual Testing
- [ ] Text is readable at 200% zoom
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] No content is hidden or cut off

## Best Practices

### Writing Accessible Components

1. **Use Semantic HTML**
   ```tsx
   // Good
   <button onClick={handleClick}>Submit</button>
   
   // Bad
   <div onClick={handleClick}>Submit</div>
   ```

2. **Provide Labels**
   ```tsx
   // Good
   <label htmlFor="email">Email</label>
   <input id="email" type="email" />
   
   // Also good
   <input type="email" aria-label="Email" />
   ```

3. **Announce Errors**
   ```tsx
   <input aria-invalid={hasError} aria-describedby="email-error" />
   <div id="email-error" role="alert" aria-live="polite">
     {errorMessage}
   </div>
   ```

4. **Use ARIA Appropriately**
   ```tsx
   // Icon-only button
   <button aria-label="Close dialog">
     <XIcon />
   </button>
   
   // Decorative image
   <img src="decoration.png" alt="" role="presentation" />
   ```

5. **Keyboard Support**
   ```tsx
   <div
     role="button"
     tabIndex={0}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         handleClick();
       }
     }}
   >
     Click me
   </div>
   ```

### Common Patterns

#### Skip Links
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

#### Form Field with Error
```tsx
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <div id="email-error" role="alert" aria-live="polite">
      {error}
    </div>
  )}
</div>
```

#### Icon Button
```tsx
<button aria-label="Add to cart">
  <ShoppingCartIcon />
</button>
```

## WCAG Compliance

### Level A (Required)
- ✅ Perceivable: Text alternatives, captions
- ✅ Operable: Keyboard accessible, no seizure triggers
- ✅ Understandable: Readable, predictable
- ✅ Robust: Compatible with assistive technologies

### Level AA (Target)
- ✅ Perceivable: Contrast ratios, text resizing
- ✅ Operable: Focus indicators, multiple navigation methods
- ✅ Understandable: Consistent navigation, error identification
- ✅ Robust: Status messages

### Level AAA (Future)
- Some AAA features may be implemented where feasible
- Not required for compliance

## Tools and Resources

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools
- [NVDA](https://www.nvaccess.org/) - Free screen reader for Windows
- [VoiceOver](https://www.apple.com/accessibility/vision/) - Built-in screen reader for macOS/iOS

### Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/) - Web accessibility resources
- [A11y Project](https://www.a11yproject.com/) - Community-driven accessibility resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## CI/CD Integration

Accessibility tests run automatically in CI:

```yaml
# Example GitHub Actions
- name: Run accessibility tests
  run: yarn test:a11y
```

Tests fail the build if accessibility violations are found, ensuring accessibility is maintained.

## Reporting Issues

If you find an accessibility issue:

1. Document the issue with:
   - Page URL
   - Browser and screen reader used
   - Steps to reproduce
   - Expected vs actual behavior

2. Create an issue or fix it following the patterns in this guide

## Related Documentation

- [Form Components](./FORMS.md) - Form accessibility patterns
- [Testing Guide](./TESTING.md) - Testing strategies
- [Component Library](./COMPONENTS.md) - Reusable accessible components
