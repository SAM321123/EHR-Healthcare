/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-plusplus */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import greenarrow from 'src/assets/images/green-arrow.png';
import redarrow from 'src/assets/images/redarrow.png';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import { Chart } from 'react-chartjs-2';
import select from 'src/assets/images/select.png';
import reject from 'src/assets/images/reject.png';
// eslint-disable-next-line import/no-extraneous-dependencies
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Search from 'src/assets/images/Search.png';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import {
  Billing,
  dataAppointSection,
  Labs,
  RecentPatients,
  Taskarea,
} from './appiontData';
import Piechart from './piechart';
import BarChart from './BarChart';
import './style.css';
import useCRUD from 'src/hooks/useCRUD';
import {
  ALL_PATIENTS,
  DOCUMENT_LIST,
  GET_APPOINTMENT,
  GET_SUBSCRIPTION_DATA,
  MONTHLY_PATIENTS,
  PATIENT_LIST,
  UPDATE_APPOINTMENT,
  WEEKLY_PATIENTS,
} from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import moment from 'moment';
import useQuery from 'src/hooks/useQuery';
import {
  convertWithTimezone,
  dateFormatter,
  formatDateWithToday,
  formatPatientNames,
  getAge,
  getDateDiff,
  getFullName,
  getGender,
  getImageUrl,
  getUserRole,
} from 'src/lib/utils';
import {
  appointmentStatusCode,
  dateFormats,
  roleTypes,
} from 'src/lib/constants';
import person from 'src/assets/images/persone.png';
import { IconButton, CardHeader, Card, CardContent, Grid, Box, Button, Tooltip } from '@mui/material';
import Container from 'src/components/Container';
import EncountersList from '../Encounter/encounterList';
import { isEmpty } from 'lodash';
import userIcon from 'src/assets/images/user.png';
import useAuthUser from 'src/hooks/useAuthUser';
import { encrypt } from 'src/lib/encryption';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import LabRadiologyList from '../LabRadiology';
import GenerateBills from '../MedicalBilling/generateBills';
import DiagnosisChart from './diagnosisChart';
import PatientChart from './patientChart';

