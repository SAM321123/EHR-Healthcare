import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  Paper
} from '@mui/material';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Checkbox from 'src/components/Checkbox';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Esignature from 'src/components/E-Signature';
import PageHeader from 'src/components/PageHeader';
import Typography from 'src/components/Typography';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import useQuery from 'src/hooks/useQuery';
import useReduxState from 'src/hooks/useReduxState';
import { dateFormats, initalFormData, initialBillingData, initialSelectedForms, successMessage } from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import { convertWithTimezone, dateFormatter, getCurrentMeridien, getDateTimeString, getFullName, getUTCDateTime, getUserTimezone, showSnackbar } from 'src/lib/utils';
import { ENCOUNTERS_LIST, ENCOUNTER_BILLING_DATA, ENCOUNTER_DATA, SAVE_PATIENT_ENCOUNTER } from 'src/store/types';
import palette from 'src/theme/palette';
import PatientInfo from '../../patientInfo';
import EncounterInfo from './encounterInfo';
import './index.scss';
import SuperBillForm from './superBill/superBillForm';
import ViewEncounter from './viewEncounter';


const CreateEncounters = () => {
  let { patientId, encounterId } = useParams();
  const navigate = useNavigate();
  if (patientId) {
    patientId = decrypt(patientId);
  }
  if (encounterId) {
    encounterId = decrypt(encounterId);
  }

  const [myEnouterId, setMyEncouterId] = useState(encounterId);
  const [atDraft, setAtDraft] = useState(true);

  const [patientData] = usePatientDetail({ patientId });
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = form;

  const [viewEncounter, setViewEncounter] = useState(false);
  const [encounterToView, setEncounterToView] = useState();
  const [showSignature, setShowSignature] = useState({ show: false });
  const [signatureError, setSignatureError] = useState(false);
  const [signature, setSignature] = useState('');
  const [showSuperBill, setShowSuperBill] = useState(false);
  const [encounterType, setEncounterType] = useState(false);
  const [disabledFormCheckbox, setDisabledFormCheckbox] = useState(false);
  const [isClose, setIsClose] = useState(false);


  const [encounterForms, setEncounterForms] = useState({
    staticForms: [
      { title: 'Allergies', code: 'allergies', type: 'allergiesList' },
      { title: 'Diagnosis', code: 'diagnosis', type: 'diagnosisList' },
      { title: 'Vitals', code: 'vitals', type: 'vitalsList' },
      { title: 'Medication', code: 'medication', type: 'medicationList' },
      { title: 'Lab Orders', code: 'labOrders', type: 'labList' },
      { title: 'SOAP', code: 'soapForm', type: 'soapForm' },
    ],
    dynamicForms: [],
  });

  const [, setFormData] = useReduxState(
    `Patient_Encounter-Form-Data`,
    initalFormData
  );
  const [dynamicFormData, setDynamicFormData] = useReduxState(`Patient_Encounter-Form-Data-Dynamic-From`);
  const [soapFormData, setSoapFormData] = useReduxState(`Patient_Encounter-Form-Data-SOAP-Form-Data`, {});

  const [allergies, setAllergies] = useReduxState(
    `Patient_Encounter-Allergies`,
    []
  );
  const [vitals, setVitals] = useReduxState(
    `Patient_Encounter-Vitals`,
    []
  );
  const [labOrders, setLabsOrders] = useReduxState(
    `Patient_Encounter-Labs`,
    []
  );
  const [medications, setMedications] = useReduxState(
    `Patient_Encounter-Medications`,
    []
  );
  const [diagnosis, setDiagnosis] = useReduxState(
    `Patient_Encounter-Diagnosis`,
    []
  );
  const [selectedForms, setSelectedForms] = useReduxState(
    `Patient_Encounter-Selected-Forms`,
    initialSelectedForms
  );
  const [, setFormDefaultData] = useReduxState(
    `Patient_Encounter-Form-Default-Data`);
  const [, setBillingData] = useReduxState(
    `Patient_Encounter-Billing-Data`, initialBillingData
  );

  const [
    encounterSaveResponse,
    ,
    encounterSaveLoading,
    callEncounterSaveAPI,
    clearEncounterSaveData,
  ] = useCRUD({
    id: SAVE_PATIENT_ENCOUNTER,
    url: API_URL.patientEncounter,
    type: !myEnouterId
      ? REQUEST_METHOD.post
      : REQUEST_METHOD.update,
  });

  const [patientEncounters] = useQuery({
    listId: `${ENCOUNTERS_LIST}-${patientId}`,
    url: API_URL.patientEncounter,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  const [
    patientEncounterBillingData,
    ,
    patientEncounterBillingLoading,
    callPatientEncounterBillingAPI,
    clearPatientEncounterBilling,
  ] = useCRUD({
    id: `${ENCOUNTER_BILLING_DATA}-${myEnouterId}`,
    url: `${API_URL.patientEncounterBilling}/encounter/${myEnouterId}`,
    type: REQUEST_METHOD.get,
  });
  const [
    patientEncounter,
    ,
    patientEncounterLoading,
    callPatientEncounterAPI,
    clearPatientEncounter,
  ] = useCRUD({
    id: `${ENCOUNTER_DATA}-${myEnouterId}`,
    url: `${API_URL.patientEncounter}/${myEnouterId}`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'encounterTypeCode') {
        if (
          value.encounterTypeCode === 'dap' ||
          value.encounterTypeCode === 'birp'
        ) {
          setSelectedForms(initialSelectedForms);

          setDisabledFormCheckbox(true);
        } else {
          setDisabledFormCheckbox(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);


  useEffect(() => {
    if (myEnouterId) {
      //callPatientEncounterBillingAPI();
      callPatientEncounterAPI();
    }

  }, []);

  useEffect(() => {
    if (!isEmpty(patientEncounter)) {
      const {
        selectedForms: selectedFormsAtDB,
        soapForm,
        patientEncounterForms,
        encounterTypeCode,
        assignedToId,
        billingTypeCode,
        duration,
        endDate,
        startDate,
        atDraft,
        behavior,
        intervention,
        response,
        birpPlan,
        data,
        assessment,
        dapPlan,
      } = patientEncounter;
      const startDateObj = convertWithTimezone(startDate, { requiredPlain: true });
      const endDateObj = convertWithTimezone(endDate, { requiredPlain: true });
      // const endDateObj = convertWithTimezone(startDate,{requiredPlain:true});
      if (!atDraft) {
        setAtDraft(false);
      }
      setSelectedForms(isEmpty(selectedFormsAtDB) ? initialSelectedForms : selectedFormsAtDB);
      const temp = patientEncounterForms?.reduce((acc, item) => {
        acc[item.formId] = JSON.parse(item.responses);
        return acc;
      }, {});


      setDynamicFormData(temp);
      setSoapFormData(soapForm);

      setFormDefaultData({
        soapForm,
        dynamicForms: temp,
        encounterTypeCode,
        assignedToId,
        billingTypeCode,
        duration: duration || '',
        endDate,
        startDate: startDateObj,
        startMinute: startDateObj.format("mm"),
        startMeridien: startDateObj.format("A"),
        startHour: startDateObj.format("hh"),
        endHour: atDraft ? getCurrentMeridien()?.hour : endDateObj.format("hh"),
        endMinute: atDraft ? getCurrentMeridien()?.minute : endDateObj.format("mm"),
        endMeridien: atDraft ? getCurrentMeridien()?.meridien : endDateObj.format("A"),
        behavior,
        intervention,
        response,
        birpPlan,
        data,
        assessment,
        dapPlan,
        // endHour:endDateObj.format("hh"),
        // endMinute:endDateObj.format("mm"),
        // endMeridien:endDateObj.format("A"),
      });
      // clearPatientEncounter(true);
    }
  }, [patientEncounter, patientData]);

  const handleAddAllergy = useCallback(
    (allergy = {}) => {
      setFormData((prev) => {
        return {
          ...prev,
          allergies: [...(prev.allergies || []), allergy?.id],
        };
      });
    },
    [setFormData]
  );

  const handleAddVitals = useCallback(
    (vital = {}) => {
      setVitals((prev) => [...prev, vital.id]);
    },
    [setVitals]
  );

  const handleAddDiagnosis = useCallback(
    (diagnosis = {}) => {
      setDiagnosis((prev) => [...prev, diagnosis?.id]);
    },
    [setDiagnosis]
  );

  const handleAddLabOrders = useCallback(
    (labOrder = {}) => {
      setLabsOrders((prev) => [...prev, labOrder?.id]);
    },
    [setLabsOrders]
  );

  const handleAddMedications = useCallback(
    (medication = {}) => {
      setMedications((prev) => [...prev, medication?.id]);
    },
    [setMedications]
  );

  useEffect(() => {
    Events.on(
      `ADD_ALLEGRY_ON_ENCOUNTER`,
      `ADD_ALLEGRY_ON_ENCOUNTER`,
      handleAddAllergy
    );
    Events.on(
      `ADD_VITAL_ON_ENCOUNTER`,
      `ADD_VITAL_ON_ENCOUNTER`,
      handleAddVitals
    );
    Events.on(
      `ADD_DIAGNOSIS_ON_ENCOUNTER`,
      `ADD_DIAGNOSIS_ON_ENCOUNTER`,
      handleAddDiagnosis
    );
    Events.on(
      `ADD_MEDICATION_ON_ENCOUNTER`,
      `ADD_MEDICATION_ON_ENCOUNTER`,
      handleAddMedications
    );
    Events.on(
      `ADD_LAB_ORDER_ON_ENCOUNTER`,
      `ADD_LAB_ORDER_ON_ENCOUNTER`,
      handleAddLabOrders
    );
  }, [
    handleAddAllergy,
    handleAddDiagnosis,
    handleAddLabOrders,
    handleAddMedications,
    handleAddVitals,
  ]);

  useEffect(() => {
    return () => {
      // clearPatientEncounter(true);

      setFormData(initalFormData);
      setSelectedForms(initialSelectedForms);
      setDynamicFormData({});
      setSoapFormData({});

      setAllergies([]);
      setVitals([]);
      setLabsOrders([]);
      setMedications([]);
      setDiagnosis([]);


      setFormDefaultData({});
      setBillingData(initialBillingData);

      Events.remove(`ADD_LAB_ORDER_ON_ENCOUNTER`, `ADD_LAB_ORDER_ON_ENCOUNTER`);

      Events.remove(
        `ADD_MEDICATION_ON_ENCOUNTER`,
        `ADD_MEDICATION_ON_ENCOUNTER`
      );

      Events.remove(`ADD_DIAGNOSIS_ON_ENCOUNTER`, `ADD_DIAGNOSIS_ON_ENCOUNTER`);

      Events.remove(`ADD_VITAL_ON_ENCOUNTER`, `ADD_VITAL_ON_ENCOUNTER`);

      Events.remove(`ADD_ALLEGRY_ON_ENCOUNTER`, `ADD_ALLEGRY_ON_ENCOUNTER`);
    };
  }, []);


  const handleFormSelect = (form) => {
    setSelectedForms((prevSelectedForms) => {
      if (form.type === 'dynamicForm') {
        if (prevSelectedForms.dynamicForms[form.code]) {
          return prevSelectedForms; // Form already selected, no need to add
        }
        return {
          ...prevSelectedForms,
          dynamicForms: {
            ...prevSelectedForms.dynamicForms,
            [form.code]: form,
          },
        };
      } else {
        if (prevSelectedForms.staticForms?.[form.code]) {
          return prevSelectedForms; // Form already selected, no need to add
        }
        return {
          ...prevSelectedForms,
          staticForms: {
            ...prevSelectedForms.staticForms,
            [form.code]: form,
          },
        };
      }
    });
  };

  const handleFormRemove = (formCode, type) => {
    setSelectedForms((prevSelectedForms) => {
      if (type === 'dynamicForm') {
        const { [formCode]: _, ...rest } = prevSelectedForms.dynamicForms;
        return {
          ...prevSelectedForms,
          dynamicForms: rest,
        };
      } else {
        const { [formCode]: _, ...rest } = prevSelectedForms.staticForms;
        return {
          ...prevSelectedForms,
          staticForms: rest,
        };
      }
    });
  };


  const Image = ({
    src,
    alt = 'icon',
    width = '24px',
    height = '24px',
  } = {}) => <img src={src} alt={alt} width={width} height={height} />;

  const [response, , loadingEncounters, getAPI] = useCRUD({
    id: `form-builder-list-FT_ENCOUNTER_TEMPLATES`,
    url: API_URL.getFormList,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getAPI({ formTypeCode: 'FT_ENCOUNTER_TEMPLATES' });
  }, [getAPI]);

  useEffect(() => {
    if (response?.results) {
      const additionalEncounterForms = response.results.map((form) => ({
        title: form.name,
        code: form.id,
        type: 'dynamicForm',
        questions: form.questions,
        id: form.id,
      }));

      setEncounterForms((prevForms) => ({
        ...prevForms,
        dynamicForms: additionalEncounterForms,
      }));
    }
  }, [response]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewEncounter = (id) => {
    setViewEncounter(true)
    setEncounterToView(id)
  }
  const handleCloseViewEncounter = () => {
    setViewEncounter(false)
    setEncounterToView(null)
  }

  const closeSignature = () => {
    setShowSignature({ show: false });
    setSignature('');
    setSignatureError(false)
  }

  const onHandleSubmit = useCallback(
    (close = false) => {
      if (!signature && showSignature?.show) {
        setSignatureError(true);
        return;
      }
      let data = { ...form.getValues(), signature, dynamicForms: dynamicFormData, allergies, labOrders, diagnosis, medications, vitals, soapForm: soapFormData };

      if (showSignature.hasOwnProperty('atDraft')) {
        data.atDraft = showSignature.atDraft
      }
      if (
        data?.startHour &&
        data.startMinute &&
        data.startMeridien &&
        data.startDate
      ) {
        const { startHour, startMinute, startMeridien, startDate } = data || {};

        data.startDate = getUTCDateTime(startDate, { hour: startHour, minute: startMinute, meridien: startMeridien });
        delete data.startHour;
        delete data.startMinute;
        delete data.startMeridien;
      }
       if (data.encounterTypeCode !== 'birp') {
          data.behavior = null;
          data.intervention = null;
          data.response = null;
          data.birpPlan = null
        }
        if (data.encounterTypeCode !== 'dap') {
          data.data = null;
          data.assessment = null;
          data.dapPlan = null;
        }
      data.selectedForms = selectedForms;
      if (!myEnouterId) {
        data.endDate = moment.tz(getUserTimezone());
        delete data.endHour;
        delete data.endMinute;
        delete data.endMeridien;
        data.patientId = patientId

        callEncounterSaveAPI({ data });
      } else {

        const { endHour,
          endMinute,
          endMeridien } = data;

        data.endDate = getUTCDateTime(data.startDate, { hour: endHour, minute: endMinute, meridien: endMeridien });
        data = { ...data }
        const updatedFields = data;
        delete updatedFields.endHour;
        delete updatedFields.endMinute;
        delete updatedFields.endMeridien;

        if (!isEmpty(updatedFields)) {
          callEncounterSaveAPI({ ...updatedFields }, `/${myEnouterId}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
      closeSignature();
      if (typeof (close) === "boolean") {
        setIsClose(close);
      }

    },
    [myEnouterId, callEncounterSaveAPI, selectedForms, signature, dynamicFormData, soapFormData, showSignature]
  );
  const onHandleSignAndLock = useCallback(
    () => {
      setShowSignature({ show: true, atDraft: false });
    },
    []
  );

  useEffect(() => {
    if (!isEmpty(encounterSaveResponse)) {
      showSnackbar({
        message: !myEnouterId
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      setMyEncouterId(encounterSaveResponse.id);
      if (!encounterSaveResponse.atDraft) {
        setAtDraft(false);
      }
      clearEncounterSaveData(true);
      if (isClose) {
        handleBack()
      }
    }
  }, [encounterSaveResponse, myEnouterId, isClose]);


  // const handleShowSuperBill = ()=>{
  //   callPatientEncounterAPI();
  //   callPatientEncounterBillingAPI();
  //   setEncounterType(patientEncounter?.billingTypeCode)
  //   setShowSuperBill(true);
  // }

  const handleShowSuperBill = async () => {
    callPatientEncounterAPI();
    callPatientEncounterBillingAPI();
  };

  useEffect(() => {
    if (patientEncounter) {
      setEncounterType(patientEncounter?.billingTypeCode);
      // setShowSuperBill(true);
    }
    if (patientEncounter && !patientEncounter?.atDraft) {
      setShowSuperBill(true);
    }
  }, [patientEncounter]);

  const closeSuperBill = useCallback(() => {
    setShowSuperBill(false);
  }, [])

  return (
    <Container
      loading={loadingEncounters || patientEncounterLoading}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <PageHeader showBackIcon title="Back" onPressBackIcon={handleBack} />
      <PatientInfo
        wrapperStyle={{ marginBottom: 39 }}
      />
      <Grid container spacing={2} style={{ padding: '0px' }}>
        <Grid item xs={3} style={{ padding: '0px' }}>
          <Paper style={{ padding: '20px' }}>
            <Card>
              <div>
                <Typography variant="h6" style={{ paddingLeft: '20px', marginTop: '15px' }}>
                  Forms
                </Typography>
              </div>
              <div style={{ maxHeight: '330px', overflowY: 'auto' }}>
                {Object.values(encounterForms?.staticForms || {}).map((form, index) => (
                  <div className='encouter-info-wrapper'>
                    <div className={!atDraft ? `encouter-info-form-disable` : ''}> <Paper
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '5px 20px',
                        margin: '5px 0',
                      }}
                    >
                      <Checkbox disabled={disabledFormCheckbox} label={form.title} checked={selectedForms?.staticForms?.[form?.code] ? true : false} onChange={(e) => {
                        if (e.target.checked) {
                          handleFormSelect(form)
                        } else {
                          handleFormRemove(form.code, 'staticForm')
                        }
                      }} />

                    </Paper>
                    </div></div>
                ))}
                {Object.values(encounterForms?.dynamicForms || {}).map((form, index) => (
                  <div className='encouter-info-wrapper'>
                    <div className={!atDraft ? `encouter-info-form-disable` : ''}>
                      <Paper
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '5px 20px',
                          margin: '5px 0',
                        }}
                      >
                        <Checkbox disabled={disabledFormCheckbox} label={form.title} checked={selectedForms?.dynamicForms?.[form.code] ? true : false} onChange={(e) => {
                          if (e.target.checked) {
                            handleFormSelect(form)
                          } else {
                            handleFormRemove(form.code, 'dynamicForm')
                          }
                        }} />
                      </Paper>
                    </div></div>

                ))}
              </div>
            </Card>
            <Card></Card>
            <Card></Card>
            <Card style={{ padding: '20px', fontSize: '20px', marginTop: '30px' }}>
              <Typography variant="h6">
                Patient Encounters
              </Typography>
              {patientEncounters?.results?.map((data, index) => (
                <Paper
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '10px 0',
                  }}
                >
                  <Box
                    component="div"
                    onClick={() => myEnouterId !== data?.id && handleViewEncounter(data.id)}
                    sx={{
                      cursor: myEnouterId != data.id ? 'pointer' : 'default',
                      color: myEnouterId == data.id ? palette.common.green : 'inherit',
                      '&:hover': {
                        textDecoration: myEnouterId != data.id ? 'underline' : 'none',
                      },
                      pointerEvents: myEnouterId == data.id ? 'none' : 'auto',
                    }}
                  >
                    <Typography
                      variant="body1"
                      style={{
                        fontSize: '14px',
                        ...(myEnouterId == data.id
                          ? { color: palette.common.green }
                          : {}),
                      }}
                    >
                      {`${dateFormatter(
                        data.startDate,
                        dateFormats.MMMDDYYYY
                      )} - ${data?.encounterType?.name}`}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={9} >
          <Paper style={{ padding: '20px' }}>
            <Grid container spacing={2}>
              <div className='encouter-info-wrapper'>
                <div className={!atDraft ? `encouter-info-form-disable` : ''}>
                  <EncounterInfo
                    patientId={patientId}
                    form={form}
                    handleBack={handleBack}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <CardActions
                    sx={{
                      justifyContent: 'flex-start',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                    }}
                  >
                    <LoadingButton
                      disabled={atDraft}
                      onClick={handleShowSuperBill}
                      label={"superbill"}
                      sx={{ height: 30 }}
                    />
                  </CardActions>
                </div>
                <div>
                  <CardActions
                    sx={{
                      justifyContent: 'flex-start',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                    }}
                  >
                    <LoadingButton
                      variant="outlinedSecondary"
                      onClick={handleBack}
                      label="Cancel"
                    />
                    {atDraft && <><LoadingButton
                      loading={encounterSaveLoading}
                      disabled={patientEncounterLoading}
                      onClick={handleSubmit(onHandleSubmit)}
                      label='Save'
                    // label={myEnouterId ? 'Update' : 'Save'}
                    />
                      <LoadingButton
                        loading={encounterSaveLoading}
                        disabled={patientEncounterLoading}
                        onClick={handleSubmit(() => onHandleSubmit(true))}
                        label="Save & close"
                      // label={myEnouterId? "Update & Close" :"Save & close"}
                      />
                      <LoadingButton
                        loading={encounterSaveLoading}
                        disabled={patientEncounterLoading}
                        onClick={handleSubmit(() => { setShowSignature({ show: true, atDraft: true }) })}
                        label={"Sign Encounter"}
                      />
                      <LoadingButton
                        loading={encounterSaveLoading}
                        disabled={patientEncounterLoading}
                        onClick={handleSubmit(onHandleSignAndLock)}
                        label={"Sign & Lock Encounter"}
                      />
                      {/* <LoadingButton
          loading={encounterSaveLoading}
          disabled={patientEncounterLoading}
          onClick={handleSubmit(()=>{setShowSignature(true)})}
          label={"Sign & Save"}
        /> */}
                    </>
                    }
                  </CardActions>
                </div>
              </div>

            </Grid>
          </Paper>
        </Grid>
      </Grid>
      {viewEncounter && <ModalComponent open
        header={{
          title: `View Encounter`,
          closeIconAction: handleCloseViewEncounter,
        }}
        modalStyle={{ width: '100%' }}>
        <ViewEncounter modalCloseAction={handleCloseViewEncounter} encounterId={encounterToView} />
      </ModalComponent>
      }

      {showSignature?.show && <ModalComponent
        open={true}
        header={{
          title: 'Review & Sign',
          closeIconAction: closeSignature,
        }}
      >
        <Box>
          <CardContent>
            <Esignature error={signatureError} onChange={(value => {
              if (value) {
                setSignatureError(false);
              }
              setSignature(value)
            })} />
          </CardContent>
          <CardActions sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
            <LoadingButton label={"Submit"} onClick={() => onHandleSubmit()} />
          </CardActions>
        </Box>
      </ModalComponent>}


      {showSuperBill && <ModalComponent
        open={showSuperBill}
        header={{
          title: `Superbill- Coding (${getFullName(patientData)})`,
          closeIconAction: closeSuperBill,
        }}
        modalStyle={{ width: '100%' }}
        boxStyle={{ width: '90% !important', maxWidth: 'unset' }}
      >
        <SuperBillForm onClose={closeSuperBill} encounterType={encounterType} patientEncounter={patientEncounter} patientId={patientId} encounterId={myEnouterId} patientEncounterBillingData={patientEncounterBillingData} callPatientEncounterBillingAPI={callPatientEncounterBillingAPI} />
      </ModalComponent>}
    </Container>
  );
};

export default CreateEncounters;
