import {
  Card,
  CardActions,
  CardContent,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { formStatus, roleTypes } from 'src/lib/constants';

import LoadingButton from 'src/components/CustomButton/loadingButton';
import ConsentFormPreview from 'src/pages/PatientPortal/Forms/consentFormRender';
import palette from 'src/theme/palette';
import { useMemo } from 'react';

const ConsentFormRenderer = ({
  patientFormResponse,
  handleConsentFormNavigation,
  userRole,
}) => {
  const isConsentFormSubmissionPending = useMemo(() => {
    if (userRole === roleTypes.patient) {
      return patientFormResponse?.linkedPatientForms?.some(
        (form) => form.status !== formStatus.COMPLETE
      );
    }
    if (userRole === roleTypes.clinicAdmin) {
      return true;
    }
    return patientFormResponse?.linkedPatientForms?.some(
      (form) =>
        form.status === formStatus.SENT ||
        (form.status === formStatus.COMPLETE &&
          ((roleTypes.assistant === userRole &&
            form?.hasPendingAssistantSignature) ||
            (roleTypes.practitioner === userRole &&
              form?.hasPendingPractitionerSignature)))
    );
  }, [patientFormResponse?.linkedPatientForms, userRole]);

  if (
    isConsentFormSubmissionPending &&
    patientFormResponse?.linkedPatientForms?.length
  ) {
    return (
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent style={{ padding: '16px' }}>
          <Typography variant="h7">
            Please complete the below documents.
          </Typography>
        </CardContent>
        <Divider />
        {patientFormResponse?.linkedPatientForms?.map((consentForm) => (
          <CardActions
            style={{ justifyContent: 'space-between' }}
            key={consentForm?.id}
          >
            <CardContent
              style={{
                padding: 'unset',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {consentForm.status === 'Complete' && (
                <CheckIcon
                  style={{
                    color: palette.success.main,
                    fontSize: '16px',
                  }}
                />
              )}
              <Link
                component="button"
                variant="h8"
                sx={{ m: '0px 10px' }}
                onClick={() => handleConsentFormNavigation(consentForm)}
              >
                {consentForm?.formData?.name}
              </Link>
            </CardContent>
            {consentForm.status === formStatus.COMPLETE &&
              ((roleTypes.practitioner === userRole &&
                consentForm?.hasPendingPractitionerSignature) ||
                (roleTypes.assistant === userRole &&
                  consentForm?.hasPendingAssistantSignature)) && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  label="Review & Sign ->"
                  style={{ fontSize: '12px', fontWeight: 300 }}
                  onClick={() => handleConsentFormNavigation(consentForm)}
                />
              )}
            {consentForm.status !== formStatus.COMPLETE &&
              userRole === roleTypes.patient && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  label="Read & Sign ->"
                  style={{ fontSize: '12px', fontWeight: 300 }}
                  onClick={() => handleConsentFormNavigation(consentForm)}
                />
              )}
          </CardActions>
        ))}
      </Card>
    );
  }
  return (
    <div>
      {!isConsentFormSubmissionPending &&
        patientFormResponse?.linkedPatientForms?.map((consentForm) => (
          <Card
            key={consentForm.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '16px',
            }}
          >
            <CardContent>
              <ConsentFormPreview
                showBackAction={false}
                consentId={consentForm?.id}
              />
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default ConsentFormRenderer;
