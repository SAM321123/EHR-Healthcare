// ----------------------------------------------------------------------

import { alpha } from '@mui/material';

export default function Checkbox(theme) {
  return {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha(theme.palette.grey[500], 0.32),
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: theme.palette.grey[600],
          '& .MuiCheckbox-root': {
            paddingTop: 'unset',
          },
          '& .MuiTypography-root': {
            paddingBottom: '9px',
            color: theme.palette.common.black,
          },
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          opacity: 1,
          color: theme.palette.text.disabled,
        },
      },
    },
  };
}
