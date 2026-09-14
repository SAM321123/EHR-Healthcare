import { Box, Modal } from '@mui/material';
import React, { useCallback } from 'react';
import palette from 'src/theme/palette';
import { isEmpty } from 'lodash';
import ModalHeader from '../modal/header';

const style = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  bgcolor: palette.background.paper,
  maxWidth: 'sm',
  overflow: 'auto',
  minWidth: '30vw',
};

const ModalComponent = (props) => {
  const {
    header = {},
    children,
    onClose = () => {},
    open = false,
  } = props || {};

  const { closeIconAction } = header;

  const modalCloseAction = useCallback(
    (event, reason) => {
      onClose(event, reason);
      if (closeIconAction) closeIconAction();
    },
    [closeIconAction, onClose]
  );

  if (!open) return null;

  return (
    <Modal
      open
      onClose={modalCloseAction}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableAutoFocus
      disableEnforceFocus
    >
      <Box sx={style}>
        {!isEmpty(header) && (
          <ModalHeader header={header} modalCloseAction={modalCloseAction} />
        )}
        {children}
      </Box>
    </Modal>
  );
};

export default React.memo(ModalComponent);