const DashboardHome = () => {
  const [age, setAge] = React.useState('');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  // eslint-disable-next-line no-unused-vars
  const [newUsers, setNewUsers] = useState([100, 120, 110, 90, 130, 200]);
  // eslint-disable-next-line no-unused-vars
  const [oldUsers, setOldUsers] = useState([80, 90, 100, 110, 120, 130, 24]);
  const [highestNewUsers, setHighestNewUsers] = useState([]);
  const [highestOldUsers, setHighestOldUsers] = useState([]);
  const chartRef = useRef(null);
  const [user, , , , , validateToken, userData] = useAuthUser();
  const permissions = userData?.permission;

  const userRole = getUserRole();
  const { patientmedication, labs_radiology, appointment, encounter } =
    permissions || {};

  let isMedication = false;
  let isLabradiology = false;
  let isAppointment = false;
  let isEncounter = false;

  if (
    patientmedication?.permission?.includes('read') ||
    userRole === roleTypes.superAdmin ||
    userRole === roleTypes.clinicAdmin
  )
    isMedication = true;
  if (
    labs_radiology?.permission?.includes('read') ||
    userRole === roleTypes.superAdmin ||
    userRole === roleTypes.clinicAdmin
  )
    isLabradiology = true;
  if (
    appointment?.permission?.includes('read') ||
    userRole === roleTypes.superAdmin ||
    userRole === roleTypes.clinicAdmin
  )
    isAppointment = true;
  if (
    encounter?.permission?.includes('read') ||
    userRole === roleTypes.superAdmin ||
    userRole === roleTypes.clinicAdmin
  )
    isEncounter = true;

  const navigate = useNavigate();

  const dis = 'false';
  const [
    weeklyPatientsCount,
    ,
    weeklyPatientsLoading,
    getWeeklyPatients,
    clearWeeklyPatients,
  ] = useCRUD({
    id: WEEKLY_PATIENTS,
    url: `${API_URL.getPatients}/patient-count`,
    type: REQUEST_METHOD.get,
  });
  const [
    allPatientsCount,
    ,
    allPatientsLoading,
    getAllPatients,
    clearAllPatients,
  ] = useCRUD({
    id: ALL_PATIENTS,
    url: `${API_URL.getPatients}/patient-count`,
    type: REQUEST_METHOD.get,
  });
  const [
    monthlyPatientsCount,
    ,
    monthlyPatientsLoading,
    getMonthlyPatients,
    clearMonthlyPatients,
  ] = useCRUD({
    id: MONTHLY_PATIENTS,
    url: `${API_URL.getPatients}/patient-count`,
    type: REQUEST_METHOD.get,
  });

  const [getSubscriptionResponse, ,getSubscriptionLoading ,getSubscription, clearSubscription] = useCRUD({
    id: GET_SUBSCRIPTION_DATA,
    url: `${API_URL.clinic}/subscription-data`,
    type: REQUEST_METHOD.get,
  });


  useEffect(() =>{
    getSubscription();
  }, [])

  const [appointments, appointmentsLoading, , , , , , , , refetchAppointments] =
    useQuery({
      listId: `${GET_APPOINTMENT}-Dashboard}`,
      url: API_URL.appointment,
      type: REQUEST_METHOD.get,
      subscribeSocket: true,
      queryParams: { listView: true },
    });

  const [patientsList, patientsListLoading] = useQuery({
    listId: `${PATIENT_LIST}-Dashboard`,
    url: API_URL.patient,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const [
    updateAppointmentResponse,
    ,
    updateAppointmentLoading,
    updateAppointmentData,
    clearUpdateAppointmentResponse,
  ] = useCRUD({
    id: `${UPDATE_APPOINTMENT}-Dashboard`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });

  useEffect(() => {
    getWeeklyPatients({
      fromDate: moment()
        .startOf('week')
        .subtract(1, 'week')
        .format('YYYY-MM-DD'),
      toDate: moment().endOf('week').subtract(1, 'week').format('YYYY-MM-DD'),
    });
    getMonthlyPatients({
      fromDate: moment()
        .startOf('month')
        .subtract(1, 'month')
        .format('YYYY-MM-DD'),
      toDate: moment().endOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
    });
    // getWeeklyPatients({fromDate:moment().startOf('week').format('YYYY-MM-DD'),toDate:moment().endOf('week').format('YYYY-MM-DD')});
    // getMonthlyPatients({fromDate:moment().startOf('month').format('YYYY-MM-DD'),toDate:moment().endOf('month').format('YYYY-MM-DD')})
    getAllPatients();
  }, []);

  useEffect(() => {
    const highestNew = [];
    const highestOld = [];
    for (let i = 0; i < months.length; i++) {
      const newMax = newUsers[i];
      const oldMax = oldUsers[i];
      highestNew.push(newMax);
      highestOld.push(oldMax);
    }
    setHighestNewUsers(highestNew);
    setHighestOldUsers(highestOld);
  }, [months.length, newUsers, oldUsers]);

  useEffect(() => {
    if (updateAppointmentResponse) {
      refetchAppointments();
      clearUpdateAppointmentResponse(true);
    }
  }, [updateAppointmentResponse]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
  ];

  function getStyles(name, personName, theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const handleUpdateAppointment = (id, statusCode) => {
    updateAppointmentData({ statusCode }, `/${id}`);
  };
  const onClickNavigate = (id) => {
    let patientId = String(id);
    patientId = encrypt(patientId);
    const path = `/patient/detail/${patientId}/appointments`;
    navigate(generatePath(path));
  };

  const subscription ={
    status: 'Active'
  }

  return (
    <Container
      loading={
        appointmentsLoading ||
        patientsListLoading ||
        monthlyPatientsLoading ||
        weeklyPatientsLoading ||
        updateAppointmentLoading
      }
    >
      { userRole === roleTypes.clinicAdmin && (
        <Grid item xs={12}>
          <Card
            sx={{
              background: 'linear-gradient(90deg, #F5FAFF 0%, #EAF3FF 100%)', // blue tone
              border: '1px solid #D0E3FF',
              borderRadius: 3,
              p: 3,
              boxShadow: 2,
              marginBottom: '2rem'
            }}
          >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#1976d2',
                  mb: 1
                }}
              >
                Subscription Overview
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: '#444',
                  mb: 0.5
                }}
              >
                Status:{' '}
                <strong
                  style={{
                    color:getSubscriptionResponse?.isCancel
                      ? '#eb1313ff'
                      : getSubscriptionResponse?.isActive
                      ? 'green'
                      : '#85b1feff',
                  }}
                >
            {getSubscriptionResponse?.isCancel
              ? 'Canceled'
              : getSubscriptionResponse?.isActive
              ? 'Active'
              : 'Trial'}
                </strong>
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: '#444',
                  mb: 0.5,
                }}
              >
                {getSubscriptionResponse?.isTrial ? 'Trial End Date: ' : 'Renewal Date: '}
                <strong>
                  {getSubscriptionResponse?.isTrial
                    ? convertWithTimezone(getSubscriptionResponse?.trialEndDate, {
                        format: dateFormats.MMMDDYYYY,
                      }) || 'N/A'
                    : convertWithTimezone(getSubscriptionResponse?.endDate, {
                        format: dateFormats.MMMDDYYYY,
                      }) || 'N/A'}
                </strong>
              </Typography>

            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: subscription?.status === 'Active' ? '#1976d2' : '#fff',
                  color: subscription?.status === 'Active' ? '#1976d2' : '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor:
                      subscription?.status === 'Active'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(255,255,255,0.15)'
                  }
                }}
                onClick={() =>  navigate(generatePath(UI_ROUTES.subscription))}

              >
                View more
              </Button>
            </Box>
          </Box>
            {getSubscriptionResponse?.isCancel && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#fff',
                  backgroundColor: 'rgba(211, 47, 47, 0.85)',
                  p: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                Your subscription has been canceled.  
                You can continue using the platform until the end of your current period.  
                Please create a new subscription to keep uninterrupted access.
              </Typography>
            )}
          </Card>
        </Grid>
      )}
      {/* { userRole === roleTypes.clinicAdmin && (
        <Grid item xs={12}>
          <Card
            sx={{
              background:
                getSubscriptionResponse?.isActive
                  ? 'linear-gradient(90deg, #F5FAFF 0%, #EAF3FF 100%)' // blue tone
                  : 'linear-gradient(90deg, #FF6B6B 0%, #D32F2F 100%)', // balanced red
              border:
                getSubscriptionResponse?.isActive
                  ? '1px solid #D0E3FF'
                  : '1px solid #D32F2F',
              borderRadius: 3,
              p: 3,
              boxShadow: 2,
              marginBottom: '2rem'
            }}
          >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: getSubscriptionResponse?.isActive ? '#1976d2' : '#fff',
                  mb: 1
                }}
              >
                Subscription Overview
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: getSubscriptionResponse?.isActive ? '#444' : '#f9f9f9',
                  mb: 0.5
                }}
              >
                Status:{' '}
                <strong
                  style={{
                    color:getSubscriptionResponse?.isCancel
                      ? '#eb1313ff'
                      : getSubscriptionResponse?.isActive
                      ? 'green'
                      : '#fff',
                  }}
                >
            {getSubscriptionResponse?.isCancel
              ? 'Canceled'
              : getSubscriptionResponse?.isActive
              ? 'Active'
              : 'Inactive'}
                </strong>
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: getSubscriptionResponse?.isActive ? '#444' : '#f9f9f9',
                  mb: 0.5
                }}
              >
                Renewal Date:{' '}
                <strong>
                  {convertWithTimezone(getSubscriptionResponse?.endDate, {
                    format: dateFormats.MMMDDYYYY,
                  }) || 'N/A'}
                </strong>
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: subscription?.status === 'Active' ? '#1976d2' : '#fff',
                  color: subscription?.status === 'Active' ? '#1976d2' : '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor:
                      subscription?.status === 'Active'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(255,255,255,0.15)'
                  }
                }}
                onClick={() =>  navigate(generatePath(UI_ROUTES.systemSettings))}
              >
                View more
              </Button>
            </Box>
          </Box>
            {getSubscriptionResponse?.isCancel && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#fff',
                  backgroundColor: 'rgba(211, 47, 47, 0.85)',
                  p: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                Your subscription has been canceled.  
                You can continue using the platform until the end of your current period.  
                Please create a new subscription to keep uninterrupted access.
              </Typography>
            )}
          </Card>
        </Grid>
      )} */}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={9}>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={4}>
                <div className="hover">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 18,
                      padding: '24px',
                      backgroundColor: palette.background.babyBlue,
                      gap: 8,
                      width: 222,
                      height: 112,
                    }}
                  >
                    <div
                      style={{
                        color: '#000000',
                        fontWeight: '600',
                        size: 14,
                      }}
                    >
                      Total Patient
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{}}>
                        <Typography
                          style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            lineHeight: '36px',
                            color: '#000000',
                          }}
                        >
                          {allPatientsCount?.count || 0}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {/* <div>
                    <Typography style={{ color: '#009217', fontWeight: '400' }}>
                      +11.01%
                    </Typography>
                  </div> */}
                        {/* <div>
                    <img
                      src={greenarrow}
                      alt="greenarrow"
                      style={{ width: 16, height: 16 }}
                    />
                  </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <div className="hover">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 18,
                      padding: '24px',
                      backgroundColor: palette.background.babyBlue,
                      gap: 8,
                      width: 222,
                      height: 112,
                    }}
                  >
                    <div
                      style={{
                        color: '#000000',
                        fontWeight: '600',
                        size: 14,
                      }}
                    >
                      Last Week Patient
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ color: '#000000', fontWeight: '600' }}>
                        <Typography
                          style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            lineHeight: '36px',
                          }}
                        >
                          {weeklyPatientsCount?.count || 0}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {/* <div style={{ color: '#D64A13', fontWeight: '400' }}>
                    -2.01%
                  </div> */}
                        {/* <div>
                    <img
                      src={redarrow}
                      alt="redarrow"
                      style={{ width: 16, height: 16 }}
                    />
                  </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <div className="hover">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 18,
                      padding: '24px',
                      backgroundColor: palette.background.babyBlue,
                      gap: 8,
                      width: 222,
                      height: 112,
                    }}
                  >
                    <div
                      style={{
                        color: '#000000',
                        fontWeight: '600',
                        size: 14,
                      }}
                    >
                      Last Month Patient
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ color: '#000000', fontWeight: '600' }}>
                        <Typography
                          style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            lineHeight: '36px',
                          }}
                        >
                          {monthlyPatientsCount?.count || 0}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {/* <div style={{ color: '#009217', fontWeight: '400' }}>
                    +11.01%
                  </div> */}
                        {/* <div>
                    <img
                      src={greenarrow}
                      alt="greenarrow"
                      style={{ width: 16, height: 16 }}
                    />
                  </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '30px' }}>
            <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
              <div
                style={{
                  display: 'flex',
                  padding: 16,
                  border: `1px solid ${palette.border.main}`,
                  borderRadius: 16,
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <PatientChart />
                {/* <BarChart /> */}
              </div>
                </Grid>
              <Grid item xs={12} sm={12} md={6}>
              <div
                style={{
                  padding: 16,
                  border: `1px solid ${palette.border.main}`,
                  borderRadius: 16,
                  flex: 1,
                  height: '100%'
                }}
              >
                <DiagnosisChart />
                {/* <Piechart /> */}
              </div>
              </Grid>
              </Grid>
            </div>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12}>
                <Card>
                  {isEncounter && (
                    <>
                      <CardHeader title="Open Encounters" />
                      <CardContent>
                        <EncountersList
                          // handleEnconterView={handleEnconterView}
                          fromDashboard={true}
                        />
                      </CardContent>
                    </>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <Card>
                  <CardHeader title="Billing" />
                  <CardContent>
                    <GenerateBills />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <Card>
                  <CardHeader title="Labs" />
                  <CardContent>
                    <LabRadiologyList dashboardView={true} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          {/* //side div */}
          <div style={{ borderLeft: '1px solid #CCCCCC' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: '20px',
              }}
            >
              {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ lineHeight: 20 }}>
              <Typography style={{ fontSize: '14px', fontWeight: 600 }}>
                Today’s Task
              </Typography>
            </div>

            {Taskarea.map((item, index) => (
              <div
                style={{ display: 'flex', flexDirection: 'column' }}
                key={index}
                className="hover"
              >
                <div
                  style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}
                  key={index}
                >
                  <div
                    style={{
                      borderLeft: '3px  solid #337AB7',
                      borderTopLeftRadius: '10px',
                      borderBottomLeftRadius: '10px',
                      display: 'flex',
                      gap: 13.86,
                      padding: '6px 0px',
                      paddingLeft: 11.62,
                    }}
                  >
                    <div>
                      <div>
                        <img
                          src={item.src}
                          alt="alex"
                          width="48px"
                          height="48px"
                          style={{ borderRadius: '50%' }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '20px',
                          color: palette.text.dark,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '20px',
                          // textAlign: 'left',
                          color: palette.text.offWhite,

                          // Black color
                        }}
                      >
                        {item.name}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div> */}
              <div>
                <div>
                  <hr
                    style={{
                      borderColor: '#CCCCCC',
                      borderTop: '1px solid',
                      borderStyle: 'none none solid',
                      width: '100%',
                    }}
                  />
                </div>
              </div>
              {!isEmpty(appointments?.results) && isAppointment && (
                <div
                  style={{
                    dispay: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginTop: '20px',
                  }}
                >
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

                  {isAppointment &&
                    appointments?.results?.map((item, index) => (
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
                      >
                        <div>
                          <img
                            src={
                              item?.patients?.[0]?.file?.file
                                ? getImageUrl(item?.patients?.[0]?.file?.file)
                                : person
                            }
                            alt="alex"
                            width="24px"
                            height="24px"
                            style={{ borderRadius: '80%' }}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                          }}
                        >
                          <Typography
                            style={{
                              fontWeight: '600',
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: palette.text.dark,
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              onClickNavigate(item?.patients[0]?.id)
                            }
                          >
                            {formatPatientNames(item?.patients || [])}
                          </Typography>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: item.statusCode === 'pending' ? 40 : 30,
                              justifyContent: 'space-between',
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
                              {`${getGender(
                                item?.patients?.[0] || {}
                              )}, ${getAge(item?.patients?.[0]?.dob)}`}
                            </Typography>
                            {item.statusCode === 'pending' ? (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  margin: 'auto',
                                  gap: 10,
                                }}
                              >
                                <Tooltip title="Confirm Appointment">                
                                <IconButton
                                  onClick={() => {
                                    handleUpdateAppointment(
                                      item.id,
                                      appointmentStatusCode.CONFIRMED
                                    );
                                  }}
                                >
                                  {' '}
                                  <img
                                    src={select}
                                    className="hover"
                                    alt="accepted"
                                    width="24px"
                                    height="24px"
                                    style={{
                                      top: '3.5px',
                                      left: '8px',
                                      border: '2px 0px 0px 0px',
                                    }}
                                  />
                                </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel Appointment">
                                <IconButton
                                  onClick={() => {
                                    handleUpdateAppointment(
                                      item.id,
                                      appointmentStatusCode.CANCELLED
                                    );
                                  }}
                                >
                                  <img
                                    src={reject}
                                    className="hover"
                                    alt="rejected"
                                    width="24px"
                                    height="24px"
                                  />
                                </IconButton>
                                              
                                </Tooltip>
                              </div>
                            ) : (
                              <button
                                className="hover"
                                type="button"
                                style={{
                                  display: 'flex',

                                  padding: '9px 12px',
                                  gap: '10px',
                                  borderRadius: '8px',
                                  border: '1px #EFF8FF',
                                  alignSelf: 'center',
                                }}
                              >
                                <Typography
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    lineHeight: '20px',
                                    color: '#777777',
                                  }}
                                >
                                  {item?.status?.name || 'N/A'}
                                </Typography>
                              </button>
                            )}
                          </div>
                          <Typography
                            style={{
                              fontWeight: '400',
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: palette.text.offWhite,
                            }}
                          >
                            {convertWithTimezone(item.startDateTime, {
                              format: dateFormats.MMMMDhmmA,
                            })}
                          </Typography>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <div>
                {/* <div>
  <hr style={{ borderColor: '#CCCCCC', borderTop: '1px solid', borderStyle: 'none none solid', width: '100%' }} />
</div>  */}
              </div>
              <div
                style={{
                  dispay: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  marginTop: '20px',
                }}
              >
                <div>
                  <Typography
                    style={{
                      color: palette.text.dark,
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '20px',
                      textAlign: 'left',
                    }}
                  >
                    Recent Patients
                  </Typography>
                </div>
                {patientsList?.results?.length > 0 ? (
                  patientsList.results.map((item, index) => (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 5,
                        marginTop: '20px',
                        borderBottom: '1px solid  #CCCCCC',
                        padding: '10px',
                      }}
                      key={index}
                    >
                      <div>
                        <img
                          src={
                            item?.file?.file
                              ? getImageUrl(item?.file?.file)
                              : userIcon
                          }
                          alt="profile"
                          width="24px"
                          height="24px"
                          style={{ borderRadius: '80%', objectFit: 'cover' }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        <Typography
                          style={{
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: palette.text.dark,
                          }}
                        >
                          {getFullName(item)}
                        </Typography>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 30,
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            style={{
                              fontWeight: 400,
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: palette.text.offWhite,
                            }}
                          >
                            {`${getGender(item || {})}, ${getAge(item?.dob)}`}
                          </Typography>
                          <Typography
                            style={{
                              fontWeight: 400,
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: palette.text.dark,
                            }}
                          >
                            {convertWithTimezone(item.createdAt, {
                              format: dateFormats.MMMMDhmmA,
                            })}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    No Patient
                  </div>
                )}
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardHome;
