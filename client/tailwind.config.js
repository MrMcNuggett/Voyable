/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Voyable Design System type roles — body (Plus Jakarta Sans), display
      // (Bricolage Grotesque), data/mono (JetBrains Mono). Resolve to the CSS
      // variables defined in src/index.css so the whole app stays consistent.
      fontFamily: {
        sans: ['var(--font-system)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        // Voyable brand scales — petrol (primary), olive (secondary), amber
        // (reserved: route lines / map pins / warning only). Use the semantic
        // `accent`/`surface`/`content` tokens for general UI; these raw scales
        // are for the deliberate brand/map surfaces the design calls out.
        petrol: {
          50: '#eaf2f1', 100: '#cde3e0', 200: '#9fc9c4', 300: '#6dada6',
          400: '#3f8d85', 500: '#276b64', 600: '#1c514c', 700: '#143a37', 800: '#0d2725',
        },
        olive: {
          50: '#f6f4e9', 100: '#eae3c5', 200: '#d7c98f',
          300: '#bfab5f', 400: '#9c8a44', 500: '#7d6f37', 600: '#5f552a',
        },
        // Amber = route/map/warning accent only, never general brand UI.
        route: {
          50: '#fbf1e3', 100: '#f5dcb2', 300: '#dc9a4c',
          400: '#c98736', 500: '#b9752c', 700: '#8a561f',
        },
        stone: {
          50: '#fbfbfa', 100: '#f1f2ef', 200: '#e6e7e2', 300: '#d5d7d0',
        },
        ink: {
          200: '#dcdfda', 300: '#c3cac3', 400: '#a3aca5', 500: '#828d85',
          600: '#66716a', 700: '#4b564f', 800: '#333d37', 900: '#20241f',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        planner: {
          day: '#fbfbfa',          // stone-50
          dayBorder: '#e6e7e2',    // stone-200
          dayHeader: '#333d37',    // ink-800
          sidebar: '#ffffff',
          sidebarBorder: '#e6e7e2', // stone-200
          overlay: 'rgba(20, 24, 20, 0.4)',
          dragActive: '#eaf2f1',   // petrol-50
          dragOver: '#cde3e0',     // petrol-100
        },
        // Semantic theme tokens — resolve to the CSS variables in src/index.css
        // (:root light / .dark dark). Use these utilities (bg-surface, text-content,
        // border-edge, bg-accent) instead of inline `style={{ ... 'var(--...)' }}`.
        surface: {
          DEFAULT: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
          card: 'var(--bg-card)',
          input: 'var(--bg-input)',
          hover: 'var(--bg-hover)',
          selected: 'var(--bg-selected)',
        },
        content: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        edge: {
          DEFAULT: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          faint: 'var(--border-faint)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          text: 'var(--accent-text)',
          on: 'var(--accent-on)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
        },
        // Semantic status colors (+ soft tinted background variant).
        success: { DEFAULT: 'var(--success)', soft: 'var(--success-soft)' },
        danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' },
        warning: { DEFAULT: 'var(--warning)', soft: 'var(--warning-soft)' },
        info: { DEFAULT: 'var(--info)', soft: 'var(--info-soft)' },
        // Inverse surface (the near-black/near-white "pill" header pattern).
        inverse: { DEFAULT: 'var(--bg-inverse)', text: 'var(--text-inverse)' },
      },
      boxShadow: {
        'day-column': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'place-card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'drag-overlay': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Token-backed elevation (scheme/dark aware) — for migrating inline rgba shadows.
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'modal': 'var(--shadow-modal)',
        'dropdown': 'var(--shadow-dropdown)',
        'popover': 'var(--shadow-popover)',
      },
      // Semantic type tiers — each scales with its own user multiplier (defaults
      // to 1). Use text-title/subtitle/body/caption for headings/labels so the
      // appearance "text size" control reaches them; the global fontScale (root
      // font-size) additionally scales all rem-based text.
      fontSize: {
        title: ['calc(24px * var(--fs-scale-title, 1))', '1.2'],
        subtitle: ['calc(18px * var(--fs-scale-subtitle, 1))', '1.35'],
        body: ['calc(14px * var(--fs-scale-body, 1))', '1.5'],
        caption: ['calc(12px * var(--fs-scale-caption, 1))', '1.4'],
      },
    },
  },
  plugins: [],
}
