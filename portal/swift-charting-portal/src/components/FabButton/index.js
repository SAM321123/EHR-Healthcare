import PropTypes from 'prop-types';
import Fab from '@mui/material/Fab';
import addFab from "src/assets/images/addFab.png";
import Typography from '../Typography';

const FabButton = ({
  style = {},
  icon = true,
  iconWidth,
  actionLabel = 'ADD',
  ...restProps
}) => (
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
      paddingRight:'15.25px',
      ...style,
    }}
    {...restProps}
  >
    {icon && <img src={addFab} alt="add" style={{width:19.47,height:19.47}}/>}
    <Typography style={{fontSize:'13.63px'}}>{actionLabel}</Typography>
  </Fab>
);

FabButton.propTypes = {
  style: PropTypes.object,
  icon: PropTypes.bool,
  actionLabel: PropTypes.node,
};

export default FabButton;
