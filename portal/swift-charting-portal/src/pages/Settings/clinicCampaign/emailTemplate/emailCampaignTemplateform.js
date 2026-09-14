import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import {
  inputLength,
  regEmail,
  regexCommonText,
  requiredField,
} from 'src/lib/constants';
import { errorMessage } from 'src/lib/errorConstants';
import { getDirtyFieldsValue, showSnackbar } from 'src/lib/utils';
import CardContent from '@mui/material/CardContent';

import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import { successMessage } from 'src/lib/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { Box, CardActions, Chip, Typography } from '@mui/material';
import {
  emailCampaignTemplateDropDownOptions,
  emailCampaignTemplateTokens,
} from './defaultValues';

const mergeTagGroups = emailCampaignTemplateTokens.reduce((acc, item) => {
  const existingGroup = acc.find((group) => group.title === item.group);

  if (existingGroup) {
    existingGroup.tokens.push(item);
    return acc;
  }

  acc.push({
    title: item.group,
    tokens: [item],
  });
  return acc;
}, []);

export default function EmailCampaignTemplateForm({ modalCloseAction, refetchData, defaultData }) {

  const form = useForm({ mode: 'onChange' });
  const {
    handleSubmit,
    setError,
    formState: { dirtyFields },
  } = form;
  const planEditorRef = useRef(null);
  const templateId = defaultData?.id;

  const [apiResponse, , loading, apiHandler, clearData] = useCRUD({
    id: 'EmailCampaignTemplateForm',
    url: API_URL.emailCampaignTemplate,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const getPlanEditor = (editor) => {
    planEditorRef.current = editor;
  };

  const emailTemplateFormGroups = useMemo(
    () => [
      {
        inputType: 'text',
        name: 'name',
        textLabel: 'Name',
        required: requiredField,
        placeholder: 'Template name',
        maxLength: { ...inputLength.commonTextLength },
        pattern: {
          value: regexCommonText.value,
          message: `Name ${regexCommonText.message}`,
        },
      },
      {
        inputType: 'text',
        type: 'email',
        name: 'replyTo',
        textLabel: 'Reply To',
        required: requiredField,
        pattern: regEmail,
        maxLength: { ...inputLength.email },
        colSpan: 1
      },
      {
        inputType: 'text',
        name: 'subject',
        textLabel: 'Email Subject',
        required: requiredField,
        colSpan: 2,
        placeholder: 'Use keys like [patientName] or [clinicName]',
        maxLength: { ...inputLength.commonTextLength },
        pattern: {},
      },
      {
        component: () => (
          <Box
            sx={{
              border: '1px solid #E6E9F0',
              borderRadius: '8px',
              padding: '12px 14px',
              backgroundColor: '#FAFBFC',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Available merge tags
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Use these keys in the subject or email body. Example: `[patientName]`
            </Typography>
            {mergeTagGroups.map((group) => (
              <Box key={group.title} sx={{ mb: group.title === 'Clinic' ? 0 : 1.5 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
                  {group.title}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {group.tokens.map((token) => (
                    <Chip
                      key={token.token}
                      size="small"
                      variant="outlined"
                      label={`[${token.token}]`}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        ),
        colSpan: 2,
      },
      {
        inputType: 'editor',
        name: 'template',
        gridProps: { md: 12, width: '100%' },
        required: requiredField,
        dropDownOptions: emailCampaignTemplateDropDownOptions,
        colSpan: 2,
        getEditorOnReady: getPlanEditor,
      },
    ],
    []
  );



  useEffect(() => {
    if (!isEmpty(apiResponse)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [apiResponse, clearData]);

  const onHandleSubmit = useCallback(
    (data) => {
      let payload = { ...data };

      if (!payload.template) {
        setError('template', true);
        return;
      }

      if (templateId) {
        payload = getDirtyFieldsValue(payload, dirtyFields);

        if (isEmpty(payload)) {
          showSnackbar({
            severity: 'error',
            message: errorMessage.NO_CHANGES,
          });
          return;
        }
        apiHandler(payload, `/${templateId}`);
      } else {
        apiHandler({ data: payload });
      }
    },
    [apiHandler, setError, templateId, dirtyFields]
  );

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={emailTemplateFormGroups}
          columnsPerRow={2}
          defaultValue={defaultData}
          form={form}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
    </Box>
  );
}
