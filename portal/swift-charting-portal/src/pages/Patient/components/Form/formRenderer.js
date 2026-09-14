/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import debounce from 'lodash/debounce';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';
import capitalize from 'lodash/capitalize';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import Box from 'src/components/Box';
import PageHeader from 'src/components/PageHeader';

import { UI_ROUTES } from 'src/lib/routeConstants';
import { formStatus, roleTypes, successMessage } from 'src/lib/constants';
import { getUserRole, showSnackbar } from 'src/lib/utils';

import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';

import ConsentFormRender from 'src/pages/FormBuilder/ConsentForm/ConsentFormRender';
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview';
import ConsentFormViewsRenderer from './consentFormRenderer';
import ViewFormData from './ViewFormData';
import './previewForm.scss';
import { decrypt } from 'src/lib/encryption';

const FormPreview = ({ onPressBackIcon, handleConsentFormViewNavigation, publicAccess = false }) => {
  const form = useForm({});
  const formSubmitRef = useRef();
  const params = useParams();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [formGroups, setFormGroups] = useState([]);
  const [userInfo] = useAuthUser();
  const storedUserRole = getUserRole();
  const userRole = publicAccess
    ? (userInfo?.id ? (storedUserRole || roleTypes.patient) : roleTypes.patient)
    : storedUserRole;
  let patientId= params?.patientId || userInfo?.id;
  if(params.patientId){
    patientId = decrypt(patientId);
  }
  const [fetchedPatientData] = usePatientDetail({
    patientId,
  });

  const { watch } = form;
  
  const [
    patientFormResponse,
    ,
    patientFormLoading,
    getPatientFormById,
    clearPatientFormResponse,
  ] = useCRUD({
    id: `get-patient-form-${params.formId}`,
    url: publicAccess ? API_URL.getPublicPatientFormById : API_URL.getPatientFormById,
    type: REQUEST_METHOD.get,
  });

  const [saveFormResponse, , , saveForm, clearFormSubmission] = useCRUD({
    id: 'save-patient-form',
    url: publicAccess ? API_URL.publicSavePatientForm : API_URL.savePatientForm,
    type: REQUEST_METHOD.post,
  });

  const [, , , saveOnlyForm] = useCRUD({
    id: 'save-only-patient-form',
    url: publicAccess ? API_URL.publicSaveOnlyPatientForm : API_URL.saveOnlyPatientForm,
    type: REQUEST_METHOD.post,
  });

  const patientData = publicAccess
    ? (patientFormResponse?.patient || fetchedPatientData)
    : fetchedPatientData;

  const handleSaveOnlyForm = useCallback(
    debounce(() => {
      const submittedBy = userInfo?.id || (publicAccess ? patientFormResponse?.patient?.id : undefined);

      if (!submittedBy || !patientFormResponse?.id) {
        return;
      }

      saveOnlyForm({
        data: {
          response: JSON.stringify(form.getValues()),
          patientFormId: patientFormResponse?.id,
          submittedByRole: userRole,
          submittedBy,
        },
      });
    }, 1000),
    [form, patientFormResponse, publicAccess, userRole, userInfo, saveOnlyForm]
  );

  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type === 'change') {
        if (!isEmpty(value)) {
          handleSaveOnlyForm();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [handleSaveOnlyForm, watch]);

  useEffect(() => {
    if (params?.formId) {
      getPatientFormById({}, `/${params.formId}`);
    }
    return () => {
      clearPatientFormResponse(true);
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(patientFormResponse) && patientFormResponse?.formData) {
      setRules(JSON.parse(patientFormResponse?.formData?.rules || '[]'));
      setFormGroups(
        JSON.parse(patientFormResponse?.formData?.questions || '[]')
      );
    }
  }, [patientFormResponse]);

  const selectedFormType = patientFormResponse?.formData?.formType?.code;

  const setProfileMappedValues = useCallback(() => {
    const sections = JSON.parse(
      patientFormResponse?.formData?.questions || '[]'
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
  }, [form, patientData, patientFormResponse?.formData?.questions]);

  const defaultSubmissionValue = useMemo(() => {
    if (
      patientFormResponse?.patientFormSubmission &&
      selectedFormType !== 'FT_CONSENT_FORMS'
    ) {
      return JSON.parse(
        patientFormResponse?.patientFormSubmission?.partialResponse ||
          patientFormResponse?.patientFormSubmission?.response ||
          '{}'
      );
    }
    if (
      patientFormResponse &&
      patientData &&
      selectedFormType !== 'FT_CONSENT_FORMS'
    ) {
      setProfileMappedValues();
    }

    return {};
  }, [
    setProfileMappedValues,
    patientData,
    patientFormResponse,
    selectedFormType,
  ]);

  useEffect(() => {
    if (saveFormResponse) {
      showSnackbar({ message: successMessage.create, severity: 'success' });
      clearFormSubmission();
      navigate(-1);
    }
  }, [saveFormResponse]);

  const onSubmit = useCallback(
    (data) => {
      const submittedBy = userInfo?.id || (publicAccess ? patientFormResponse?.patient?.id : undefined);

      if (!submittedBy || !patientFormResponse?.id) {
        return;
      }

      const formData = { ...data };
      let tags;
      if (data?.tags) {
        tags = data.tags?.map((tag) => tag.code);
        delete formData.tags;
      }
      saveForm({
        data: {
          response: JSON.stringify(formData),
          patientFormId: patientFormResponse?.id,
          submittedByRole: userRole,
          submittedBy,
          tags,
          isPosted: true,
        },
      });
    },
    [patientFormResponse?.id, publicAccess, saveForm, userInfo?.id, userRole]
  );

  const handleConsentSubmit = () => {
    if (formSubmitRef.current) formSubmitRef.current.click();
  };

  const getIntakeFormMode = useCallback(() => {
    if (
      ![
        roleTypes.practitioner,
        roleTypes.assistant,
        roleTypes.patient,
      ].includes(userRole)
    ) {
      return false;
    }
    if (
      patientFormResponse?.patientFormSubmission?.status === formStatus.COMPLETE
    ) {
      return false;
    }
    if (
      selectedFormType === 'FT_QUESTIONNAIRES' &&
      userRole === 'patient' &&
      patientFormResponse?.status !== formStatus.COMPLETE
    ) {
      return true;
    }
    if (
      selectedFormType === 'FT_NOTE_TEMPLATES' &&
      (patientFormResponse?.status === formStatus.SENT || patientFormResponse?.status === formStatus.PARTIAL) &&
      userRole !== 'patient' && userInfo?.id===patientFormResponse?.practitioner?.id
    ) {
      return true;
    }
    return false;
  }, [patientFormResponse, userRole, selectedFormType,userInfo]);

  const showSubmitButton = useMemo(() => {
    const actorUserId = userInfo?.id || (publicAccess ? patientFormResponse?.patient?.id : undefined);

    const isPatient =
      userRole === roleTypes.patient &&
      patientFormResponse?.patient?.id === actorUserId &&
      !patientFormResponse?.patientFormSubmission?.response;
    const isAssistant =
      userRole === roleTypes.assistant &&
      patientFormResponse?.patientFormSubmission?.response &&
      patientFormResponse?.assistant?.id === actorUserId &&
      patientFormResponse?.hasPendingAssistantSignature;
    const isPractitioner =
      userRole === roleTypes.practitioner &&
      patientFormResponse?.patientFormSubmission?.response &&
      patientFormResponse?.practitioner?.id === actorUserId &&
      patientFormResponse?.hasPendingPractitionerSignature;

    return isPatient || isAssistant || isPractitioner;
  }, [patientFormResponse, publicAccess, userInfo, userRole]);

  const isEditableForm =
  selectedFormType === 'FT_CONSENT_FORMS'
  ? showSubmitButton
  : getIntakeFormMode();
  
  console.log("🚀 ~ FormPreview ~ isEditableForm:", isEditableForm)
  const handleConsentFormNavigation = useCallback(
    (data) => {
      navigate(
        generatePath(UI_ROUTES.editPatientLinkedConsentForm, {
          ...params,
          consentId: data?.id,
        })
      );
    },
    [navigate, params]
  );

  if (patientFormLoading) {
    return null;
  }
  return (
    <>
      <PageHeader
        showBackIcon
        title={patientFormResponse?.formData?.name}
        onPressBackIcon={
          isFunction(onPressBackIcon) ? onPressBackIcon : () => navigate(-1)
        }
        rightContent={
          isEditableForm
            ? [
                {
                  type: 'action',
                  label: 'Submit',
                  onClick:
                    selectedFormType === 'FT_CONSENT_FORMS'
                      ? handleConsentSubmit
                      : form.handleSubmit(onSubmit),
                  style: { borderRadius: 8, fontSize: '1rem' },
                },
              ]
            : []
        }
      />
      {selectedFormType === 'FT_CONSENT_FORMS' ? (
        <ConsentFormRender
          formId={patientFormResponse.id}
          formSubmitRef={formSubmitRef}
          showSubmitButton={showSubmitButton}
          publicAccess={publicAccess}
        />
      ) : isEditableForm ? (
        <Box className="form-intake">
          <Box className={!isEditableForm && 'intake-form-disable '}>
            {(formGroups?.length > 0 || rules?.length > 0) && (
              <BuilderPreview
                form={form}
                rules={rules}
                formGroups={formGroups}
                setFormGroups={setFormGroups}
                defaultValue={defaultSubmissionValue}
                patient = {patientData}
              />
            )}
          </Box>
          <ConsentFormViewsRenderer
            patientFormResponse={patientFormResponse}
            handleConsentFormNavigation={
              handleConsentFormViewNavigation || handleConsentFormNavigation
            }
            userRole={userRole}
          />
        </Box>
      ) : (
        <Box>
          <ViewFormData
            questions={formGroups}
            rules={rules}
            answers={defaultSubmissionValue}
            patient = {patientData}
          />
          <ConsentFormViewsRenderer
            patientFormResponse={patientFormResponse}
            handleConsentFormNavigation={
              handleConsentFormViewNavigation || handleConsentFormNavigation
            }
            userRole={userRole}
          />
        </Box>
      )}
    </>
  );
};

export default FormPreview;
