/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import isEmpty from 'lodash/isEmpty';
import { useNavigate } from 'react-router-dom';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import {
  convertWithTimezone,
  decodeHtml,
  getUserRole,
  showSnackbar,
} from 'src/lib/utils';
import { dateFormats, formStatus, roleTypes } from 'src/lib/constants';
import useAuthUser from 'src/hooks/useAuthUser';
import capitalize from 'lodash/capitalize';
import Events from 'src/lib/events';
import Loader from 'src/components/Loader';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import ActionButton from 'src/components/ActionButton';
import ConsentSignature from './ConsentSignature';

const ConsentFormRender = ({ formId, formSubmitRef, showSubmitButton, publicAccess = false }) => {
  const [patientForm, setPatientForm] = useState({});
  const [signature, setSignature] = useState('');
  const [userInfo] = useAuthUser();
  const navigate = useNavigate();
  const signatureRef = useRef();
  const storedUserRole = getUserRole();
  const userRole = publicAccess
    ? (userInfo?.id ? (storedUserRole || roleTypes.patient) : roleTypes.patient)
    : storedUserRole;
  const [apiResponse, , fetchLoading, apiHandler, clearPatientFormResponse] =
    useCRUD({
      id: `get-patient-form-${formId}`,
      type: REQUEST_METHOD.get,
      url: `${publicAccess ? API_URL.getPublicPatientFormById : API_URL.sharedFormList}/${formId}`,
    });

  const [submitFormResponse, , , submitForm, clearSubmitForm] = useCRUD({
    id: 'patient-form-submission',
    type:
      patientForm?.patientFormSubmission?.status === formStatus.COMPLETE
        ? REQUEST_METHOD.update
        : REQUEST_METHOD.post,
    url: publicAccess ? API_URL.publicSavePatientForm : API_URL.savePatientForm,
  });
  const [, , , submitOnlyForm] = useCRUD({
    id: 'patient-form-only-submission',
    type: REQUEST_METHOD.post,
    url: publicAccess ? API_URL.publicSaveOnlyPatientForm : API_URL.savePatientForm,
  });

  const handleSaveOnlyForm = useCallback(() => {
    const submittedBy = userInfo?.id || (publicAccess ? patientForm?.patient?.id : undefined);

    if (!submittedBy || !patientForm?.id) {
      return;
    }

    const formDomHTML = document.getElementById(
      `patientConsetFormContainer${formId}`
    ).innerHTML;
    const payload = {
      submittedBy,
      submittedByRole: userRole,
    };
    submitOnlyForm({
      data: {
        ...payload,
        signature,
        response: formDomHTML,
        patientFormId: patientForm.id,
      },
    });
  }, [formId, patientForm, publicAccess, submitOnlyForm, userInfo, userRole]);

  const handleRenderOutput = useCallback(
    (data, editable) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data;

      const spanElements = tempDiv.querySelectorAll(
        '.consent-checkbox-container, .consent-input-container'
      );

      spanElements.forEach((spanElement) => {
        const inputElement = document.createElement('input');
        inputElement.onchange = (e) => {
          e.target.setAttribute('value', e.target.value);
          e.target.setAttribute('checked', e.target.checked);
          handleSaveOnlyForm();
        };

        inputElement.setAttribute('required', true);
        !editable && inputElement.setAttribute('disabled', true);
        inputElement.setAttribute(
          'value',
          spanElement.getAttribute('value') || ''
        );
        spanElement.getAttribute('checked') &&
          inputElement.setAttribute(
            'checked',
            spanElement.getAttribute('checked')
          );

        const spanClass = spanElement.classList.contains(
          'consent-checkbox-container'
        )
          ? 'checkbox'
          : 'text';
        inputElement.type = spanClass;

        spanElement.classList.forEach((cls) => {
          inputElement.classList.add(cls);
        });
        spanElement.parentNode.replaceChild(inputElement, spanElement);
      });

      return Array.from(tempDiv.childNodes);
    },
    [handleSaveOnlyForm]
  );

  const isFormEditable = useCallback(
    (data) => {
      if (
        userRole === roleTypes.patient &&
        data.patientFormSubmission?.status !== formStatus.COMPLETE
      )
        return true;
      return false;
    },
    [userRole]
  );

  useEffect(() => {
    if (!isEmpty(patientForm)) {
      const decodedConsentForm = decodeHtml(
        patientForm?.patientFormSubmission?.partialResponse ||
          patientForm?.patientFormSubmission?.response ||
          patientForm?.formData?.consentForm ||
          ''
      );
      const editable = isFormEditable(patientForm);
      const processedForm = handleRenderOutput(decodedConsentForm, editable);
      const container = document.getElementById(
        `patientConsetFormContainer${formId}`
      );
      container.innerHTML = '';
      processedForm.forEach((node) => {
        container.appendChild(node);
      });
    }
  }, [patientForm, formId]);

  useEffect(() => {
    if (submitFormResponse) {
      clearSubmitForm(true);
      clearPatientFormResponse(true);
      Events.trigger(`REFRESH-TABLE-PATIENT_SHARED_FORMS_LIST`);
      showSnackbar({
        severity: 'success',
        message: `Submitted Successfully`,
      });
      navigate(-1);
    }
  }, [submitFormResponse]);

  useEffect(() => {
    if (!apiResponse && formId) {
      apiHandler();
    }
  }, [formId]);

  useEffect(() => {
    if (apiResponse) {
      setPatientForm(apiResponse);
    }
  }, [apiResponse]);

  const showSignaturePad = useMemo(() => {
    const actorUserId = userInfo?.id || (publicAccess ? patientForm?.patient?.id : undefined);

    const isPatient =
      userRole === roleTypes.patient &&
      patientForm?.patient?.id === actorUserId &&
      patientForm?.formData?.enablePatientSignature &&
      patientForm?.patientFormSubmission?.status !== formStatus.COMPLETE;
    const isAssistant =
      userRole === roleTypes.assistant &&
      patientForm?.patientFormSubmission?.status === formStatus.COMPLETE &&
      patientForm?.assistant?.id === actorUserId &&
      patientForm?.hasPendingAssistantSignature;
    const isPractitioner =
      userRole === roleTypes.practitioner &&
      patientForm?.patientFormSubmission?.status === formStatus.COMPLETE &&
      patientForm?.practitioner?.id === actorUserId &&
      patientForm?.hasPendingPractitionerSignature;

    return isPatient || isAssistant || isPractitioner;
  }, [patientForm, publicAccess, userInfo, userRole]);

  const isRoleSignatureEnabled = useCallback(
    (roleType) => {
      const signatureField = `${roleType}Signature`;

      console.log('submittedByRole === roles[roles]', userRole,  userRole === roleTypes[roleType])
      console.log(' patientFormData?.formData?.[`enable${capitalize(roles)}Signature`]', patientForm?.formData?.[`enable${capitalize(roleType)}Signature`])
      console.log(' !patientFormData?.patientFormSubmission?.[signatureField]',  !patientForm?.patientFormSubmission?.[signatureField])
      console.log('  patientFormData?.[roles]?.id === userInfo.id', userInfo?.id,    patientForm?.[roleType]?.id === (userInfo?.id || (publicAccess ? patientForm?.patient?.id : undefined)))

      return (
        userRole === roleTypes[roleType] &&
        patientForm?.formData?.[`enable${capitalize(roleType)}Signature`] &&
        !patientForm?.patientFormSubmission?.[signatureField] &&
        patientForm?.[roleType]?.id === (userInfo?.id || (publicAccess ? patientForm?.patient?.id : undefined))
      );
    },
    [patientForm, publicAccess, userInfo, userRole]
  );

  const isSignatureRequired = useMemo(() => {
    if (patientForm?.formData?.makeSignatureOptional) return false;

    const roleSignatureTypes = ['patient', 'practitioner'];
    return roleSignatureTypes.some((roleType) =>
      isRoleSignatureEnabled(roleType)
    );
  }, [isRoleSignatureEnabled, patientForm]);
  
  console.log('is role sd', isSignatureRequired)
  const formSubmit = (e) => {
    e.preventDefault();
    const submittedBy = userInfo?.id || (publicAccess ? patientForm?.patient?.id : undefined);

    if (!submittedBy || !patientForm?.id) {
      return false;
    }

    const formDomHTML = document.getElementById(
      `patientConsetFormContainer${formId}`
    ).innerHTML;

    if (isSignatureRequired && !signature) {
      showSnackbar({
        severity: 'error',
        message: `Signature Required`,
      });
      if (signatureRef.current) {
        signatureRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return false;
    }

    const payload = {
      ...(signature ? { signature } : {}),
      submittedBy,
      submittedByRole: userRole,
    };

    if (patientForm?.patientFormSubmission?.status === formStatus.COMPLETE) {
      submitForm(payload, `/${patientForm.patientFormSubmission?.id}`);
    } else {
      submitForm({
        data: {
          ...payload,
          signature,
          response: formDomHTML,
          patientFormId: patientForm.id,
          isPosted: true,
        },
      });
    }
  };

  const RenderSignature = useCallback(
    ({ signatureType, name }) => {
      if (!patientForm?.patientFormSubmission?.[signatureType]?.signature)
        return null;

      let roleName = '';
      const { firstName, lastName } = patientForm[name] || {};
      roleName = `${firstName} ${lastName}`;
      if (
        userRole === roleTypes[name] &&
        userInfo?.id === patientForm?.[name]?.id
      ) {
        roleName = `${roleName} (You)`;
      }
      return (
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: '-12px',
              left: '16px',
              backgroundColor: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              padding: '0 8px',
              borderRadius: '4px',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            {`${capitalize(name)}'s Signature ${name === 'patient' ? ` (${patientForm.formData.signatureLabel})` : ''}`}
          </Typography>

          <img
            src={patientForm?.patientFormSubmission?.[signatureType]?.signature}
            alt={`${name}'s Signature`}
            style={{
              maxWidth: '100%',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'baseline',
              marginTop: '8px',
            }}
          >
            <Typography sx={{ marginRight: '4px' }} variant="body2">
              {`Signed By : ${roleName}`}
            </Typography>
            <Typography sx={{ marginRight: '4px' }} variant="body2">
              {`Signed At : ${convertWithTimezone(
                patientForm?.patientFormSubmission?.[signatureType]?.date,
                {
                  format: dateFormats.MMMDDYYYYHHMMSS,
                }
              )}`}
            </Typography>
          </Box>
        </Box>
      );
    },
    [patientForm, userInfo?.id, userRole]
  );

  const signatureChange = (data) => {
    setSignature(data);
  };
  const isSignatureExist = useMemo(
    () =>
      patientForm?.patientFormSubmission?.status === formStatus.COMPLETE &&
      (patientForm?.patientFormSubmission?.patientSignature?.signature ||
        patientForm?.patientFormSubmission?.assistantSignature?.signature ||
        patientForm?.patientFormSubmission?.practitionerSignature?.signature),
    [patientForm]
  );
  return (
    <>
      <Loader loading={fetchLoading} />
      <form onSubmit={formSubmit}>
        <Box sx={{ padding: 5 }} id={`patientConsetFormContainer${formId}`} />
        {isSignatureExist && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', marginBottom: '16px' }}
              >
                Signatures
              </Typography>
              <RenderSignature
                signatureType="patientSignature"
                name="patient"
              />
              <RenderSignature
                signatureType="practitionerSignature"
                name="practitioner"
              />
            </Box>
          </Box>
        )}
        {showSignaturePad && (
          <Box
            ref={signatureRef}
            sx={{
              border: '1px dashed #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <ConsentSignature
              onChange={signatureChange}
              defaultValue={
                (userRole === roleTypes.patient &&
                  patientForm?.patientFormSubmission?.patientSignature
                    ?.signature) ||
                (userRole === roleTypes.assistant &&
                  patientForm?.patientFormSubmission?.assistantSignature
                    ?.signature) ||
                (userRole === roleTypes.practitioner &&
                  patientForm?.patientFormSubmission?.practitionerSignature
                    ?.signature)
              }
              label={(userRole=== roleTypes.patient && patientForm.formData.signatureLabel)}
            />
          </Box>
        )}
        {showSubmitButton && (
          <ActionButton
            type="submit"
            ref={formSubmitRef}
            sx={{ marginTop: '16px', float: 'right' }}
          >
            Submit
          </ActionButton>
        )}
      </form>
    </>
  );
};

export default ConsentFormRender;
