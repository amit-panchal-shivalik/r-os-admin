/**
 * Tailwind Utility Functions
 * 
 * Helper functions to use design system tokens in Tailwind classes
 */

import { designSystem } from './design-system';

/**
 * Get color class name from design system
 */
export const getColorClass = (colorName: keyof typeof designSystem.colors) => {
  return `text-[${designSystem.colors[colorName]}]`;
};

/**
 * Get background color class name from design system
 */
export const getBgColorClass = (colorName: keyof typeof designSystem.colors) => {
  return `bg-[${designSystem.colors[colorName]}]`;
};

/**
 * Typography utility classes based on design system
 */
export const typographyClasses = {
  h1: 'text-[24px] leading-[36px] font-semibold text-primary-font',
  h2: 'text-[14px] leading-[21px] font-semibold text-primary-font',
  h3: 'text-[12px] leading-[18px] font-normal text-description-font',
} as const;

/**
 * Spacing utility classes
 */
export const spacingClasses = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
  '3xl': 'p-16',
} as const;

export default {
  getColorClass,
  getBgColorClass,
  typographyClasses,
  spacingClasses,
};

