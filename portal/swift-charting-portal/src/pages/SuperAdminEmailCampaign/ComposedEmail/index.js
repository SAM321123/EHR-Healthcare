import React, { useCallback, useState } from 'react';
import { initialFormState } from 'src/pages/BookingSetting/EmailTemplate/defaultValues';
import EmailComposedForm from 'src/pages/BookingSetting/EmailComposed/EmailTemplateForm';
import EmailComposedTable from 'src/pages/BookingSetting/EmailComposed/EmailTemplateTable';

const ComposedEmail = () => {
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
        <EmailComposedForm formState={formState} closeForm={closeForm} />
      )}
      <EmailComposedTable
        formState={formState}
        setFormState={setFormState}
        openForm={openForm}
      />
    </>
  );
};
export default ComposedEmail;
