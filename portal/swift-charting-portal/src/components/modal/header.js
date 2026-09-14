import React, { useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { IconButton, useMediaQuery } from '@mui/material';
import { mobileWidth } from 'src/lib/constants';
import CustomButton from '../CustomButton';
import BackIcon from '../../assets/images/svg/back.svg';
import CloseIcon  from 'src/assets/images/close.png';
import palette from 'src/theme/palette';

const ModalHeader = (props) => {
  const { header, modalCloseAction } = props || {};
  const { title, logo, showCloseIcon=true, warningIcon = false } = header || {};
  const isMobile = useMediaQuery(mobileWidth);
  const WarningIcon = useCallback(
    ({ ml, mr }) => (
      <img
        alt="alt"
        src="/assets/icons/warning.svg"
        style={{
          height: 25,
          width: 25,
          marginRight: mr,
          marginLeft: ml,
        }}
      />
    ),
    []
  );
  return (
    <Grid
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Grid
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          margin: isMobile ? ' 0px 18px' : '0px 24px',
        }}
      >
        <Grid>
          {isMobile && (
            <CustomButton
              variant="secondary"
              sx={{
                boxShadow: 'none',
                padding: 0,
                minWidth: 'unset',
                backgroundColor: 'transparent',
                borderRadius: '50%',
              }}
              onClick={modalCloseAction}
              startIcon={
                <img
                  src={BackIcon}
                  alt="login"
                  style={{
                    cursor: 'pointer',
                    padding: '6px',
                    width: 30,
                    height: 30,
                  }}
                />
              }
            />
          )}
          {logo && (
            <img
              style={{ width: 40, height: 40 }}
              src={logo}
              alt=""
              loading="lazy"
            />
          )}
          {showCloseIcon && (
            <IconButton
              onClick={modalCloseAction}
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
              }}
            >
              <img src={CloseIcon} style={{width:24,height:24}} alt="close"/>
            </IconButton>
           )}
        </Grid>
        <Grid
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {warningIcon && !isMobile && <WarningIcon mr="5px" />}
          <Typography
            variant="h6"
            id="modal-modal-description"
            sx={{
              color: palette.text.dark,
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '20px',
            }}
          >
            {title}
          </Typography>
          {warningIcon && isMobile && <WarningIcon ml="5px" />}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(ModalHeader);
