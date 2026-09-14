import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Button(theme) {
  console.log("🚀 ~ Button ~ theme:", theme)
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: 48,
        },
        sizeMedium: {
          height: 38,
        },
        sizeSmall: {
          height: 28,
        },
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },
        contained:{
          padding:'12px 24px',
        },
        containedPrimary: {
          boxShadow: theme.customShadows.primary,
        },
        containedSecondary: {
          boxShadow: theme.customShadows.secondary,
        },
        outlinedSecondary: {
          boxShadow: theme.customShadows.secondary,
          border:`1px solid ${theme.palette.border.secondary}`,
          color:theme.palette.text.offGray,
          padding:'12px 22px',
        },
        outlinedInherit: {
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  };
}
