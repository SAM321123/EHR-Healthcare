import { useState, useCallback, useEffect } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { successMessage } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import FormConfiguration from './configurationForm';

import NewForm from './NewForm';
import ConsentForm from './ConsentForm';

const EditFormConfig = ({ selectedFormConfig, setSelectedFormConfig }) => {
  const [isEditConfigModalVisible, setIsEditConfigModalVisibility] = useState();
  const type = selectedFormConfig?.formType?.code || '';

  const [updateFormTypeResponse, , , updateForm, clearFormTypeResponse] =
    useCRUD({
      id: 'update-form-type',
      url: API_URL.saveForm,
      type: REQUEST_METHOD.update,
    });



  useEffect(() => {
    if (updateFormTypeResponse) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      clearFormTypeResponse();
      setSelectedFormConfig(updateFormTypeResponse);
    }
  }, [updateFormTypeResponse, type]);

  const handleSubmitForm = useCallback(
    (formGroups, rules) => {
      updateForm(
        {
          name: selectedFormConfig?.name,
          formCategory: selectedFormConfig?.formCategory?.code,
          formType: selectedFormConfig?.formType?.code,
          questions: JSON.stringify(formGroups),
          rules: JSON.stringify(rules),
        },
        `/${selectedFormConfig?.id}`
      );
    },
    [
      selectedFormConfig?.formCategory?.code,
      selectedFormConfig?.formType?.code,
      selectedFormConfig?.id,
      selectedFormConfig?.name,
      updateForm,
    ]
  );

  const handleEditConfigModalVisibility = useCallback((savedForm) => {
    setIsEditConfigModalVisibility(!isEditConfigModalVisible);
    if (savedForm && savedForm.id) {
       setSelectedFormConfig(savedForm);
    }
  }, [isEditConfigModalVisible, setSelectedFormConfig]);

  return (
    <>
      {selectedFormConfig?.formType?.code === 'FT_CONSENT_FORMS' ||
      selectedFormConfig?.formType?.code === 'FT_CONSENT_FORMS' ? (
        <ConsentForm
          selectedFormConfig={selectedFormConfig}
          setSelectedFormConfig={setSelectedFormConfig}
          onSettingsClick={handleEditConfigModalVisibility}
        />
      ) : (
        <NewForm
          selectedFormConfig={selectedFormConfig}
          setSelectedFormConfig={setSelectedFormConfig}
          onFormSave={handleSubmitForm}
          onSettingsClick={handleEditConfigModalVisibility}
        />
      )}
      {isEditConfigModalVisible && (
        <FormConfiguration
          isFormVisible={isEditConfigModalVisible}
          handleFormVisibility={handleEditConfigModalVisibility}
          selectedFormConfig={selectedFormConfig}
          setSelectedFormConfig={setSelectedFormConfig}
          isConfigAddForm={false}
          selectedFormType={type}
        />
      )}
    </>
  );
};

export default EditFormConfig;
