import React, { useCallback, useEffect, useRef, useState } from 'react';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';

// eslint-disable-next-line import/no-extraneous-dependencies
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Search from 'src/assets/images/Search.png';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
  Paper,
  Popover,
  Link,
} from '@mui/material';

import '../../SuperAdminDashboard/style.css';
import moment from 'moment';
import Vitals from '../vitals';
import MedicationList from '../Medications';
import LabRadiologyList from '../LabRadiology';
import { dataAppointSection } from 'src/pages/SuperAdminDashboard/appiontData';
import { GET_APPOINTMENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import useAuthUser from 'src/hooks/useAuthUser';
import { dateFormats } from 'src/lib/constants';
import { getFullName, dateFormatter } from 'src/lib/utils';
import { navigateTo, UI_ROUTES } from 'src/lib/routeConstants';
import { generatePath, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, , , , , validateToken, userData] = useAuthUser();
  const patientId = user?.id;

  const [medication, setMedication] = useState(true);
  const [labRadiology, setLabRadiology] = useState(true);

  const permissions = userData?.permission

  const { 
    patientportalmedication, 
    patientPortallabsRadiology, 
    patientPortalappointment, 
    patientPortalAllergies 
  } = permissions || {}

  let isMedication = false;
  let isLabradiology = false;
  let isAppointment = false;

  if( patientportalmedication?.permission?.length)
    isMedication = true;
  if( patientPortallabsRadiology?.permission?.length)
    isLabradiology = true;
  if( patientPortalappointment?.permission?.length)
    isAppointment = true;
  const [
    response,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({
    listId: `${GET_APPOINTMENT}-${patientId}`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId, listView: true },
  });

  const handleMedicationView = useCallback((value) => {
    setMedication(value);
  }, []);
  const handleLabRadiologyView = useCallback((value) => {
    setLabRadiology(value);
  }, []);
  const navigate = useNavigate();

  const onViewLabRadiology = () => {
    navigate(
      generatePath(UI_ROUTES.patientLabRadiologyData)
    )
  }
  const onViewMedication = () => {
    navigate(
      generatePath(UI_ROUTES.patientMedicationData)
    )
  }
  const onViewAppointment = () => {
    navigate(
      generatePath(UI_ROUTES.patientBooking)
    )
  }
  return(
    <div>
      <Grid 
        container 
        spacing={2} 
        style={{ padding: '0px', 
        }}>
        <Grid 
        item xs={9} 
        style={{ padding: '12px',
        }}>
          <Paper >
            <Grid container spacing={2} style={{ padding: '0px',  
              }}>
              <Vitals />
            </Grid>
          </Paper>
          <div>
            {isMedication && (
              <Card>
                <CardHeader title="Medications" />
                <CardContent>
                  <MedicationList 
                    handleMedicationView={handleMedicationView}
                  />
                </CardContent>
              </Card>
            )}
          </div>
          <div style={{marginTop:30}}>
            {isLabradiology && (
              <Card>
                <CardHeader title="Lab Orders" />
                <CardContent>
                  <LabRadiologyList
                    handleLabRadiologyView={handleLabRadiologyView} 
                  />
                </CardContent>
              </Card>
            )}
            </div>
        </Grid>
        <Grid item xs={3} style={{ padding: '0px',  
          borderLeft: '1px solid #CCCCCC', 
        }}>
          <Paper style={{ padding: '20px'}}>
            <div>
              <Typography
                style={{
                  color: palette.text.dark,
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                Appointment Request
              </Typography>
            </div>  
            {isAppointment && response?.results?.map((data, index) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 8,
                  marginTop: '20px',
                  borderBottom: '1px solid  #CCCCCC',
                  padding: '10px',
                }}
                key={index}
                onClick={onViewAppointment}
              >
                <div style={{ display: 'flex', flexDirection: 'column',flex:1 }}>
                  <Typography
                    style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: palette.text.dark,
                    }}
                  >
                    {data?.title}
                  </Typography>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 30,
                    }}
                  >
                    <Typography
                      style={{
                        fontWeight: '400',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: palette.text.offWhite,
                      }}
                    >
                      {getFullName(data?.practitioner)}
                    </Typography>
                    <Typography
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        color: `${data?.status?.colorCode}`,
                      }}
                    >
                      {data?.status?.name}
                    </Typography>
                  </div>
                  <Typography
                    style={{
                      fontWeight: '400',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: palette.text.offWhite,
                    }}
                  >
                    {dateFormatter(data?.startDateTime, dateFormats.MMMMDhmmA)}
                  </Typography>
                  </div>
                </div>
              ))}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;