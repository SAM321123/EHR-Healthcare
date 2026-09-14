import React, { useContext, useEffect, useState } from 'react';
import {
  Card,
  CardMedia,
  Typography,
  Grid,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import palette from 'src/theme/palette';
import person from 'src/assets/images/patient.png';
import ShowPatientActivityLog from '../Home/TopCard';
import {
  getFullName,
  getImageUrl,
  dateFormatter,
  getInsurance,
  showSnackbar,
  formatPhoneNumber,
} from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';
import { capitalize } from 'lodash';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD, SOCKET_URL } from 'src/api/constants';
import { MD_TOOLBOX_SYNC } from 'src/store/types';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { decrypt, encrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import { Iconify } from 'src/components/iconify';
import userIcon from 'src/assets/images/user.png';
import ModalComponent from 'src/components/modal';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { io } from 'socket.io-client';
import PatientChat from 'src/pages/Message/PatientChat';
import MessageIcon from "@mui/icons-material/Message";
import { ChatContext } from 'src/context/chatContext';

const socket = io(SOCKET_URL, {
  path: '/socket/messages', // Custom endpoint path
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: theme.spacing(2),
  },
  cover: {
    width: 151,
    height: 151,
    borderRadius: '10%',
    padding: '0.5em',
  },
}));
export const PatientInfoCard = ({ patientData }) => {
  const classes = useStyles();
  let { patientId } = useParams();
  patientId = decrypt(patientId);

  const navigate = useNavigate();



  const [showMessage, setShowMessage] = useState(false);
  const [initialValues, setInitialValues] = useState({patient: {...patientData} })
  const isPatientLoaded = Boolean(patientData?.id);
  const canMessagePatient = Boolean(patientData?.userId);

  const [response, , , callMdToolboxSyncAPI, clearData] = useCRUD({
    id: `${MD_TOOLBOX_SYNC}`,
    url: API_URL.mdToolboxSync,
    type: REQUEST_METHOD.get,
  }); 

  const patientSyncMdToolbox= ()=>{
    callMdToolboxSyncAPI({}, `/${patientId}`);

  }
  const handleSendMessage =()=> {
    if (!isPatientLoaded) {
      return;
    }
    if (!canMessagePatient) {
      showSnackbar({
        message: 'This patient does not have a linked portal account yet.',
        severity: 'warning',
      });
      return;
    }
    setShowMessage(true);
  }
  const closeMessageModel = () => {
    setShowMessage(false);
  }
    const { 
      NewChatWindow,
    } =
      useContext(ChatContext);

  useEffect(()=>{
    if(response){
      showSnackbar({
        message: 'Sync successfully',
        severity: 'success',
      });
      clearData(true)
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)
    }
  },[clearData, patientId, response])

  return (
    <Card
      style={{
        border: '1px solid #E8E8E8',
        margin: '1em 2em',
        padding: '1em 0.5em',
      }}
    >
      <Grid container>
        <Grid item md={3}>
          <CardMedia
            component="img"
            className={classes.cover}
            image={
              patientData?.file?.file
                ? getImageUrl(patientData?.file?.file)
                : userIcon
            }
            alt="Patient Photo"
          />
        </Grid>
        <Grid item md={9}>
          <div>
            <Grid
              container
              style={{ alignItems: 'center', paddingBottom: '0.5em' }}
            >
              <Grid item xs={6} md={8}>
                <Typography
                  color={palette.background.main}
                  style={{
                    fontSize: 20,
                    lineHeight: '20px',
                    fontWeight: 600,
                  }}
                >
                  {getFullName(patientData)}
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                md={4}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5em',
                }}
              >
                <IconButton
              onClick={patientSyncMdToolbox}
              sx={{
                mr: 1,
                color: 'text.primary',
              }}
            >
              <Tooltip title={'Sync with md toolbox'}>

                <Iconify icon="material-symbols:sync" cursor="pointer" sx={{ width: 25, height: 25 }} />
              </Tooltip>
            </IconButton>
              <Tooltip
                title={
                  !isPatientLoaded
                    ? 'Loading patient details'
                    : canMessagePatient
                    ? 'Send Message'
                    : 'Patient has no linked portal account'
                }
                arrow
              >
                <Button 
                  variant="contained" 
                  onClick={handleSendMessage}
                  disabled={!isPatientLoaded}
                >
                  {!isPatientLoaded ? 'Loading...' : <MessageIcon />}
                </Button>
              </Tooltip>
                <Button variant="contained" color="primary">
                  Active
                </Button>
              </Grid>
              
            </Grid>

            <Grid container style={{ padding: '0.5em 0' }}>
              <Grid item xs={12} md={4}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Patient ID:
                  </Typography>
                  <Typography
                    color={palette.text.dark}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    {patientData?.id}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} md={3}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Gender:
                  </Typography>
                  <Typography
                    color={palette.text.dark}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    {patientData?.sexAtBirth?.name || 'N/A'}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} md={5}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Patient Since:
                  </Typography>
                  <Typography
                    color={palette.text.dark}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    {dateFormatter(
                      patientData?.createdAt,
                      dateFormats.MMDDYYYY
                    )}
                  </Typography>
                </div>
              </Grid>
            </Grid>
            <Grid container style={{ padding: '0.5em 0' }}>
              <Grid item xs={12} md={7}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Phone:
                  </Typography>
                  <Typography
                    color={palette.text.dark}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    {formatPhoneNumber(patientData?.phone) ||
                      formatPhoneNumber(patientData?.homePhone) ||
                      formatPhoneNumber(patientData?.preferredPhone) ||
                      formatPhoneNumber(patientData?.workPhone) ||
                      formatPhoneNumber(patientData?.textMessagePhone) ||
                      'N/A'}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} md={5}>
                <div style={{ display: 'flex' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Email:
                  </Typography>
                  <Tooltip title={patientData?.email || 'N/A'}>
                    <Typography
                      color={palette.text.dark}
                      style={{
                        fontSize: 14,
                        lineHeight: '20px',
                        fontWeight: 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginLeft: 4,
                      }}
                    >
                      {patientData?.email}
                    </Typography>
                  </Tooltip>
                </div>
              </Grid>
            </Grid>
            <Grid container style={{ padding: '0.5em 0' }}>
              <Grid item xs={12} md={7}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Billing Type:
                  </Typography>
                  <Typography
                    color={palette.text.dark}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    {capitalize(patientData?.billingType) || 'N/A'}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} md={5}>
                <div style={{ display: 'flex' }}>
                  <Typography
                    color={palette.text.offWhite}
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 400,
                    }}
                  >
                    Medical Insurance:
                  </Typography>
                  <Tooltip
                    title={getInsurance(patientData?.insurance) || 'N/A'}
                  >
                    <Typography
                      color={palette.text.dark}
                      style={{
                        fontSize: 14,
                        lineHeight: '20px',
                        fontWeight: 400,
                        marginLeft: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getInsurance(patientData?.insurance) || 'N/A'}
                    </Typography>
                  </Tooltip>
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <div>
        <ShowPatientActivityLog patientId={patientData?.id} />
      </div>
      {showMessage && patientData && (
        <ModalComponent
          open={showMessage}
          header={{
            title: `Start Chat`,
            closeIconAction: closeMessageModel,
          }}
          containerStyle={{ width: '40%' }}
        >
          <PatientChat
            patientUserId={patientData?.userId}
            onClose={closeMessageModel}
            initialValues={initialValues}
            patient={patientData}
            // handleOnFetchDataList={handleOnFetchDataList}
            // messagesHandleOnFetchDataList={messagesHandleOnFetchDataList}
            NewChatWindow={NewChatWindow}
          />
        </ModalComponent>
      )}
    </Card>
  );
};
