// @mui
import palette from './palette';

export const buttonStyle = {
  primary: {
    display: 'flex',
    padding: '10px 24px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    boxShadow: '1px 1px 1px 0px rgba(68, 97, 242, 0.15)',
    color: palette.background.offWhite,
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 'normal',
    backgroundColor: palette.primary.main,
    '&:hover': {
      backgroundColor: palette.primary.dark,
    },
  },
  secondary: {
    boxShadow: 'none',
    backgroundColor: palette.background.paper,
    color: palette.grey[800],
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '19.6px',
    padding: '10px 24px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: palette.primary.offWhite,
    },
  },
  outlined: {
    backgroundColor: palette.background.paper,
    color: palette.primary.main,
    border: `1px solid ${palette.primary.main}`,
    boxShadow: 'none',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 'normal',
    padding: '10px 24px',
    '&:hover': {
      backgroundColor: palette.primary.offWhite,
    },
  },
};
