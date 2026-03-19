/**
 * VMS Image Utilities
 * Centralized image management and helper functions
 */

// Image base paths
export const IMAGE_PATHS = {
  icons: '/images/icons',
  avatars: '/images/avatars',
  backgrounds: '/images/backgrounds',
  illustrations: '/images/illustrations',
  logos: '/images/logos',
} as const;

// Default images
export const DEFAULT_IMAGES = {
  avatar: '/images/avatars/default-avatar.svg',
  userPlaceholder: '/images/avatars/user-placeholder.png',
  noData: '/images/illustrations/no-data-found.svg',
  emptyState: '/images/illustrations/empty-state.svg',
} as const;

// VMS Brand Assets
export const VMS_ASSETS = {
  logo: '/images/logos/vms-logo.svg',
  logoDark: '/images/logos/vms-logo-dark.svg',
  icon: '/images/logos/vms-icon.svg',
  wordmark: '/images/logos/vms-wordmark.svg',
} as const;

/**
 * Get user avatar URL with fallback
 * @param userId - User identifier
 * @param size - Avatar size ('sm', 'md', 'lg', 'xl')
 * @param format - Image format (default: 'jpg')
 * @returns Image URL with fallback
 */
export function getUserAvatar(
  userId?: string, 
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  format: 'png' | 'jpg' | 'webp' = 'jpg'
): string {
  if (!userId) return DEFAULT_IMAGES.avatar;
  
  const sizeMap = {
    sm: '32',
    md: '64', 
    lg: '128',
    xl: '256'
  };
  
  return `${IMAGE_PATHS.avatars}/${userId}-${sizeMap[size]}.${format}`;
}

/**
 * Get icon URL
 * @param iconName - Icon name
 * @param variant - Icon variant (default: 'outline')
 * @returns Icon URL
 */
export function getIcon(iconName: string, variant: 'outline' | 'filled' | 'solid' = 'outline'): string {
  return `${IMAGE_PATHS.icons}/${iconName}-${variant}.svg`;
}

/**
 * Get background image URL
 * @param imageName - Background image name
 * @param format - Image format (default: 'jpg')
 * @returns Background image URL
 */
export function getBackgroundImage(imageName: string, format: 'jpg' | 'png' | 'webp' = 'jpg'): string {
  return `${IMAGE_PATHS.backgrounds}/${imageName}.${format}`;
}

/**
 * Get illustration URL
 * @param illustrationName - Illustration name
 * @returns Illustration URL (always SVG)
 */
export function getIllustration(illustrationName: string): string {
  return `${IMAGE_PATHS.illustrations}/${illustrationName}.svg`;
}

/**
 * Generate srcSet for responsive images
 * @param basePath - Base image path without extension
 * @param format - Image format
 * @param sizes - Array of sizes
 * @returns srcSet string
 */
export function generateSrcSet(
  basePath: string, 
  format: string, 
  sizes: number[] = [320, 640, 1024, 1920]
): string {
  return sizes
    .map(size => `${basePath}-${size}w.${format} ${size}w`)
    .join(', ');
}

/**
 * Check if image exists (client-side)
 * @param imageUrl - Image URL to check
 * @returns Promise<boolean>
 */
export function imageExists(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}

/**
 * Preload critical images
 * @param imageUrls - Array of image URLs to preload
 */
export function preloadImages(imageUrls: string[]): void {
  if (typeof window === 'undefined') return;
  
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get optimized image props for Next.js Image component
 * @param src - Image source
 * @param alt - Alt text
 * @param width - Image width
 * @param height - Image height
 * @param priority - Whether to prioritize loading
 * @returns Optimized image props
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  width: number,
  height: number,
  priority: boolean = false
) {
  return {
    src,
    alt,
    width,
    height,
    priority,
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  };
}

// Image optimization settings
export const IMAGE_SETTINGS = {
  quality: {
    high: 95,
    medium: 85,
    low: 70,
  },
  formats: {
    modern: ['webp', 'avif'],
    fallback: ['jpg', 'png'],
  },
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
    xlarge: 1920,
  },
} as const;