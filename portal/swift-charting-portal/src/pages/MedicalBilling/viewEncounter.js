import {
    Box,
    CardActions,
    CardContent,
    Divider,
    Grid,
    Paper,
    Typography,
  } from '@mui/material';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import EditorPreview from 'src/components/form/Editor/editorPreview';
import useCRUD from 'src/hooks/useCRUD';
import { dateFormats } from 'src/lib/constants';
import { dateFormatter,getFullName } from 'src/lib/utils';
import { ENCOUNTER_DATA_VIEW } from 'src/store/types';
import PatientInfo from '../Patient/components/patientInfo';
import RenderDynamicForms from '../Patient/components/Encounters/createEncounters/viewEncounter/renderDynamicForms';
import ViewSelectedFormTable from '../Patient/components/Encounters/createEncounters/viewEncounter/table';
//   import ViewSelectedFormTable from './table';
//   import RenderDynamicForms from './renderDynamicForms';
  
  
  const ViewEncounter = ({ encounterId, modalCloseAction }) => {
    const form = useForm({ mode: 'onChange' });
    const [selectedForms, setSelectedForms] =useState({})
    const [
      patientEncounter,
      ,
      patientEncounterLoading,
      callPatientEncounterAPI,
      clearPatientEncounter,
    ] = useCRUD({
      id: `${ENCOUNTER_DATA_VIEW}-${encounterId}`,
      url: `${API_URL.patientEncounter}/${encounterId}`,
      type: REQUEST_METHOD.get,
    });
  
    useEffect(() => {
      if (encounterId) {
        callPatientEncounterAPI();
      }
    }, [encounterId, callPatientEncounterAPI]);
  
    useEffect(() => {
      if (!isEmpty(patientEncounter)) {
        const { selectedForms: selectedFormsAtDB } = patientEncounter;
          setSelectedForms(selectedFormsAtDB);
      }
    }, [patientEncounter, selectedForms]);
  
    useEffect(()=>{
      return ()=>{
        clearPatientEncounter(true)
      }
    },[]);
    const {
      soapForm,
      startDate,
      endDate,
      encounterType,
      assignedTo,
      billingType,
      duration,
      Allergies,
      LabRadiologies,
      Diagnosis,
      Medications,
      Vitals,
      patientEncounterForms,
    } = patientEncounter || {};
  
    const { plan, objective, subjective, assessment } = soapForm || {};
  
    return (
      <Container loading={patientEncounterLoading}>
        <CardContent>
          <PatientInfo wrapperStyle={{flex:1}} customPatientId={patientEncounter?.patientId}/>
          <Grid container spacing={3} style={{marginTop:'10px'}}>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                Encounter Type:
              </Typography>
              <Typography variant="body2">
                {encounterType?.name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                Start Date:
              </Typography>
              <Typography variant="body2">{dateFormatter(startDate,dateFormats.MMDDYYYY)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                Time:
              </Typography>
              <Typography variant="body2">{dateFormatter(startDate,dateFormats.hhmmA)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                Assigned To:
              </Typography>
              <Typography variant="body2">
                {getFullName(assignedTo)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                Billing Type:
              </Typography>
              <Typography variant="body2">{billingType?.name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                End Time:
              </Typography>
              <Typography variant="body2">{dateFormatter(endDate,dateFormats.hhmmA)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" fontWeight="bold">
                Duration:
              </Typography>
              <Typography variant="body2">{duration || 'N/A'}</Typography>
            </Grid>
            {!isEmpty(Allergies) && (
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="bold">
                  Allergies:
                </Typography>
                <ViewSelectedFormTable type="Allergies" data={Allergies} />
              </Grid>
            )}
            {!isEmpty(LabRadiologies) && (
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="bold">
                  Lab Orders:
                </Typography>
                <ViewSelectedFormTable
                  type="LabRadiologies"
                  data={LabRadiologies}
                />
              </Grid>
            )}
            {!isEmpty(Diagnosis) && (
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="bold">
                  Diagnosis:
                </Typography>
                <ViewSelectedFormTable type="Diagnosis" data={Diagnosis} />
              </Grid>
            )}
            {!isEmpty(Medications) && (
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="bold">
                  Medications:
                </Typography>
                <ViewSelectedFormTable type="Medications" data={Medications} />
              </Grid>
            )}
            {!isEmpty(Vitals) && (
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="bold">
                  Vitals:
                </Typography>
                <ViewSelectedFormTable type="Vitals" data={Vitals} />
              </Grid>
            )}
            {(plan || subjective || objective || assessment) && (
              <Grid item xs={12} style={{marginTop:'20px'}}>
                <Paper
                  elevation={3}
                  sx={{ padding: '20px', marginBottom: '20px' }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    SOAP Form:
                  </Typography>
                  <Divider mb={2} />
                  <Grid container spacing={2} alignItems="flex-start" style={{marginTop:'15px'}}>
                    {subjective && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Subjective:
                        </Typography>
                        <EditorPreview editorValue={subjective} />
                      </Grid>
                    )}
                    {objective && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Objective:
                        </Typography>
                        <EditorPreview editorValue={objective} />
                      </Grid>
                    )}
  
                    {assessment && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Assessment:
                        </Typography>
                        <EditorPreview editorValue={assessment} />
                      </Grid>
                    )}
  
                    {plan && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Plan:
                        </Typography>
                        <EditorPreview editorValue={plan} />
  
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardContent>
            {patientEncounterForms?.map((formData) => {
        return (
          <RenderDynamicForms key={formData?.id} formData={formData}/>
        );
      })}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-start', px: 3 }}>
          <LoadingButton
            variant="outlinedSecondary"
            onClick={modalCloseAction}
            label="Cancel"
          />
        </CardActions>
      </Container>
    );
  };
  
  export default ViewEncounter;
  