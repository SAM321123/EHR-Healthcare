import { Box, Divider, Grid, Modal, useMediaQuery } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { mobileWidth } from 'src/lib/constants';
import ModalHeader from './header';
import ModalFooter from './footer';

const topGradientStyle = () => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '40px',
  width: '100px',
  opacity: 0.8,
  zIndex: -1,
  background: 'linear-gradient(#36B3FA 0%, #2AE5DA 100%)',
  filter: 'blur(30px)',
});

const bottomGradientStyle = () => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  height: '40px',
  width: '80px',
  opacity: 0.4,
  zIndex: -1,
  background: 'linear-gradient(#36B3FA 0%, #2AE5DA 100%)',
  filter: 'blur(30px)',
});

const ModalComponent = (props) => {
  const {
    header = {},
    footer = {},
    headerComponent: HeaderComponent,
    footerComponent: FooterComponent,
    children,
    onClose = () => {},
    open = false,
    isSelectRole,
    isDivider = false,
    isBottomDivider = false,
    className,
    isSmall,
    isNotScrollable,
    containerStyle = {},
    modalStyle = {},
    boxStyle = {},
    shouldCloseOnBackdropClick=false,
    // shouldCloseOnBackdropClick=true,
  } = props || {};

  const { closeIconAction } = header;

  const isMobile = useMediaQuery(mobileWidth);

  const style = useMemo(
    () => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      // width:1024,
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      boxShadow: 24,
      pt: '24px',
      pb: '10px',
      overflow: 'auto',
      maxHeight: '100%',
      maxWidth: isSmall ? 'sm' : 'md',
      outline: 'none',
      ...(isMobile && {
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        transform: 'none',
      }),
      display: 'flex',
      flexDirection: 'column',
      ...(isNotScrollable && { width: '100%' }),
      ...containerStyle,
      ...modalStyle,
    }),
    [isMobile, isNotScrollable]
  );

  const modalCloseAction = useCallback(
    (event, reason) => {
      if (reason === 'backdropClick' && !shouldCloseOnBackdropClick) {
        return; // Prevent closing if the prop is false
      }
      onClose(event, reason);
      if (closeIconAction) closeIconAction();
    },
    [closeIconAction, onClose, shouldCloseOnBackdropClick]
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
      className={className}
      style={{ ...modalStyle }}
    >
      {!isNotScrollable ? (
        <Box sx={{  ...style, ...boxStyle }}>
          {!isMobile && isSelectRole ? <Box sx={topGradientStyle} /> : null}
          <Grid>
            {HeaderComponent ? (
              <HeaderComponent />
            ) : (
              <ModalHeader
                header={header}
                modalCloseAction={modalCloseAction}
              />
            )}
          </Grid>
          <Box style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Grid>{children}</Grid>
          </Box>
          <Grid mt={2}>
            {FooterComponent ? (
              <FooterComponent />
            ) : (
              <ModalFooter footer={footer} />
            )}
          </Grid>
          {!isMobile && isSelectRole ? <Box sx={bottomGradientStyle} /> : null}
        </Box>
      ) : (
        <Box sx={{ ...style, ...modalStyle, width: '100%' }}>
          {HeaderComponent ? (
            <Box>
              <HeaderComponent />
            </Box>
          ) : (
            <ModalHeader header={header} modalCloseAction={modalCloseAction} />
          )}
          {isDivider ? <Divider /> : null}
          <Box style={{ flexGrow: !isMobile ? 1 : 0, overflow: 'auto' }}>
            {children}
          </Box>
          {isBottomDivider ? <Divider /> : null}
          {FooterComponent && (
            <Box>
              <FooterComponent />
            </Box>
          )}
        </Box>
      )}
    </Modal>
  );
};

export default React.memo(ModalComponent);
