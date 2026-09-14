import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Link,
  Grid,
  Button,
} from '@mui/material';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import palette from 'src/theme/palette';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { dateFormats } from 'src/lib/constants';
import { dateFormatter } from 'src/lib/utils';

const LabStudiesCard = ({ labsRadiologies }) => {
  const navigate = useNavigate();
  const params = useParams();
  const onAllClick = () => {
    navigate(
      generatePath(UI_ROUTES.patientLabRadiology, {
        ...params,
      })
    );
  };
  return (
    <Card
      style={{
        border: '1px solid #E8E8E8',
        margin: '1em 2em',
      }}
    >
      <CardContent>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            style={{
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Labs/ Studies
          </Typography>
          <Link
            onClick={onAllClick}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.background.main,
              cursor: 'pointer',
            }}
          >
            View All
          </Link>
        </div>
        <div
          style={{
            padding: '1em 0',
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
         {labsRadiologies?.length > 0 ? (
          labsRadiologies?.map((item) => (
            <div key={item.id} style={{ marginTop: '2em' }}>
              <Grid container style={{ padding: '3px 0px' }}>
                <Grid item md={12} style={{ display: 'flex' }}>
                  <WaterDropOutlinedIcon fontSize="small" />
                  <Typography
                    style={{
                      color: palette.text.dark,
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    {item?.laboratoryTests[0]?.name}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container style={{ padding: '1em 1em' }}>
                <Grid item md={8}>
                  <Typography
                    style={{
                      color: palette.text.offWhite,
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    {dateFormatter(
                      item?.createdAt,
                      dateFormats.MMMDDYYYYHHMMSS
                    )}
                    {/* {item.createdAt} */}
                  </Typography>
                </Grid>
                <Grid item md={4}>
                  <Button
                    size="small"
                    variant="outlined"
                    style={{
                      color: palette.text.offWhite,
                      borderColor: ' #E8E8E8',
                      fontWeight: 100,
                    }}
                    sx={{
                      width: 'fit-content',
                      minWidth: '80px',
                      whiteSpace: 'nowrap',
                    }}
                     onClick={onAllClick}
                  >
                    Need Results
                  </Button>
                </Grid>
              </Grid>
            </div>
          ))
            ) : (
            <Typography
              style={{
                color: palette.text.offWhite,
                fontSize: 14,
                lineHeight: '20px',
                fontWeight: 400,
                marginTop: '2em',
              }}
            >
              No Labs/Studies available.
            </Typography>
          )}
        </div>
        {/* <div style={{ marginTop: '2em' }}>
          <Grid container style={{ padding: '3px 0px' }}>
            <Grid item md={12} style={{ display: 'flex' }}>
              <WaterDropOutlinedIcon fontSize="small" />
              <Typography
                style={{
                  color: palette.text.dark,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                ABO and Rh group (type) in Blood
              </Typography>
            </Grid>
          </Grid>
          <Grid container style={{ padding: '1em 1em' }}>
            <Grid item md={8}>
              <Typography
                style={{
                  color: palette.text.offWhite,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                06/02/2024
              </Typography>
            </Grid>
            <Grid item md={4}>
              <Button
                size="small"
                variant="outlined"
                style={{
                  color: palette.text.offWhite,
                  borderColor: ' #E8E8E8',
                  fontWeight: 100,
                }}
                sx={{
                  width: 'fit-content',
                  minWidth: '80px',
                  whiteSpace: 'nowrap',
                }}
              >
                Need Results
              </Button>
            </Grid>
          </Grid>
        </div> */}
        {/* <div style={{ marginTop: '2em' }}>
          <Grid container style={{ padding: '3px 0px' }}>
            <Grid item md={12} style={{ display: 'flex' }}>
              <WaterDropOutlinedIcon fontSize="small" />
              <Typography
                style={{
                  color: palette.text.dark,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                ABO and Rh group (type) in Blood
              </Typography>
            </Grid>
          </Grid>
          <Grid container style={{ padding: '1em 1em' }}>
            <Grid item md={8}>
              <Typography
                style={{
                  color: palette.text.offWhite,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                06/02/2024
              </Typography>
            </Grid>
            <Grid item md={4}>
              <Button
                size="small"
                variant="outlined"
                style={{
                  color: palette.text.offWhite,
                  borderColor: ' #E8E8E8',
                  fontWeight: 100,
                }}
                sx={{
                  width: 'fit-content',
                  minWidth: '80px',
                  whiteSpace: 'nowrap',
                }}
              >
                Need Results
              </Button>
            </Grid>
          </Grid>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default LabStudiesCard;
