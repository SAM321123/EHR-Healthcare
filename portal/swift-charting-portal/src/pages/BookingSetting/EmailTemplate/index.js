import React, { useCallback, useState } from 'react';
import EmailTemplateTable from './EmailTemplateTable';
import { initialFormState } from './defaultValues';
import EmailTemplateForm from './EmailTemplateForm';

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
