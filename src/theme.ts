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
// Define the core colors based on the "glass" aesthetic
const primaryTextColor = '#F0F0F0'; // Lighter grey for primary text
const secondaryTextColor = '#C0C0C0'; // Slightly lighter grey for secondary text
const widgetBgColor = 'rgba(30, 30, 40, 0.2)'; // Even less dark semi-transparent background
const widgetBorderColor = 'rgba(255, 255, 255, 0.08)'; // More subtle white border
const blurAmount = '4px'; // Further reduced blur intensity

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
    // Enhanced MUI Select component with glass effects
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--glass-select-border)',
            transition: 'all 0.2s ease-in-out',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--glass-select-hover-border)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--glass-select-focus-border)',
            borderWidth: '2px',
          },
          '& .MuiSelect-select': {
            backgroundColor: 'var(--glass-select-bg)',
            backdropFilter: 'blur(6px) saturate(1.2) brightness(1.02)',
            WebkitBackdropFilter: 'blur(6px) saturate(1.2) brightness(1.02)',
            borderRadius: 'var(--radius-md)',
            color: primaryTextColor,
            transition: 'all 0.2s ease-in-out',
            '&:focus': {
              backgroundColor: 'var(--glass-select-bg)',
            }
          },
          '&:hover': {
            transform: 'translateY(-1px)',
            '& .MuiSelect-select': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
          }
        },
      },
    },
    // Enhanced MUI Menu component with glass effects
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'var(--glass-dropdown-bg)',
          backdropFilter: 'var(--glass-dropdown-backdrop-filter)',
          WebkitBackdropFilter: 'var(--glass-dropdown-backdrop-filter)',
          border: 'var(--glass-dropdown-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--glass-dropdown-shadow)',
          marginTop: '4px',
          minWidth: '160px',
          maxWidth: '400px', // Prevent excessive width
          width: 'auto', // Let it size based on content and anchor
          maxHeight: '300px',
          overflow: 'auto',
          position: 'relative',
          zIndex: 1300,
          // Add glass overlay effects
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
            borderRadius: 'inherit',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: '60%',
            bottom: '60%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 40%)',
            pointerEvents: 'none',
            zIndex: 2,
            borderRadius: 'var(--radius-md) 0 0 0',
          },
          // Custom scrollbar for dropdown
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)',
            }
          },
        },
        list: {
          padding: '6px',
          position: 'relative',
          zIndex: 3, // Above the overlay effects
        },
      },
    },
    // Enhanced MUI MenuItem component with glass effects
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease-in-out',
          borderRadius: 'var(--radius-sm)',
          margin: '2px 0',
          padding: '8px 12px',
          color: primaryTextColor,
          fontSize: '0.875rem',
          position: 'relative',
          zIndex: 4, // Above all overlay effects
          '&:hover': {
            background: 'var(--glass-dropdown-item-hover-bg)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            transform: 'translateX(2px)',
            color: primaryTextColor,
          },
          '&.Mui-selected': {
            background: 'var(--glass-dropdown-item-selected-bg)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: primaryTextColor,
            fontWeight: 500,
            '&:hover': {
              background: 'var(--glass-dropdown-item-selected-bg)',
              transform: 'translateX(2px)',
            }
          },
          '&.Mui-focusVisible': {
            background: 'var(--glass-dropdown-item-focus-bg)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            outline: 'none',
          },
          '&.Mui-disabled': {
            color: alpha(primaryTextColor, 0.4),
            background: 'transparent',
          }
        },
      },
    },
    // Enhanced MUI Popover for better dropdown positioning
    MuiPopover: {
      styleOverrides: {
        paper: {
          background: 'transparent', // Let Menu handle the background
          boxShadow: 'none', // Let Menu handle the shadow
          overflow: 'visible',
        },
      },
    },
    // Add other component overrides as needed (e.g., AppBar, List, Switch)
  },
});

export default theme;

export { lightTheme, darkTheme }; 