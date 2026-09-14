// import React, { useCallback, useState } from 'react';
// import { initialFormState } from 'src/pages/BookingSetting/EmailTemplate/defaultValues';
// // import EmailTemplateForm from 'src/pages/BookingSetting/EmailTemplate/EmailTemplateForm';
// // import EmailTemplateTable from 'src/pages/BookingSetting/EmailTemplate/EmailTemplateTable';
// import EmailTemplateForm from './emailTemplateForm';
// import EmailTemplateTable from './emailTemplateTable';

import { useCallback, useState } from 'react';
import { initialFormState } from 'src/pages/BookingSetting/EmailTemplate/defaultValues';
import EmailTemplateForm from './emailTemplateForm';
import EmailTemplateTable from './emailTemplateTable';

const EmailTemplate = () => {
  const [formState, setFormState] = useState(initialFormState);

  const openForm = useCallback(
    (props = {}) => {
      setFormState({ ...initialFormState, open: true, ...props });
    },
    [setFormState]
  );

  const closeForm = useCallback(() => {
    setFormState(initialFormState);
  }, [setFormState]);

  return (
    <>
      {formState.open && (
        <EmailTemplateForm formState={formState} closeForm={closeForm} />
      )}
      <EmailTemplateTable
        formState={formState}
        setFormState={setFormState}
        openForm={openForm}
      />
    </>
  );
};
export default EmailTemplate;
