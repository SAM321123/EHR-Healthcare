import Container from 'src/components/Container';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
} from '@mui/material';
import Typography from 'src/components/Typography';
import CustomButton from 'src/components/CustomButton';
import { convertWithTimezone } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';
import palette from 'src/theme/palette';
import { useCallback, useState } from 'react';
import { isFunction } from 'lodash';

export const History = ({ data, toggleStatus }) => (
  <List sx={{ p: 0, backgroundColor: palette.grey[300] }}>
    {data?.map((item, index) => (
      <ListItem
        key={item?.id}
        sx={{
          backgroundColor: palette.background.paper,
          p: 0,
          py: 1,
          mb: '1px',
          width: '100%',
        }}
      >
        <div style={{ width: '100%' }}>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '12px' }}>{item?.note}</Typography>
            }
          />

          <div
            style={{
              justifyContent: 'end',
              alignItems: 'end',
            }}
          >
            <Typography
              sx={{
                fontSize: '10px',
                textAlign: 'end',
              }}
            >
              {convertWithTimezone(item?.createdAt, {
                format: dateFormats.MMMDDHHMMa,
              })}
            </Typography>
          </div>
          {/* <ListItemText
              sx={{ backgroundColor: '#d0d0d0' }}
              primary={
                <Typography
                  sx={{
                    fontSize: '10px',
                  }}
                >
                  {convertWithTimezone(item?.createdAt, {
                    format: dateFormats.MMMDDHHMMa,
                  })}
                </Typography>
              }
            /> */}
        </div>

        {isFunction(toggleStatus) && (
          <ListItemIcon
            size="small"
            sx={{
              minWidth: '22px',
              ml: 1.5,
              textAlign: 'end',
              cursor: 'pointer',
            }}
          >
            <Switch
              defaultChecked={item?.isActive}
              onChange={() => toggleStatus(index)}
              name="status"
            />
          </ListItemIcon>
        )}
      </ListItem>
    ))}
  </List>
);

export const getActiveNote = (notes) => {
  const note = notes?.find((item) => item?.isActive);
  if (note) return note?.note;
  return '';
};

const PatientNotesHistory = ({ modalCloseAction, patientData }) => {
  const [showHistory, setShowHistory] = useState(false);
  const toggleHistory = useCallback(() => {
    setShowHistory(!showHistory);
  }, [showHistory]);
  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        minWidth: 350,
        flexDirection: 'column',
        padding: '0px 24px 0px 24px',
      }}
    >
      <Box sx={{ mt: 2 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
          {getActiveNote(patientData?.note)}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2 }}>
          {patientData?.note?.length > 1 && (
            <CustomButton
              variant="secondary"
              onClick={toggleHistory}
              label={showHistory ? 'Hide History' : 'Show History'}
            />
          )}
          <CustomButton
            variant="outlined"
            onClick={modalCloseAction}
            label="OK"
            sx={{ border: 'solid 0px' }}
          />
        </Box>
        {patientData?.note?.length > 0 && showHistory && (
          <>
            <Typography sx={{ fontSize: '14px', fontWeight: '700', mt: 2 }}>
              History
            </Typography>
            <History data={patientData?.note} />
          </>
        )}
      </Box>
    </Container>
  );
};

export default PatientNotesHistory;
