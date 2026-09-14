import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Typography from 'src/components/Typography';
import { dateFormatter, getFullName } from 'src/lib/utils';
import { dateFormats, formStatus } from 'src/lib/constants';
import PatientTags from 'src/pages/Patient/components/PatientTags';
import useAuthUser from 'src/hooks/useAuthUser';
import { Box, Button, Grid, IconButton } from '@mui/material';
import palette from 'src/theme/palette';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { capitalize } from 'lodash';
import { useForm } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ModalComponent from 'src/components/modal';
import ViewFormData from './viewFormData';

const PatientAppointmentFormList = ({ patientForms }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [zoomIn, setZoomIn] = useState(false);
  const [rules, setRules] = useState([]);
  const [formGroups, setFormGroups] = useState([]);
  const form = useForm({});
  const params = useParams();
  const [patientId, setPatientId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [patientData] = usePatientDetail({
    patientId,
  });

  const handleViewClick = (form) => {
    setSelectedForm(form);
    setFormTitle(form?.formData?.name)
    setFormGroups(
      JSON.parse(form?.formData?.questions || '[]')
    );
    setRules(JSON.parse(form?.formData?.rules || '[]'));
    setPatientId(form?.patientId)
  };

  const handleBackClick = () => {
    setSelectedForm(null);
  };

  const handleZoomInClick = () => {
    setZoomIn(true);
  };
  const handleZoomOutClick = () => {
    setZoomIn(false);
  };

  const setProfileMappedValues = useCallback(() => {
    const sections = JSON.parse(
      selectedForm?.formData?.questions || '[]'
    );
    sections.forEach(({ fields }) => {
      fields?.forEach((field) => {
        field?.forEach((item) => {
          const mappingField = item?.profileFieldMapping;
          if (mappingField) {
            if (mappingField === 'address') {
              form.setValue(
                item?.name,
                patientData[mappingField]?.description,
                {
                  shouldValidate: true,
                }
              );
            } else {
              form.setValue(item?.name, capitalize(patientData[mappingField]), {
                shouldValidate: true,
              });
            }
          }
        });
      });
    });
  }, [form, patientData, selectedForm?.formData?.questions]);

  const defaultSubmissionValue = useMemo(() => {
    if (
      selectedForm?.patientFormSubmission &&
      selectedForm?.formData?.formType?.code !== 'FT_CONSENT_FORMS'
    ) {
      return JSON.parse(
        selectedForm?.patientFormSubmission?.partialResponse ||
          selectedForm?.patientFormSubmission?.response ||
          '{}'
      );
    }
    if (
      selectedForm &&
      patientData &&
      selectedForm?.formData?.formType?.code  !== 'FT_CONSENT_FORMS'
    ) {
      setProfileMappedValues();
    }

    return {};
  }, [
    setProfileMappedValues,
    patientData,
    selectedForm
  ]);

  return (
    <>
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        margin: 'auto',
      }}
    >
      {!selectedForm ? (
        <div>
          {patientForms.length ?  (
            patientForms?.map((data, index) => {
              const { patientFormSubmission, status, formData, practitioner, sharedWith } = data || {};
              const { tags } = patientFormSubmission || {};
              const formTypeCode = formData?.formType?.code;
  
              // Determine the parsed form status
              let parsedFormStatus = status;
              if (formTypeCode === 'FT_NOTE_TEMPLATES') {
                if (status === formStatus.SENT) {
                  parsedFormStatus = 'Pending';
                } else if (status === formStatus.COMPLETE && sharedWith) {
                  parsedFormStatus = 'Sent';
                } else if (status === formStatus.COMPLETE || status === formStatus.PARTIAL) {
                  parsedFormStatus = 'Draft';
                }
              }
  
              return (
                <div key={index} style={{ marginTop: '2em' }}>
                  <div
                    style={{
                      padding: '1em',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Typography
                      style={{
                        color: palette.text.dark,
                        fontSize: 14,
                        lineHeight: '24px',
                        fontWeight: 400,
                        marginBottom: '1em',
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Form Name:</strong> {formData?.name || 'Untitled Form'}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Form Category:</strong> {formData?.formCategory?.name || 'N/A'}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Practitioner:</strong> {getFullName(practitioner || {}) || 'N/A'}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Shared At:</strong> {dateFormatter(formData?.createdAt, dateFormats.MMMDDYYYYHHMMSS) || 'N/A'}
                      </div>
                      <div>
                        <strong>Status:</strong> {parsedFormStatus || 'N/A'}
                      </div>
                      </Typography>
                      <div style={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="contained"
                          style={{
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            fontWeight: 500,
                            padding: '6px 16px',
                            textTransform: 'capitalize',
                            borderRadius: '4px',
                          }}
                          onClick={() => handleViewClick(data)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
              );
            }))
            : (<Typography>No Forms Available</Typography>)
          }
        </div>
      ) : (
        <div
          style={{
            overflowY: 'auto',
            maxHeight: '500px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            {/* Back Button */}
            <IconButton
              color="primary"
              onClick={handleBackClick}
            >
              <ArrowBackIcon />
            </IconButton>

            {/* Spacer */}
            <div style={{ flexGrow: 1 }}></div>

            <IconButton
              color="primary"
              onClick={handleZoomInClick}
              style={{ marginLeft: 'auto' }}
            >
              <ZoomInIcon />
            </IconButton>
          </div>
          {/* Placeholder for when a form is selected */}
          <Typography
            variant="h6"
            style={{
              marginTop: '2em',
              color: palette.text.dark,
            }}
          >
            {formTitle}
            <ViewFormData
              questions={formGroups}
              rules={rules}
              answers={defaultSubmissionValue}
              patient = {patientData}
            />
          </Typography>
        </div>
      )}
    </Box>
    {zoomIn &&(
      <ModalComponent
        open={zoomIn}
        containerStyle={{ width: '90%' }}
        header={{
          title: formTitle,
          closeIconAction: handleZoomOutClick,
        }}
      >
        <ViewFormData
          questions={formGroups}
          rules={rules}
          answers={defaultSubmissionValue}
          patient = {patientData}
        />
    </ModalComponent>
    )}
    </>
  );
};

export default PatientAppointmentFormList;
