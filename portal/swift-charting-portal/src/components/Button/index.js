import PropTypes from 'prop-types';
import Fab from '@mui/material/Fab';
import addFab from "src/assets/images/addFab.png";
import Typography from '../Typography';

const Button = ({ style, icon=false, iconWidth,actionLabel='ADD', ...restProps }) => (
  <Fab
  color="primary"
  aria-label="add"
  variant="extended" size="medium"
  sx={{
    boxShadow: 'none',
    display:'flex',
    gap:'7.79px',
    borderRadius:'3.89px',
    padding:'3.89px',
    minWidth:'136.3px',
    // paddingRight:'15.25px',
    padding:'15.25px',
    ...style,
  }}
  {...restProps}
  >
    <Typography style={{fontSize:'13.63px'}}>{actionLabel}</Typography>
  </Fab>
);

Button.defaultProps = {
  style: {},
  icon: true,
};

Button.propTypes = {
  style: PropTypes.objectOf,
  icon: PropTypes.bool,
};

export default Button;
