import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from 'src/components/CustomButton/loadingButton';

import Box from '../Box';
import CustomButton from '../CustomButton';
import Typography from '../Typography';

const AlertDialog = ({ open, title, content, actions = [] }) => (
  <div>
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Box>
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            component={Typography}
            variant="h7"
          >
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pt: 0 }}>
          {actions.map((item, index) => (
            <LoadingButton
              key={index}
              label={item?.title}
              variant={item.variant}
              onClick={item.action}
              sx={item.actionStyle}
            />
            // <CustomButton
            //   key={index}
            //   variant={item.variant}
            //   onClick={item.action}
            //   sx={item.actionStyle}
            // >
            //   {item?.title}
            // </CustomButton>
          ))}
        </DialogActions>
      </Box>
    </Dialog>
  </div>
);

export default AlertDialog;
