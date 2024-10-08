/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#3B82F6', // Light shade of primary
          DEFAULT: '#0a2a5b', // Default primary color
          dark: '#1E40AF', // Dark shade of primary
        },
        secondary: {
          light: '#A855F7', // Light shade of secondary
          DEFAULT: '#9333EA', // Default secondary color
          dark: '#7E22CE', // Dark shade of secondary
        },
        other: {
          light: '#FBBF24', // Light shade of other
          DEFAULT: '#F59E0B', // Default other color
          dark: '#D97706', // Dark shade of other
        },
        // Additional colors
        success: {
          light: '#34D399', // Light shade of success
          DEFAULT: '#10B981', // Default success color
          dark: '#059669', // Dark shade of success
        },
        danger: {
          light: '#F87171', // Light shade of danger
          DEFAULT: '#EF4444', // Default danger color
          dark: '#DC2626', // Dark shade of danger
        },
        warning: {
          light: '#FBBF24', // Light shade of warning
          DEFAULT: '#F59E0B', // Default warning color
          dark: '#D97706', // Dark shade of warning
        },
        info: {
          light: '#60A5FA', // Light shade of info
          DEFAULT: '#3B82F6', // Default info color
          dark: '#2563EB', // Dark shade of info
        },
      },
    },
  },
  plugins: [],
}

