// @mui
import { styled } from '@mui/material/styles';
import { ListItemIcon, ListItemButton } from '@mui/material';

// ----------------------------------------------------------------------

export const StyledNavItem = styled((props) => (
  <ListItemButton disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: 'relative',
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
}));

export const StyledNavItemIcon = styled(ListItemIcon)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'inherit',
  width: 24,
  height: 24,
  minWidth: '24px',
  margin: 'auto',
  marginRight: '12px',
});
