'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#e65100', // Deep Orange 900
          light: '#ff9e40', // Lighter variant
          dark: '#b23c00', // Darker variant with better contrast
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#bf360c', // Deep Orange 900
          light: '#f9683a', // Deep Orange 700
          dark: '#7f1d00', // Darker variant with better contrast
          contrastText: '#ffffff',
        },
        background: {
          default: '#fff8f1', // Very light warm background
          paper: '#ffffff',
        },
        text: {
          primary: '#3e2723', // Brown 900 for warmer text
          secondary: '#5d4037', // Brown 800
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#ff9800', // Orange 500
          light: '#ffb74d', // Orange 300
          dark: '#c66900', // Darker orange for better contrast
          contrastText: '#000000',
        },
        secondary: {
          main: '#ff5722', // Deep Orange 500
          light: '#ff8a65', // Deep Orange 300
          dark: '#a83800', // Darker deep orange for better contrast
          contrastText: '#ffffff',
        },
        background: {
          default: '#3e2723', // Brown 900
          paper: '#4e342e', // Brown 800
        },
        text: {
          primary: '#fff8e1', // Warm white
          secondary: '#ffe0b2', // Orange 100
        },
      },
    },
  },
});

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;
