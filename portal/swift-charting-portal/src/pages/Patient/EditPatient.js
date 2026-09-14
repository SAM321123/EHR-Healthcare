import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';

import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate, useParams } from 'react-router-dom';

import palette from 'src/theme/palette';
import { dateFormats, tabsStyling } from 'src/lib/constants';
import BackIcon from 'src/assets/images/svg/back.svg';

import Box from 'src/components/Box';
import Tabs from 'src/components/Tabs/tabsWithNavigation';
import Typography from 'src/components/Typography';
import { UI_ROUTES } from 'src/lib/routeConstants';
import usePatientDetail from 'src/hooks/usePatientDetail';
import CustomButton from 'src/components/CustomButton';
import { Grid } from '@mui/material';
import Modal from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PatientOverview from './components/Overview';
import PatientAppointmentList from './components/Appointment';
import PatientNotes from './components/Comments';
import PatientInvoiceList from './components/Invoice';
import EPrescription from './components/EPrescription';
import PatientFiles from './components/Files';
import Chat from '../Chat/ChatComponent';
import PatientTags from './components/PatientTags';
import FormTabsPatient from './components/Form/PatientFormsTabs';
import AddPatientTags from './components/AddPatientTags';
import PatientNotesHistory, {
  getActiveNote,
} from './components/PatientNotesHistory';

const useStyles = makeStyles({
  root: {
    ...tabsStyling.root,
    backgroundColor: palette.background.offWhite,
  },
  selected: {
    ...tabsStyling.selected,
    backgroundColor: palette.grey[0],
    borderRadius: '8px 8px 0 0',
    boxShadow: `0px 5px 9px 0px ${palette.grey[400]}`,
  },
});

const tabIndicatorProps = {
  display: 'none',
};
const EditPatient = () => {
  const navigate = useNavigate();
  const [isTagVisible, setIsTagVisible] = useState('');
  const [isNotes, setIsNotes] = useState('');
  const [showNote, setShowNote] = useState(false);
  const tabClasses = useStyles();
  const params = useParams();
  const patientId = params?.id;

  const [response, , , deleteTags, clearData] = useCRUD({
    id: `DELETE_TAGS`,
    url: API_URL.patient,
    type: REQUEST_METHOD.update,
  });

  const [patientData, , getDetail, clearResponse] = usePatientDetail({
    patientId,
  });

  useEffect(() => {
    if (patientData && !getActiveNote(patientData?.note)) {
      setShowNote(true);
    } else if (patientData?.note?.length && !showNote) {
      setIsNotes(patientData.note[0]?.note);
      setShowNote(true);
    }
  }, [patientData]);

  useEffect(
    () => () => {
      setShowNote(false);
      clearResponse(true);
    },
    []
  );

  const toggleTagModal = useCallback(
    (type) => {
      setIsTagVisible(type);
    },
    [isTagVisible]
  );

  const handleBackIconClick = useCallback(() => {
    navigate(UI_ROUTES.patient);
  }, [navigate]);

  const tabs = [
    {
      label: 'Overview',
      component: PatientOverview,
    },
    {
      label: 'Comments',
      component: PatientNotes,
    },
    {
      label: 'Appointments',
      component: PatientAppointmentList,
    },
    {
      label: 'Invoice',
      component: PatientInvoiceList,
    },
    {
      label: 'Forms',
      component: FormTabsPatient,
    },
    {
      label: 'Med-Instructions',
      component: EPrescription,
    },
    {
      label: 'Files',
      component: PatientFiles,
    },
    {
      label: 'Chat',
      component: Chat,
    },
  ];

  useEffect(() => {
    if (response) {
      getDetail();
      clearData();
    }
  }, [response]);

  const onDelete = (index) => {
    const tags = patientData?.tags;
    tags.splice(index, 1);
    patientData.tags = tags;
    deleteTags({ tagsIndex: index }, `/${patientId}`);
  };

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ display: 'flex', mt: 1, mb: 2, alignItems: 'center' }}>
          <IconButton
            variant="secondary"
            sx={{
              boxShadow: 'none',
              padding: 0,
              minWidth: 'unset',
              backgroundColor: 'transparent',
              borderRadius: '50%',
            }}
            onClick={handleBackIconClick}
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
          <Box>
            <Typography sx={{ ml: 1, fontSize: '0.8rem' }} variant="h7">
              {patientData?.name}
            </Typography>
            <Typography
              sx={{ ml: 1, fontSize: '08px', color: palette.primary.main }}
              variant="body2"
            >
              {dayjs(patientData?.dob).format(dateFormats.MMDDYYYY)}
            </Typography>
          </Box>
          <Box sx={{ ml: 2 }}>
            <PatientTags tags={patientData?.tags} onDelete={onDelete} />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'end',
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'end',
            }}
          >
            <Grid container>
              <Grid item xs={12} md={12} lg={6} sm={12}>
                <CustomButton
                  align="end"
                  label="Add Tag"
                  variant="outlined"
                  sx={{
                    fontSize: '10px',
                    height: '25px',
                    mr: 2,
                    px: 0,
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => toggleTagModal('tags')}
                />
              </Grid>
              <Grid item xs={12} md={12} lg={6} sm={12}>
                <CustomButton
                  label="Add Alert"
                  variant="outlined"
                  sx={{
                    fontSize: '10px',
                    height: '25px',
                    mt: { xs: 2, md: 2, sm: 2, lg: 0 },
                    px: 0,
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => toggleTagModal('notes')}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      <Tabs
        data={tabs}
        tabClasses={tabClasses}
        tabIndicatorProps={tabIndicatorProps}
        tabPanelStyle={{ padding: 0, paddingTop: '2px', height: '100%' }}
        path={UI_ROUTES.editPatient}
      />
      {isTagVisible && (
        <Modal
          open={isTagVisible}
          onClose={() => toggleTagModal('')}
          header={{
            title: isTagVisible === 'tags' ? 'Add Tags' : 'Add Alert',
          }}
        >
          <AddPatientTags
            getDetail={getDetail}
            modalCloseAction={toggleTagModal}
            patientId={patientId}
            type={isTagVisible}
            patientNote={patientData?.note}
          />
        </Modal>
      )}

      {isNotes && getActiveNote(patientData?.note) && (
        <Modal
          open={!!isNotes}
          onClose={() => setIsNotes('')}
          header={{
            title: 'Patient Note',
            warningIcon: true,
          }}
        >
          <PatientNotesHistory
            modalCloseAction={() => setIsNotes('')}
            patientData={patientData}
          />
        </Modal>
      )}
    </>
  );
};

export default EditPatient;
