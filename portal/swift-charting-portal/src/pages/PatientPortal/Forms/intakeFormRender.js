import { useCallback } from 'react';

import { generatePath, useNavigate, useParams } from 'react-router-dom';
import FormRenderer from 'src/pages/Patient/components/Form/formRenderer';
import { UI_ROUTES } from 'src/lib/routeConstants';
import Events from 'src/lib/events';

const IntakeFormRender = ({ publicAccess = false } = {}) => {
  const navigate = useNavigate();
  const params = useParams();

  const onBackIconClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleConsentFormNavigation = useCallback(
    (data) => {
      Events.trigger('set-form-preview-data-in-redux');
      navigate(
        generatePath(UI_ROUTES.viewConsentForm, {
          ...params,
          consentId: data?.id,
        })
      );
    },
    [navigate, params]
  );

  return (
    <FormRenderer
      onPressBackIcon={onBackIconClick}
      handleConsentFormViewNavigation={handleConsentFormNavigation}
      publicAccess={publicAccess}
    />
  );
};

export default IntakeFormRender;
