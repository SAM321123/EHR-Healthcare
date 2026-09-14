import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import get from 'lodash/get';
import { Link } from '@mui/material';

import useCRUD from 'src/hooks/useCRUD';
import useAuthUser from 'src/hooks/useAuthUser';

import { getUserRole } from 'src/lib/utils';
import { formStatus, roleTypes } from 'src/lib/constants';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import PageHeader from 'src/components/PageHeader';
import ConsentFormRender from 'src/pages/FormBuilder/ConsentForm/ConsentFormRender';

const ConsentFormPreview = ({ consentId, showBackAction = true, publicAccess = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const parentFormData = get(location, 'state.parentForm', '');
  const formRef = useRef();
  const [userInfo] = useAuthUser();
  const storedUserRole = getUserRole();
  const userRole = publicAccess
    ? (userInfo?.id ? (storedUserRole || roleTypes.patient) : roleTypes.patient)
    : storedUserRole;

  const params = useParams();

  const consentFormId = params?.consentId || consentId;

  const [
    patientFormResponse,
    ,
    patientFormLoading,
    ,
    clearPatientFormResponse,
  ] = useCRUD({
    id: `get-patient-form-${consentFormId}`,
    url: publicAccess ? API_URL.getPublicPatientFormById : API_URL.getPatientFormById,
    type: REQUEST_METHOD.get,
  });

  useEffect(
    () => () => {
      clearPatientFormResponse(true);
    },
    []
  );

  const showSubmitButton = useMemo(() => {
    const actorUserId = userInfo?.id || (publicAccess ? patientFormResponse?.patient?.id : undefined);

    if (patientFormResponse) {
      const isPatient =
        userRole === roleTypes.patient &&
        patientFormResponse?.patient?.id === actorUserId &&
        patientFormResponse?.patientFormSubmission?.status !==
          formStatus.COMPLETE;
      const isAssistant =
        userRole === roleTypes.assistant &&
        patientFormResponse?.patientFormSubmission?.status ===
          formStatus.COMPLETE &&
        patientFormResponse?.assistant?.id === actorUserId &&
        patientFormResponse.formData.enableAssistantSignature &&
        !patientFormResponse?.patientFormSubmission?.assistantSignature;
      const isPractitioner =
        userRole === roleTypes.practitioner &&
        patientFormResponse?.patientFormSubmission?.status ===
          formStatus.COMPLETE &&
        patientFormResponse?.practitioner?.id === actorUserId &&
        patientFormResponse.formData.enablePractitionerSignature &&
        !patientFormResponse?.patientFormSubmission?.practitionerSignature;

      return isPatient || isAssistant || isPractitioner;
    }
    return false;
  }, [patientFormResponse, publicAccess, userInfo, userRole]);

  const handleConsentFormBackIcon = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleConsentSubmit = useCallback(() => {
    if (formRef.current) formRef.current.click();
  }, []);

  if (patientFormLoading) {
    return null;
  }

  return (
    <>
      <PageHeader
        showBackIcon={showBackAction}
        title={patientFormResponse?.formData?.name}
        onPressBackIcon={handleConsentFormBackIcon}
        rightContent={
          showSubmitButton
            ? [
                {
                  type: 'action',
                  label: 'Submit',
                  onClick: handleConsentSubmit,
                  style: { borderRadius: 8, fontSize: '1rem' },
                },
              ]
            : []
        }
      />
      <Link
        component="h8"
        sx={{ pl: '36px', cursor: 'pointer' }}
        onClick={handleConsentFormBackIcon}
      >
        {parentFormData}
      </Link>
      <ConsentFormRender
        formSubmitRef={formRef}
        showSubmitButton={showSubmitButton}
        formId={consentFormId}
        publicAccess={publicAccess}
      />
    </>
  );
};

export default ConsentFormPreview;
