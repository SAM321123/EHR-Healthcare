import React from 'react';
import { Card, CardContent, Typography, Link, Grid } from '@mui/material';
import palette from 'src/theme/palette';
import { dateFormatter } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';

const ActiveEncounterCard = ({patientData={}}={}) => {
  const navigate = useNavigate();
  const params = useParams();

  const onAllClick = () => {
    navigate(
      generatePath(UI_ROUTES.patientEncounters, {
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
            Open/Active Encounters
          </Typography>
          <Link
            onClick={onAllClick}
            style={{
              color: palette.background.main,
              margin: '8px',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '20px',
              cursor: 'pointer',
            }}
          >
            View all
          </Link>
        </div>
        <div 
          style={{ 
            marginTop: '2em',
            maxHeight: '250px',
            overflowY: 'auto', 
          }}>
          {patientData?.encounters?.map((item)=>{
           return  <Grid key={item.id} container style={{ padding: '0.25em 0' }}>
            <Grid item md={9}>
              <Typography
                style={{
                  color: palette.text.dark,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                {item?.encounterType?.name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item md={3}>
              <Typography
                style={{
                  color: palette.text.offWhite,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                {dateFormatter(item?.startDate,dateFormats.MMDDYYYY)}
              </Typography>
            </Grid>
          </Grid>
          }) }
         
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveEncounterCard;
