import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Grid, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import BackIcon from 'src/assets/images/svg/back.svg';
import { get, isFunction } from '../../lib/lodash';

import Box from '../Box';
import ActionButton from '../ActionButton';
import FabButton from '../FabButton';
import Typography from '../Typography';
import MoreActions from '../Table/MoreActions';
import Chip from '../Chip';

import './pageHeader.scss';
import LoadingButton from '../CustomButton/loadingButton';

const PageHeader = (props) => {
  const {
    title = '',
    showBackIcon = false,
    onPressBackIcon = () => {},
    rightContent = [],
    leftContent = [],
    style = {},
    titleWrapperStyle = {},
    wrapperStyle = {},
  } =
    props;
  const theme = useTheme();
  const navigate = useNavigate();
  const pageHeaderColor = get(theme, 'palette.pageHeader', {});
  return (
    <Grid
      container
      className="page_header_container"
      data-testid="page-header-test"
      style={{...wrapperStyle}}
    >
      <Box sx={{ display: 'flex', marginBottom: '8px', alignItems: 'center' ,...style}}>
        {showBackIcon && (
          <IconButton
            variant="secondary"
            sx={{
              boxShadow: 'none',
              padding: 0,
              minWidth: 'unset',
              backgroundColor: 'transparent',
              borderRadius: '50%',
            }}
            onClick={
              isFunction(onPressBackIcon) ? onPressBackIcon : () => navigate(-1)
            }
          >
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
          </IconButton>
        )}
        {title && (
          <Typography sx={{ ml: 1, mr: 1,...titleWrapperStyle }} variant="h6">
            {title}
          </Typography>
        )}
        <div className="header_right_content" data-testid="button-test">
          {leftContent?.map((item, index) => {
            const restProps = item || {};
            const itemKey = item?.key || item?.type || item?.label || index;
            if (item?.render) {
              return <React.Fragment key={itemKey}>{item?.render}</React.Fragment>;
            }
            switch (item?.type) {
              case 'chip':
                return <Chip key={itemKey} {...restProps} />;
              default:
                return <div key={itemKey} />;
            }
          })}
        </div>
      </Box>
      <div className="header_right_content" data-testid="button-test">
        {rightContent?.map((item, index) => {
          const restProps = item || {};
          const itemKey = item?.key || item?.type || item?.label || index;
          if (item?.render) {
            return <React.Fragment key={itemKey}>{item?.render}</React.Fragment>;
          }
          switch (item?.type) {
            case 'action':
              return (
                <LoadingButton key={itemKey} style={{height:'36px'}} {...restProps} />
              );
            case 'save':
              return (
                <ActionButton key={itemKey} className="page_header_button" {...restProps} />
              );
            case 'fabButtonSave':
              return <FabButton key={itemKey} {...restProps} />;
            case 'cancel':
              return (
                <ActionButton
                  key={itemKey}
                  className="page_header_button"
                  style={{
                    border: `1px solid ${pageHeaderColor?.buttonBackgroundColor}`,
                    color: pageHeaderColor?.buttonBackgroundColor,
                    backgroundColor: 'transparent',
                  }}
                  {...restProps}
                />
              );
            case 'moreAction':
              return <MoreActions key={itemKey} {...restProps} />;
            case 'chip':
              return <Chip key={itemKey} {...restProps} />;
            default:
              return <div key={itemKey} />;
          }
        })}
      </div>
    </Grid>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string,
  showBackIcon: PropTypes.bool,
  onPressBackIcon: PropTypes.func,
  rightContent: PropTypes.array,
  leftContent: PropTypes.array,
  style: PropTypes.object,
  titleWrapperStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
};

export default PageHeader;
