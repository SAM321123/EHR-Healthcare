import { CardContent } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import {
  inputLength,
  regexCustomText,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';

const FormConfiguration = ({
  isFormVisible,
  handleFormVisibility,
  selectedFormConfig,
  setSelectedFormConfig,
  selectedFormType,
  selectedCategory,
  isConfigAddForm,
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const consentFormsParser = useCallback((consentFormsData) => {
    if (consentFormsData) {
      return consentFormsData?.results?.filter(
        (item) => item?.formType?.code === 'FT_CONSENT_FORMS'
      );
    }
    return [];
  }, []);

  const formConfigDefaultValues = useMemo(() => {
    if (selectedFormConfig) {
      return {
        name: selectedFormConfig?.name,
        formCategoryCode:
          selectedFormConfig?.formCategory?.code ||
          selectedFormConfig?.formCategoryCode,
        formTypeCode:
          selectedFormConfig?.formType?.code ||
          selectedFormConfig?.formTypeCode,
        linkedConsentForms: selectedFormConfig?.linkedConsentForms?.map(
          (item) => item.id
        ),
        encounterTypeCode: selectedFormConfig?.encounterTypes?.map(
          (item) => item.id
        ),
      };
    }
    return {};
  }, [selectedFormConfig]);

  const [
    saveFormTypeResponse,
    ,
    saveFormLoading,
    saveForm,
    clearFormTypeResponse,
  ] = useCRUD({
    id: 'save-form-type',
    url: selectedFormConfig?.id
      ? `${API_URL.saveForm}/${selectedFormConfig?.id}`
      : API_URL.saveForm,
    type: selectedFormConfig?.id ? REQUEST_METHOD.update : REQUEST_METHOD.post,
  });

  const formConfigurationGroups = useMemo(() => {
    const formGroups = [
      {
        inputType: 'text',
        name: 'name',
        textLabel: 'Name',
        required: requiredField,
        placeholder: 'Form Name',
        maxLength: { ...inputLength.commonTextLength },
        pattern: regexCustomText,
      },
    ];
    if (
      selectedFormType === 'FT_QUESTIONNAIRES' ||
      selectedFormConfig?.formType === 'FT_QUESTIONNAIRES'
    ) {
      return [
        ...formGroups,
        {
          ...WiredMasterField({
            name: 'linkedConsentForms',
            label: 'Link Consent Form',
            url: API_URL.getFormList,
            cache: false,
            filter: {
              limit: 300,
              isActive: true,
              formType: 'FT_CONSENT_FORMS',
            },
            accessor: consentFormsParser,
            labelAccessor: 'name',
            valueAccessor: 'id',
            multiple: true,
            addOnFilterKey: 'forms',
            placeholder: 'Select',
          }),
        },
      ];
    }
    if (
      selectedFormType === 'FT_ENCOUNTER_TEMPLATES' ||
      selectedFormConfig?.formType === 'FT_ENCOUNTER_TEMPLATES'
    ) {
      return [
        ...formGroups,
        {
          ...WiredMasterField({
            code: 'encounter_types_code',
            filter: { limit: 100 },
            name: 'encounterTypeCode',
            label: 'Linked Encounter Types',
            labelAccessor: 'name',
            valueAccessor: 'id',
            placeholder: 'Select',
            required: requiredField,
            multiple: true,
          }),
        },
      ];
    }
    return formGroups;
  }, [selectedFormType, consentFormsParser]);

  useEffect(() => {
    if (saveFormTypeResponse) {
      if (isConfigAddForm) {
        setSelectedFormConfig(saveFormTypeResponse);
      } else if (!isConfigAddForm) {
        setSelectedFormConfig({});
      }
      showSnackbar({
        message: selectedFormConfig?.id
          ? successMessage.update
          : successMessage.create,
        severity: 'success',
      });
      clearFormTypeResponse();
      handleFormVisibility(saveFormTypeResponse);
    }
  }, [saveFormTypeResponse, isConfigAddForm]);

  const handleSaveFormConfiguration = useCallback(
    (data) => {
      const payload = {
        ...data,
        formCategoryCode: selectedCategory?.code,
        formTypeCode: selectedFormType,
      };
      if (selectedFormConfig?.id) {
        saveForm(payload);
      } else {
        saveForm({
          data: payload,
        });
      }
    },
    [saveForm, selectedCategory, selectedFormConfig, selectedFormType]
  );

  const header = useMemo(() => {
    const result = {};
    if (
      selectedFormType === 'FT_QUESTIONNAIRES' ||
      selectedFormConfig?.formTypeCode === 'FT_QUESTIONNAIRES'
    ) {
      result.title = selectedFormConfig?.id
        ? 'Edit Questionnaires Form'
        : 'Add Questionnaires Form';
    } else if (
      selectedFormType === 'FT_CONSENT_FORMS' ||
      selectedFormConfig?.formTypeCode === 'FT_CONSENT_FORMS'
    ) {
      result.title = selectedFormConfig?.id
        ? 'Edit Consent Form'
        : 'Add Consent Form';
    } else if (
      selectedFormType === 'FT_ENCOUNTER_TEMPLATES' ||
      selectedFormConfig?.formTypeCode === 'FT_ENCOUNTER_TEMPLATES'
    ) {
      result.title = selectedFormConfig?.id
        ? 'Edit Encounter Form'
        : 'Add Encounter Form';
    } else {
      result.title = selectedFormConfig?.id
        ? 'Edit Note Template Form'
        : 'Add Note Template Form';
    }
    return result;
  }, [selectedFormConfig, selectedFormType]);

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Cancel',
          variant: 'text',
          action: handleFormVisibility,
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Save',
          disabled: saveFormLoading,
          action: handleSubmit(handleSaveFormConfiguration),
          style: { marginRight: 16 },
        },
      ],
    }),
    [
      handleFormVisibility,
      handleSaveFormConfiguration,
      handleSubmit,
      saveFormLoading,
    ]
  );

  return (
    <Modal
      open={isFormVisible}
      onClose={handleFormVisibility}
      header={header}
      footer={footer}
    >
      <Container loading={saveFormLoading}>
        <CardContent>
          <CustomForm
            form={form}
            formGroups={formConfigurationGroups}
            columnsPerRow={1}
            defaultValue={formConfigDefaultValues}
          />
        </CardContent>
      </Container>
    </Modal>
  );
};

export default FormConfiguration;
