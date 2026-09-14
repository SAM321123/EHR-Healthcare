/* eslint-disable react/style-prop-object */
import Typography from '@mui/material/Typography';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { convertWithTimezone, getTimezoneAbbreviation } from 'src/lib/utils';
import {
  dateFormats,
  patientActivityTypeIcons,
  patientActivityTypes,
} from 'src/lib/constants';
import palette from 'src/theme/palette';
import { isFunction } from 'src/lib/lodash';
import { getBodyArea } from './utils';

const MedicineLog = ({ item }) => (
  <div style={{ display: 'flex' }}>
    <ListItemText
      sx={{ my: 0 }}
      primary={
        <Typography
          sx={{ fontSize: '14px' }}
        >{`${item?.medicine?.name}`}</Typography>
      }
    />
    {item?.bodyMapArea && (
      <ListItemText
        sx={{ my: 0, textAlign: 'end' }}
        primary={
          <Typography sx={{ fontSize: '12px', color: palette.success.dark }}>
            {getBodyArea(item?.bodyMapArea)}
          </Typography>
        }
      />
    )}
  </div>
);

const ExerciseLog = ({ item }) => (
  <div style={{ display: 'flex' }}>
    <ListItemText
      sx={{ my: 0 }}
      primary={
        <Typography
          sx={{ fontSize: '12px' }}
        >{`${item?.metaData?.exercise}(${item?.metaData?.intensity}) for ${item?.metaData?.duration} minutes`}</Typography>
      }
    />
    {/* <ListItemText
      sx={{ my: 0, ml: 1, textAlign: 'end' }}
      primary={
        <Typography sx={{ fontSize: '12px', color: palette.success.dark }}>
          {`Intensity: ${item?.metaData?.intensity}`}
        </Typography>
      }
    />
    <ListItemText
      sx={{ my: 0, ml: 1, textAlign: 'end' }}
      primary={
        <Typography sx={{ fontSize: '12px', color: palette.success.dark }}>
          {`Duration: ${item?.metaData?.duration} Min`}
        </Typography>
      }
    /> */}
  </div>
);

const HistoryTable = ({ logType, data, deleteEntery, showDelete, patient }) => (
  
  <List sx={{ p: 0, backgroundColor: palette.grey[300] }}>
    {data?.map((item) => (
      <ListItem
        key={item?.id}
        sx={{
          backgroundColor: palette.background.paper,
          p: 0,
          py: '5px',
          mb: '1px',
        }}
      >
        <ListItemIcon
          size="small"
          sx={{
            minWidth: '22px',
          }}
        >
          <img
            height="15rem"
            width="15rem"
            style={{ marginRight: '10px' }}
            alt="icon"
            src={patientActivityTypeIcons[logType]}
          />
        </ListItemIcon>

        <div style={{ flex: 1 }}>
          {item?.medicine ? <MedicineLog item={item} /> : null}
          {logType === patientActivityTypes.EXERCISE ? (
            <ExerciseLog item={item} />
          ) : null}
          <div style={{ display: 'flex' }}>
            <ListItemText
              sx={{ my: 0 }}
              primary={
                <Typography
                  sx={{ fontSize: '12px' }}
                >{`${item?.value} ${item?.unit}`}</Typography>
              }
            />
            <ListItemText
              style={{
                my: 0,
                textAlign: 'end',
              }}
              primary={
                <Typography
                  sx={{
                    fontSize: '10px',
                  }}
                >
                  {convertWithTimezone(item?.date || item?.createdAt, {
                    timezone : patient?.timezone,
                    format: dateFormats.MMMDDHHMMa,
                  })}
                  {' '}
                  {getTimezoneAbbreviation(patient?.timezone)}
                </Typography>
              }
            />
          </div>
        </div>
        {showDelete && (
          <ListItemIcon
            size="small"
            sx={{
              minWidth: '22px',
              ml: 1.5,
              textAlign: 'end',
              cursor: 'pointer',
            }}
            onClick={() =>
              isFunction(deleteEntery) ? deleteEntery(item?.id) : null
            }
          >
            <img
              height="20rem"
              width="20rem"
              alt="icon"
              src="/assets/icons/delete.svg"
            />
          </ListItemIcon>
        )}
      </ListItem>
    ))}
  </List>
);

export default HistoryTable;
