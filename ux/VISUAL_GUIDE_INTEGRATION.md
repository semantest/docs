# Semantest Visual Guide Integration Documentation

## Overview

Comprehensive integration guide for visual design elements across the Semantest platform. This document provides detailed specifications for implementing visual components, maintaining design consistency, and ensuring seamless integration between functional features and visual design systems.

## Table of Contents

1. [Visual Design System Overview](#visual-design-system-overview)
2. [Component Integration Framework](#component-integration-framework)
3. [Design Token Implementation](#design-token-implementation)
4. [Visual Hierarchy Guidelines](#visual-hierarchy-guidelines)
5. [Interactive Visual Elements](#interactive-visual-elements)
6. [Animation and Transition System](#animation-and-transition-system)
7. [Responsive Design Integration](#responsive-design-integration)
8. [Accessibility Visual Standards](#accessibility-visual-standards)
9. [Visual Testing Guidelines](#visual-testing-guidelines)
10. [Design-Development Workflow](#design-development-workflow)

## Visual Design System Overview

### Core Design Principles

```yaml
design_principles:
  consistency:
    description: "Unified visual language across all interfaces"
    implementation:
      - Standardized component library
      - Consistent spacing system
      - Unified color palette
      - Coherent typography scale
  
  clarity:
    description: "Clear visual communication and hierarchy"
    implementation:
      - Strategic use of whitespace
      - Clear visual priorities
      - Intuitive information architecture
      - Scannable content layouts
  
  accessibility:
    description: "Inclusive design for all users"
    implementation:
      - WCAG 2.1 AAA compliance
      - High contrast options
      - Scalable typography
      - Focus indicators
  
  performance:
    description: "Optimized visual performance"
    implementation:
      - Efficient asset loading
      - Progressive enhancement
      - Hardware acceleration
      - Minimal paint operations
```

### Visual Language Definition

```yaml
visual_language:
  brand_personality:
    primary_attributes:
      - Professional
      - Modern
      - Trustworthy
      - Innovative
    
    visual_expression:
      - Clean geometric shapes
      - Subtle depth through shadows
      - Purposeful color usage
      - Balanced compositions
  
  design_style:
    aesthetic: "Modern minimalist with technical precision"
    influences:
      - Material Design 3
      - Apple Human Interface
      - IBM Carbon Design
      - Microsoft Fluent
    
    characteristics:
      - Flat design with subtle depth
      - Functional animation
      - Data-driven layouts
      - Technical clarity
```

## Component Integration Framework

### Visual Component Architecture

```yaml
component_architecture:
  atomic_design_structure:
    atoms:
      - Buttons
      - Icons
      - Input fields
      - Labels
      - Color swatches
    
    molecules:
      - Form groups
      - Card headers
      - Navigation items
      - Status indicators
      - Data cells
    
    organisms:
      - Complete forms
      - Data tables
      - Navigation bars
      - Card layouts
      - Modal dialogs
    
    templates:
      - Page layouts
      - Dashboard grids
      - Report structures
      - Workflow layouts
    
    pages:
      - Complete interfaces
      - User flows
      - Application states
```

### Component Visual Specifications

```yaml
button_visual_specs:
  primary_button:
    dimensions:
      height: 48px
      min_width: 120px
      padding: "16px 24px"
      border_radius: 8px
    
    colors:
      default:
        background: "#2563EB"
        text: "#FFFFFF"
        border: "none"
      
      hover:
        background: "#1D4ED8"
        text: "#FFFFFF"
        transform: "translateY(-1px)"
        box_shadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
      
      active:
        background: "#1E40AF"
        transform: "translateY(0)"
        box_shadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
      
      disabled:
        background: "#E5E7EB"
        text: "#9CA3AF"
        cursor: "not-allowed"
    
    typography:
      font_family: "'Inter', system-ui, sans-serif"
      font_size: 16px
      font_weight: 600
      line_height: 1.5
      letter_spacing: "-0.01em"
    
    transitions:
      duration: 200ms
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      properties: ["background-color", "transform", "box-shadow"]

  secondary_button:
    extends: primary_button
    colors:
      default:
        background: "transparent"
        text: "#2563EB"
        border: "2px solid #2563EB"
      
      hover:
        background: "#EFF6FF"
        text: "#1D4ED8"
        border: "2px solid #1D4ED8"

card_visual_specs:
  base_card:
    dimensions:
      padding: 24px
      border_radius: 12px
      min_height: 120px
    
    appearance:
      background: "#FFFFFF"
      border: "1px solid #E5E7EB"
      box_shadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    
    hover_state:
      box_shadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
      transform: "translateY(-2px)"
      transition: "all 200ms ease"
    
    dark_mode:
      background: "#1F2937"
      border: "1px solid #374151"
      box_shadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
```

## Design Token Implementation

### Token Architecture

```javascript
// Design token structure
const designTokens = {
  // Color tokens
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    
    semantic: {
      success: {
        light: '#10B981',
        default: '#059669',
        dark: '#047857',
      },
      warning: {
        light: '#F59E0B',
        default: '#D97706',
        dark: '#B45309',
      },
      error: {
        light: '#EF4444',
        default: '#DC2626',
        dark: '#B91C1C',
      },
      info: {
        light: '#3B82F6',
        default: '#2563EB',
        dark: '#1D4ED8',
      },
    },
    
    neutral: {
      0: '#FFFFFF',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      1000: '#000000',
    },
  },
  
  // Typography tokens
  typography: {
    fontFamilies: {
      sans: "'Inter', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing tokens
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  
  // Shadow tokens
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Border radius tokens
  borderRadius: {
    none: '0px',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  
  // Animation tokens
  animations: {
    durations: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
    },
    
    easings: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
```

### Token Usage Guidelines

```javascript
// Token usage in components
const StyledButton = styled.button`
  /* Using design tokens for consistency */
  background-color: ${props => props.primary 
    ? designTokens.colors.primary[600]
    : designTokens.colors.neutral[100]};
  
  color: ${props => props.primary 
    ? designTokens.colors.neutral[0]
    : designTokens.colors.neutral[900]};
  
  font-family: ${designTokens.typography.fontFamilies.sans};
  font-size: ${designTokens.typography.fontSizes.base};
  font-weight: ${designTokens.typography.fontWeights.semibold};
  line-height: ${designTokens.typography.lineHeights.normal};
  
  padding: ${designTokens.spacing[3]} ${designTokens.spacing[6]};
  border-radius: ${designTokens.borderRadius.base};
  
  box-shadow: ${designTokens.shadows.sm};
  transition: all ${designTokens.animations.durations.normal} 
              ${designTokens.animations.easings.easeInOut};
  
  &:hover {
    box-shadow: ${designTokens.shadows.md};
    transform: translateY(-1px);
  }
  
  &:active {
    box-shadow: ${designTokens.shadows.sm};
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: ${designTokens.colors.neutral[200]};
    color: ${designTokens.colors.neutral[400]};
    cursor: not-allowed;
    box-shadow: none;
  }
`;
```

## Visual Hierarchy Guidelines

### Information Architecture

```yaml
visual_hierarchy:
  principles:
    z_index_scale:
      base: 0
      dropdown: 1000
      sticky: 1020
      fixed: 1030
      modal_backdrop: 1040
      modal: 1050
      popover: 1060
      tooltip: 1070
      notification: 1080
    
    typography_hierarchy:
      h1:
        size: 48px
        weight: 700
        line_height: 1.2
        margin_bottom: 24px
      
      h2:
        size: 36px
        weight: 600
        line_height: 1.3
        margin_bottom: 20px
      
      h3:
        size: 30px
        weight: 600
        line_height: 1.4
        margin_bottom: 16px
      
      h4:
        size: 24px
        weight: 600
        line_height: 1.4
        margin_bottom: 12px
      
      body:
        size: 16px
        weight: 400
        line_height: 1.5
        margin_bottom: 16px
      
      caption:
        size: 14px
        weight: 400
        line_height: 1.5
        margin_bottom: 8px
    
    color_hierarchy:
      primary_action: "#2563EB"
      secondary_action: "#6B7280"
      success_state: "#059669"
      warning_state: "#D97706"
      error_state: "#DC2626"
      text_primary: "#111827"
      text_secondary: "#4B5563"
      text_disabled: "#9CA3AF"
```

### Layout Grid System

```yaml
grid_system:
  breakpoints:
    mobile: 0px
    tablet: 768px
    desktop: 1024px
    wide: 1280px
    ultrawide: 1536px
  
  container:
    max_width: 1280px
    padding:
      mobile: 16px
      tablet: 24px
      desktop: 32px
  
  columns:
    mobile: 4
    tablet: 8
    desktop: 12
    gutter: 24px
  
  spacing_scale:
    xs: 4px
    sm: 8px
    md: 16px
    lg: 24px
    xl: 32px
    xxl: 48px
```

## Interactive Visual Elements

### Interaction States

```yaml
interaction_states:
  hover:
    visual_changes:
      - Elevation increase
      - Color darkening (10%)
      - Cursor change
      - Tooltip appearance
    
    timing:
      delay: 0ms
      duration: 200ms
      easing: ease-out
  
  focus:
    visual_indicators:
      - 3px outline
      - High contrast color
      - Offset of 2px
      - Consistent across all interactive elements
    
    accessibility:
      - Keyboard navigable
      - Screen reader announced
      - High contrast mode compatible
  
  active:
    visual_feedback:
      - Scale reduction (0.98)
      - Shadow decrease
      - Color darkening (20%)
      - Immediate response
  
  disabled:
    visual_treatment:
      - Opacity 0.5
      - Grayscale filter
      - No hover effects
      - Cursor not-allowed
  
  loading:
    visual_indicators:
      - Skeleton screens
      - Progress indicators
      - Pulse animations
      - Loading overlays
```

### Micro-interactions

```javascript
// Micro-interaction implementation
class MicroInteractionSystem {
  constructor() {
    this.interactions = {
      buttonClick: {
        duration: 300,
        scale: 0.95,
        rippleEffect: true,
      },
      
      formSubmit: {
        successAnimation: 'checkmark-draw',
        errorShake: {
          duration: 400,
          intensity: 10,
        },
      },
      
      cardHover: {
        elevation: 8,
        scale: 1.02,
        duration: 200,
      },
      
      tooltipReveal: {
        delay: 500,
        fadeIn: 200,
        offset: 8,
      },
    };
  }
  
  applyButtonInteraction(element) {
    element.addEventListener('mousedown', () => {
      element.style.transform = `scale(${this.interactions.buttonClick.scale})`;
    });
    
    element.addEventListener('mouseup', () => {
      element.style.transform = 'scale(1)';
      
      if (this.interactions.buttonClick.rippleEffect) {
        this.createRippleEffect(element);
      }
    });
  }
  
  createRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, this.interactions.buttonClick.duration);
  }
}
```

## Animation and Transition System

### Animation Principles

```yaml
animation_principles:
  purpose_driven:
    description: "Every animation serves a functional purpose"
    guidelines:
      - Guide user attention
      - Provide feedback
      - Maintain context
      - Enhance understanding
  
  performance_optimized:
    description: "Animations are smooth and efficient"
    guidelines:
      - 60fps target
      - GPU acceleration
      - Minimal repaints
      - Progressive enhancement
  
  consistent_timing:
    description: "Unified timing across the system"
    durations:
      instant: 100ms
      fast: 200ms
      normal: 300ms
      slow: 400ms
      very_slow: 600ms
  
  natural_motion:
    description: "Physics-based, natural feeling"
    easings:
      ease_out: "cubic-bezier(0, 0, 0.2, 1)"
      ease_in_out: "cubic-bezier(0.4, 0, 0.2, 1)"
      spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
```

### Animation Library

```javascript
// Core animation utilities
const animations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
    easing: 'ease-out',
  },
  
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 200,
    easing: 'ease-in',
  },
  
  // Slide animations
  slideInFromRight: {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: 300,
    easing: 'ease-out',
  },
  
  slideInFromBottom: {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 300,
    easing: 'ease-out',
  },
  
  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 200,
    easing: 'ease-out',
  },
  
  // Complex animations
  successCheckmark: {
    keyframes: [
      { strokeDashoffset: 100, opacity: 0 },
      { strokeDashoffset: 100, opacity: 1 },
      { strokeDashoffset: 0, opacity: 1 },
    ],
    duration: 600,
    easing: 'ease-out',
    fill: 'forwards',
  },
  
  loadingPulse: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.05)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    duration: 1500,
    easing: 'ease-in-out',
    iterations: 'infinite',
  },
};

// Animation orchestrator
class AnimationOrchestrator {
  constructor() {
    this.activeAnimations = new Map();
    this.animationQueue = [];
  }
  
  async animate(element, animation, options = {}) {
    const animationId = this.generateId();
    
    const animationConfig = {
      ...animation,
      ...options,
      element,
      id: animationId,
    };
    
    this.activeAnimations.set(animationId, animationConfig);
    
    try {
      await this.performAnimation(animationConfig);
    } finally {
      this.activeAnimations.delete(animationId);
    }
  }
  
  async performAnimation(config) {
    const { element, from, to, duration, easing, keyframes } = config;
    
    if (keyframes) {
      return element.animate(keyframes, {
        duration,
        easing,
        fill: config.fill || 'none',
        iterations: config.iterations || 1,
      }).finished;
    }
    
    // Apply 'from' state
    Object.assign(element.style, from);
    
    // Force reflow
    element.offsetHeight;
    
    // Set up transition
    element.style.transition = `all ${duration}ms ${easing}`;
    
    // Apply 'to' state
    Object.assign(element.style, to);
    
    // Wait for transition to complete
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }
  
  sequenceAnimations(animations) {
    return animations.reduce((promise, animation) => {
      return promise.then(() => this.animate(animation.element, animation.type, animation.options));
    }, Promise.resolve());
  }
  
  parallelAnimations(animations) {
    return Promise.all(
      animations.map(animation => 
        this.animate(animation.element, animation.type, animation.options)
      )
    );
  }
}
```

## Responsive Design Integration

### Breakpoint System

```javascript
// Responsive design utilities
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
};

const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px) and (max-width: ${breakpoints.wide - 1}px)`,
  wide: `@media (min-width: ${breakpoints.wide}px) and (max-width: ${breakpoints.ultrawide - 1}px)`,
  ultrawide: `@media (min-width: ${breakpoints.ultrawide}px)`,
  
  // Utility queries
  touch: '@media (hover: none) and (pointer: coarse)',
  mouse: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  darkMode: '@media (prefers-color-scheme: dark)',
  highContrast: '@media (prefers-contrast: high)',
};

// Responsive component example
const ResponsiveGrid = styled.div`
  display: grid;
  gap: ${designTokens.spacing[6]};
  
  /* Mobile: Single column */
  grid-template-columns: 1fr;
  
  /* Tablet: Two columns */
  ${mediaQueries.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop: Three columns */
  ${mediaQueries.desktop} {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* Wide: Four columns */
  ${mediaQueries.wide} {
    grid-template-columns: repeat(4, 1fr);
  }
`;
```

### Adaptive Components

```javascript
// Adaptive component system
class AdaptiveComponent {
  constructor(element) {
    this.element = element;
    this.breakpoints = breakpoints;
    this.currentBreakpoint = this.getCurrentBreakpoint();
    
    this.setupResizeObserver();
    this.applyBreakpointStyles();
  }
  
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < this.breakpoints.tablet) return 'mobile';
    if (width < this.breakpoints.desktop) return 'tablet';
    if (width < this.breakpoints.wide) return 'desktop';
    if (width < this.breakpoints.ultrawide) return 'wide';
    return 'ultrawide';
  }
  
  setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      const newBreakpoint = this.getCurrentBreakpoint();
      
      if (newBreakpoint !== this.currentBreakpoint) {
        this.currentBreakpoint = newBreakpoint;
        this.applyBreakpointStyles();
        this.element.dispatchEvent(new CustomEvent('breakpointchange', {
          detail: { breakpoint: newBreakpoint }
        }));
      }
    });
    
    resizeObserver.observe(document.body);
  }
  
  applyBreakpointStyles() {
    // Remove all breakpoint classes
    Object.keys(this.breakpoints).forEach(bp => {
      this.element.classList.remove(`bp-${bp}`);
    });
    
    // Add current breakpoint class
    this.element.classList.add(`bp-${this.currentBreakpoint}`);
    
    // Apply breakpoint-specific configurations
    this.applyBreakpointConfig();
  }
  
  applyBreakpointConfig() {
    const configs = {
      mobile: {
        columns: 1,
        padding: 16,
        fontSize: 14,
      },
      tablet: {
        columns: 2,
        padding: 24,
        fontSize: 16,
      },
      desktop: {
        columns: 3,
        padding: 32,
        fontSize: 16,
      },
      wide: {
        columns: 4,
        padding: 40,
        fontSize: 18,
      },
      ultrawide: {
        columns: 5,
        padding: 48,
        fontSize: 18,
      },
    };
    
    const config = configs[this.currentBreakpoint];
    
    // Apply configuration
    this.element.style.setProperty('--columns', config.columns);
    this.element.style.setProperty('--padding', `${config.padding}px`);
    this.element.style.setProperty('--font-size', `${config.fontSize}px`);
  }
}
```

## Accessibility Visual Standards

### Visual Accessibility Guidelines

```yaml
accessibility_standards:
  color_contrast:
    wcag_aa:
      normal_text: 4.5:1
      large_text: 3:1
      graphics: 3:1
    
    wcag_aaa:
      normal_text: 7:1
      large_text: 4.5:1
      graphics: 4.5:1
  
  focus_indicators:
    requirements:
      - Minimum 3px outline
      - Contrast ratio of 3:1
      - Visible on all backgrounds
      - Non-color dependent
    
    implementation:
      outline: "3px solid #2563EB"
      outline_offset: 2px
      border_radius: inherit
      z_index: 9999
  
  motion_accessibility:
    reduced_motion:
      - Disable auto-playing animations
      - Minimize movement
      - Instant transitions
      - Static alternatives
    
    vestibular_safety:
      - No rapid flashing
      - Smooth transitions
      - User-controlled playback
      - Motion warnings
```

### High Contrast Mode

```css
/* High contrast mode styles */
@media (prefers-contrast: high) {
  :root {
    /* Override colors for high contrast */
    --color-primary: #0040FF;
    --color-secondary: #6600CC;
    --color-success: #008000;
    --color-warning: #FF6600;
    --color-error: #CC0000;
    
    --color-text-primary: #000000;
    --color-text-secondary: #333333;
    
    --color-background: #FFFFFF;
    --color-surface: #F0F0F0;
    
    --border-width: 2px;
    --focus-outline-width: 4px;
  }
  
  /* Increase contrast for all interactive elements */
  button, a, input, select, textarea {
    border: var(--border-width) solid currentColor;
  }
  
  /* Enhanced focus indicators */
  :focus {
    outline: var(--focus-outline-width) solid var(--color-primary);
    outline-offset: 2px;
  }
  
  /* Remove decorative elements */
  .decorative-gradient,
  .background-pattern,
  .subtle-shadow {
    display: none;
  }
}

/* Dark mode high contrast */
@media (prefers-contrast: high) and (prefers-color-scheme: dark) {
  :root {
    --color-primary: #66B2FF;
    --color-secondary: #CC99FF;
    --color-success: #66FF66;
    --color-warning: #FFCC00;
    --color-error: #FF6666;
    
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #CCCCCC;
    
    --color-background: #000000;
    --color-surface: #1A1A1A;
  }
}
```

## Visual Testing Guidelines

### Visual Regression Testing

```javascript
// Visual regression testing setup
class VisualRegressionTester {
  constructor(config) {
    this.config = {
      baselineDir: './visual-baselines',
      diffDir: './visual-diffs',
      threshold: 0.1, // 10% difference threshold
      breakpoints: breakpoints,
      ...config,
    };
  }
  
  async captureScreenshots(component, scenarios) {
    const screenshots = [];
    
    for (const breakpoint of Object.keys(this.config.breakpoints)) {
      await this.setViewport(breakpoint);
      
      for (const scenario of scenarios) {
        const screenshot = await this.captureScenario(component, scenario, breakpoint);
        screenshots.push({
          breakpoint,
          scenario: scenario.name,
          path: screenshot,
        });
      }
    }
    
    return screenshots;
  }
  
  async captureScenario(component, scenario, breakpoint) {
    // Apply scenario state
    await scenario.setup(component);
    
    // Wait for animations to complete
    await this.waitForAnimations();
    
    // Capture screenshot
    const screenshotPath = `${this.config.baselineDir}/${component.name}-${scenario.name}-${breakpoint}.png`;
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: scenario.fullPage || false,
    });
    
    // Reset state
    await scenario.teardown(component);
    
    return screenshotPath;
  }
  
  async compareWithBaseline(currentPath, baselinePath) {
    const diff = await this.imageDiff({
      actualImage: currentPath,
      expectedImage: baselinePath,
      diffImage: `${this.config.diffDir}/${path.basename(currentPath)}`,
    });
    
    return {
      passed: diff.percentage < this.config.threshold,
      difference: diff.percentage,
      diffImage: diff.diffImage,
    };
  }
}

// Visual test scenarios
const visualTestScenarios = {
  button: [
    {
      name: 'default',
      setup: async (component) => {
        // Default state, no action needed
      },
      teardown: async (component) => {
        // Reset to default
      },
    },
    {
      name: 'hover',
      setup: async (component) => {
        await component.hover();
      },
      teardown: async (component) => {
        await component.unhover();
      },
    },
    {
      name: 'focus',
      setup: async (component) => {
        await component.focus();
      },
      teardown: async (component) => {
        await component.blur();
      },
    },
    {
      name: 'disabled',
      setup: async (component) => {
        component.disabled = true;
      },
      teardown: async (component) => {
        component.disabled = false;
      },
    },
  ],
  
  form: [
    {
      name: 'empty',
      setup: async (component) => {
        await component.reset();
      },
    },
    {
      name: 'filled',
      setup: async (component) => {
        await component.fill(testData.validForm);
      },
    },
    {
      name: 'error',
      setup: async (component) => {
        await component.fill(testData.invalidForm);
        await component.validate();
      },
    },
  ],
};
```

## Design-Development Workflow

### Handoff Process

```yaml
design_handoff_process:
  design_phase:
    deliverables:
      - Figma/Sketch files with components
      - Design token documentation
      - Interactive prototypes
      - Accessibility annotations
      - Responsive behavior specs
    
    tools:
      - Figma Dev Mode
      - Zeplin
      - Abstract
      - Storybook
  
  development_phase:
    implementation:
      - Import design tokens
      - Build component library
      - Implement interactions
      - Add accessibility features
      - Create documentation
    
    validation:
      - Visual regression tests
      - Accessibility audits
      - Performance testing
      - Cross-browser checks
  
  review_phase:
    checkpoints:
      - Design review with designers
      - Code review with developers
      - Accessibility review
      - Performance review
      - Stakeholder approval
```

### Design System Maintenance

```yaml
maintenance_workflow:
  version_control:
    strategy: "Semantic versioning"
    branches:
      - main: "Production-ready components"
      - develop: "Active development"
      - feature/*: "New components/features"
    
    release_process:
      - Version bump
      - Changelog update
      - Documentation update
      - Migration guide
      - Deprecation notices
  
  component_lifecycle:
    stages:
      experimental:
        status: "In development"
        stability: "May change"
        support: "Limited"
      
      stable:
        status: "Production ready"
        stability: "Stable API"
        support: "Full support"
      
      deprecated:
        status: "Phasing out"
        stability: "No changes"
        support: "Security only"
      
      archived:
        status: "No longer supported"
        stability: "Frozen"
        support: "None"
  
  contribution_guidelines:
    process:
      1. "Propose component via RFC"
      2. "Design review and approval"
      3. "Implement with tests"
      4. "Documentation and examples"
      5. "Accessibility audit"
      6. "Performance validation"
      7. "Code review and merge"
```

### Integration Checklist

```yaml
visual_integration_checklist:
  pre_integration:
    - [ ] Design tokens imported
    - [ ] Component specifications reviewed
    - [ ] Accessibility requirements understood
    - [ ] Performance budgets defined
    - [ ] Browser support matrix confirmed
  
  during_integration:
    - [ ] Following design system guidelines
    - [ ] Using approved components
    - [ ] Implementing proper states
    - [ ] Adding micro-interactions
    - [ ] Ensuring responsive behavior
  
  post_integration:
    - [ ] Visual regression tests passing
    - [ ] Accessibility tests passing
    - [ ] Performance within budget
    - [ ] Cross-browser validation complete
    - [ ] Documentation updated
  
  maintenance:
    - [ ] Regular design sync meetings
    - [ ] Component usage analytics
    - [ ] Performance monitoring
    - [ ] Accessibility audits
    - [ ] User feedback incorporation
```

This comprehensive visual guide integration documentation ensures consistent implementation of visual design elements across the Semantest platform while maintaining high standards for performance, accessibility, and user experience.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Design System Team  
**Design System**: design-system@semantest.com