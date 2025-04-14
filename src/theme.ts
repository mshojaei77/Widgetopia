import { createTheme, responsiveFontSizes, type ThemeOptions, alpha } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// Common settings for both light and dark themes
const commonSettings: ThemeOptions = {
  shape: {
    borderRadius: 12, // Tip #3: Rounded corners
  },
  typography: {
    fontFamily: 'Roboto, Inter, "Segoe UI", sans-serif', // Tip #4: Modern Typography
    // Define Material 3 type scale variants if needed, otherwise rely on defaults
  },
  components: {
    // Apply consistent padding to Paper/Card components
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '16px', // Tip #3: Consistent Padding
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
             paddingBottom: '16px',
          },
        },
      },
    },
    // Default elevation for common components
    MuiCard: {
      defaultProps: {
        elevation: 1, // Tip #2: Elevation
      },
    },
  },
};

// Light theme palette (adjust colors based on Material Theme Builder if desired)
const lightPalette: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // Example M3 Purple
    },
    secondary: {
      main: '#625B71',
    },
    background: {
      default: '#FFFBFE', // Surface
      paper: '#FFFBFE',   // Surface Container
    },
    // Add other M3 colors: tertiary, error, surface variants, etc.
  },
};

// Dark theme palette (adjust colors based on Material Theme Builder if desired)
const darkPalette: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#D0BCFF', // Example M3 Purple
    },
    secondary: {
      main: '#CCC2DC',
    },
    background: {
      default: '#1C1B1F', // Surface
      paper: '#1C1B1F',   // Surface Container
    },
    // Add other M3 colors: tertiary, error, surface variants, etc.
  },
};

// Create the themes by merging common settings with specific palettes
let lightTheme = createTheme(deepmerge(commonSettings, lightPalette));
let darkTheme = createTheme(deepmerge(commonSettings, darkPalette));

// Apply responsive font sizes
lightTheme = responsiveFontSizes(lightTheme);
darkTheme = responsiveFontSizes(darkTheme);

// Define the core colors based on the "dark glass" aesthetic
const primaryTextColor = '#E0E0E0'; // Light grey for primary text
const secondaryTextColor = '#B0B0B0'; // Slightly darker grey for secondary text
const widgetBgColor = 'rgba(0, 0, 0, 0.3)'; // Dark semi-transparent background
const widgetBorderColor = 'rgba(255, 255, 255, 0.1)'; // Subtle white border
const blurAmount = '10px'; // Adjust blur intensity as needed

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8ab4f8', // A suitable primary color, adjust if needed
    },
    secondary: {
      main: '#f8bbd0', // A suitable secondary color, adjust if needed
    },
    background: {
      default: '#000000', // Fallback background - body background set via CSS
      paper: widgetBgColor,
    },
    text: {
      primary: primaryTextColor,
      secondary: secondaryTextColor,
    },
    action: {
      active: alpha(primaryTextColor, 0.7),
      hover: alpha(primaryTextColor, 0.1),
      selected: alpha(primaryTextColor, 0.2),
      disabled: alpha(primaryTextColor, 0.3),
      disabledBackground: alpha(widgetBgColor, 0.5),
    },
    divider: widgetBorderColor,
  },
  typography: {
    fontFamily: 'var(--font-primary)',
    h1: {
      fontSize: '3rem',
      fontWeight: 500, 
      letterSpacing: '-0.5px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 500,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.5px',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0px',
    },
    h5: { // Used for Widget Titles
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0px',
      color: primaryTextColor,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: '0px',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.1px',
      lineHeight: 1.5,
      color: primaryTextColor,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.1px',
      lineHeight: 1.5,
      color: secondaryTextColor,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.3px',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.4px',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 12, // Consistent rounded corners like in the image
  },
  components: {
    // --- Global Styles ---
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: #000;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: 100vh;
          transition: background-image 0.5s ease;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `,
    },
    // --- Component Overrides ---
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Reset default MUI gradient/background
          backgroundColor: widgetBgColor,
          backdropFilter: `blur(${blurAmount})`,
          // Note: backdrop-filter might need vendor prefixes or might not work in all browsers
          // Add '-webkit-backdrop-filter' for Safari
          WebkitBackdropFilter: `blur(${blurAmount})`,
          border: `1px solid ${widgetBorderColor}`,
          boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )', // Optional subtle shadow
          color: primaryTextColor,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase text
        },
        containedPrimary: {
          // Style for primary buttons like "Add"
        },
        text: {
          color: primaryTextColor,
        },
      },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                color: primaryTextColor,
                '&:hover': {
                    backgroundColor: alpha(primaryTextColor, 0.1)
                }
            }
        }
    },
    MuiTextField: {
        defaultProps: {
            variant: 'outlined',
        },
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    backgroundColor: alpha(widgetBgColor, 0.5), // Slightly different background for inputs
                    backdropFilter: `blur(${blurAmount})`,
                    WebkitBackdropFilter: `blur(${blurAmount})`,
                    '& fieldset': {
                        borderColor: widgetBorderColor,
                    },
                    '&:hover fieldset': {
                        borderColor: alpha(primaryTextColor, 0.5),
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: primaryTextColor, // Or theme.palette.primary.main
                    },
                    '& input': {
                        color: primaryTextColor,
                    },
                    '& input::placeholder': {
                        color: secondaryTextColor,
                        opacity: 1,
                    },
                },
                '& .MuiInputLabel-root': {
                    color: secondaryTextColor,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: primaryTextColor, // Or theme.palette.primary.main
                }
            }
        }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha(primaryTextColor, 0.7),
          '&.Mui-checked': {
            color: primaryTextColor, // Or theme.palette.primary.main
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: primaryTextColor,
        },
        secondary: {
          color: secondaryTextColor,
        },
      },
    },
    // Add other component overrides as needed (e.g., AppBar, List, Switch)
  },
});

export default theme;

export { lightTheme, darkTheme }; 