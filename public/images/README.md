# VMS Images & Assets Structure

This directory contains all static images and assets for the VMS (Vendor Management System) application.

## Directory Structure

```
public/images/
├── icons/           # Custom icons and symbols
├── avatars/         # User profile pictures and default avatars
├── backgrounds/     # Background images for pages and sections
├── illustrations/   # SVG illustrations and graphics
└── logos/           # VMS application logos and branding
```

## File Naming Conventions

### General Rules
- Use kebab-case for all file names
- Include size suffix when multiple sizes exist
- Use semantic names that describe the content

### Examples
```
icons/
├── vendor-icon.svg
├── contract-icon.svg
├── order-icon.svg
├── report-icon.svg
└── dashboard-icon.svg

avatars/
├── default-avatar.svg
├── user-placeholder.png
├── admin-avatar.jpg
└── manager-avatar.jpg

backgrounds/
├── dashboard-bg.jpg
├── login-bg.svg
├── hero-pattern.svg
└── vendor-grid-bg.png

illustrations/
├── empty-state-vendors.svg
├── no-data-found.svg
├── contract-lifecycle.svg
├── vendor-onboarding.svg
└── procurement-process.svg

logos/
├── vms-logo.svg
├── vms-logo-dark.svg
├── vms-icon.svg
└── vms-wordmark.svg
```

## Image Specifications

### Logos
- **Format**: SVG preferred, PNG fallback
- **Background**: Transparent
- **Size**: Vector-based, scalable
- **Colors**: Primary brand colors

### Icons
- **Format**: SVG
- **Size**: 24x24px base size (scalable)
- **Style**: Consistent line weight and style
- **Colors**: Use CSS variables for theming

### Avatars
- **Format**: WebP preferred, JPG/PNG fallback
- **Size**: 256x256px, 128x128px, 64x64px, 32x32px
- **Shape**: Square (will be styled as circles via CSS)

### Vendor Images
- **Format**: WebP preferred, JPG/PNG fallback
- **Logos**: 200x200px minimum
- **Banners**: 1200x400px
- **Thumbnails**: 300x200px

### Backgrounds
- **Format**: WebP preferred, JPG fallback
- **Size**: Multiple sizes for responsive design
- **Optimization**: Compressed for web delivery

## Usage Guidelines

### Import Examples
```javascript
// Static imports
import vmsLogo from '/images/logos/vms-logo.svg';

// Dynamic imports
const userAvatar = `/images/avatars/${userId}-avatar.jpg`;
```

### Next.js Image Component
```jsx
import Image from 'next/image';

// Optimized image loading
<Image
  src="/images/logos/vms-logo.svg"
  alt="VMS Logo"
  width={200}
  height={100}
  className="app-logo"
/>
```

### CSS Background Images
```css
.hero-section {
  background-image: url('/images/backgrounds/dashboard-bg.jpg');
  background-size: cover;
  background-position: center;
}
```

## Optimization

- All images should be optimized for web delivery
- Use modern formats (WebP) with fallbacks
- Implement responsive images for different screen sizes
- Consider lazy loading for non-critical images
- Use SVG for icons and simple graphics
- Compress JPEG/PNG images appropriately

## Accessibility

- Always provide meaningful alt text
- Use descriptive file names
- Consider high contrast versions for accessibility
- Ensure icons have text alternatives or ARIA labels

## Performance

- Keep file sizes as small as possible
- Use appropriate formats for content type
- Implement lazy loading where appropriate
- Consider using a CDN for production
- Use Next.js Image component for automatic optimization