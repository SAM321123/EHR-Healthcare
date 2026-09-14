import { Grid } from '@mui/material';
import { get } from 'lodash';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import { dateFormats } from 'src/lib/constants';
import { convertWithTimezone, getImageUrl } from 'src/lib/utils';
import palette from 'src/theme/palette';

export const GridItem = ({
  item,
  showDate = true,
  label,
  icon,
  customIcon,
  style = {},
  imageStyle = {},
  labelStyle = {},
  iconStyle = {},
  ...restProps
}) => {
  const imgUrl = get(item, 'file.mimetype')?.includes('image')
    ? getImageUrl(`${item?.patient}/${get(item, 'file.name')}`, {isPatientFile: true, })
    : '';
  return (
    <Grid item xs={6} lg={1.2} md={2} sm={3} {...restProps}>
      <Box
        sx={{
          display: 'flex',
          paddingBottom: '0px',
          borderRadius: '12px',
          backgroundColor: palette.primary.main,
          ...style,
          alignItem: 'flex-end',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            backgroundImage: imgUrl ? `url(${imgUrl})` : null,
            borderRadius: '12px 12px 0px 0px',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            ...iconStyle,
          }}
        >
          {icon ? (
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src={imgUrl || icon}
                alt="login"
                style={{
                  cursor: 'pointer',
                  padding: '6px',
                  ...imageStyle,
                }}
              />
            </div>
          ) : (
            customIcon && <div style={{ cursor: 'pointer' }}>{customIcon}</div>
          )}
        </div>
        <div
          style={{
            justifyContent: 'center',
            width: '91px',
            height: '37px',
            overflow: 'hidden',
          }}
        >
          <Typography
            sx={{
              fontSize: '16px',
              color: palette.common.white,
              textAlign: 'center',

              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...labelStyle,
            }}
          >
            {label}{' '}
            {showDate &&
              convertWithTimezone(get(item, 'createdAt'), {
                format: dateFormats.YYYYMMDD,
              })}
          </Typography>
        </div>
      </Box>
    </Grid>
  );
};
