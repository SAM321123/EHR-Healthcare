/* eslint-disable react/no-danger */
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import PageHeader from 'src/components/PageHeader';
import useCRUD from 'src/hooks/useCRUD';
import { getDirtyFieldsValue, showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Events from 'src/lib/events';
import SettingsIcon from '@mui/icons-material/Settings';
import './index.css';

const { requiredField, successMessage } = require('src/lib/constants');

const showSignatureLabel = (data) => {
  if (data?.enablePatientSignature) {
    return { hide: false };
  }
  return { hide: true };
};

const emailTemplateFormGroups = [
  {
    inputType: 'checkBox',
    name: 'enablePatientSignature',
    label: 'Enable Patient Signature',
    colSpan: 1,
  },
  {
    inputType: 'text',
    name: 'signatureLabel',
    textLabel: 'Signature Label',
    description: 'If empty ,e-signature will be shown as label on signature pad',
    colSpan: 1,
    dependencies: {
      keys: ['enablePatientSignature'],
      calc: showSignatureLabel,
    },
  },
  {
    inputType: 'checkBox',
    name: 'enablePractitionerSignature',
    label: 'Enable Practitioner Signature',
    colSpan: 1,
  },
  // {
  //   inputType: 'checkBox',
  //   name: 'enableAssistantSignature',
  //   label: 'Enable Assistant Signature',
  //   colSpan: 1,
  // },
  {
    inputType: 'checkBox',
    name: 'makeSignatureOptional',
    label: 'Make Signature Optional',
    colSpan: 1,
  },

  {
    inputType: 'editor',
    name: 'consentForm',
    gridProps: { md: 12, maxWidth: '100vw' },
    required: requiredField,
    colSpan: 2,
    showInputField: true,
  },
];

const ConsentForm = ({
  selectedFormConfig,
  setSelectedFormConfig,
  onSettingsClick,
  showBackIcon = true,
}) => {
  console.log("🚀 ~ selectedFormConfig:", selectedFormConfig)
  const [preview, setPreview] = useState('');

  const type = selectedFormConfig?.formType?.code || '';

  const [apiResponse, , loading, apiHandler, clear] = useCRUD({
    id: 'ConsentFormSubmit',
    type: REQUEST_METHOD.update,
    url: API_URL.saveForm,
  });
  const form = useForm({ mode: 'onChange' });
  const {
    handleSubmit,
    formState: { dirtyFields },
  } = form;

  const refetchFormList = useCRUD({
    id: `form-builder-list-${type}`,
    url: API_URL.getFormList,
    type: REQUEST_METHOD.get,
  })[3];

  useEffect(() => {
    if (apiResponse) {
      showSnackbar({
        severity: 'success',
        message: successMessage.update,
      });
      clear();
      Events.trigger(`REFRESH-TABLE-form-builder-list`);
      refetchFormList({ formType: type });
      setSelectedFormConfig({});
    }
  }, [apiResponse, clear, setSelectedFormConfig]);
  const handleSaveAccountDetails = useCallback(
    (data) => {
      const payload = getDirtyFieldsValue(data, dirtyFields);

      apiHandler(payload, `/${selectedFormConfig.id}`);
    },
    [apiHandler, dirtyFields, selectedFormConfig.id]
  );

  const handleRenderOutput = (data) => {
    // Convert the HTML string to a DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data;

    // Find and replace instances of the specific span elements
    const spanElements = tempDiv.querySelectorAll(
      '.consent-checkbox-container, .consent-input-container'
    );
    spanElements.forEach((spanElement) => {
      const inputElement = document.createElement('input');
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

    // Return the modified HTML content
    return tempDiv.innerHTML;
  };

  const handlePreview = () => {
    setPreview(form?.getValues('consentForm'));
  };
  const onClose = useCallback(() => {
    setSelectedFormConfig({});
  }, [setSelectedFormConfig]);

  const defaultValue = useMemo(()=>{
    const res= {};
    emailTemplateFormGroups.forEach(item=>{
      if(selectedFormConfig[item.name]){
      res[item.name]= selectedFormConfig[item.name]
      }
      })
      return res;
      },[selectedFormConfig]);

  return (
    <>
      <PageHeader
        title={selectedFormConfig?.name}
        showBackIcon={showBackIcon}
        onPressBackIcon={onClose}
        rightContent={[
          {
            render: (
              <SettingsIcon
                sx={{
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer  ',
                }}
                onClick={onSettingsClick}
              />
            ),
          },
        ]}
      />
      <Box sx={{ backgroundColor: '#fff', padding: 2 }}>
        <CustomForm
          formGroups={emailTemplateFormGroups}
          columnsPerRow={2}
          defaultValue={selectedFormConfig}
          form={form}
        />
        <Box
          sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 5 }}
        >
          <LoadingButton onClick={handlePreview} label="Preview" />
          <LoadingButton
            onClick={handleSubmit(handleSaveAccountDetails)}
            loading={loading}
            label="Save"
          />
        </Box>
      </Box>
      <Box>
        {preview && (
          <Box sx={{ backgroundColor: '#fff', padding: 2, mt: 10 }}>
            <Typography variant="h6" sx={{ mb: 4, mt: 2 }}>
              Consent Form Preview
            </Typography>
            <Box
              sx={{ paddingLeft: 3, paddingRight: 3 }}
              dangerouslySetInnerHTML={{
                __html: handleRenderOutput(preview),
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default ConsentForm;
