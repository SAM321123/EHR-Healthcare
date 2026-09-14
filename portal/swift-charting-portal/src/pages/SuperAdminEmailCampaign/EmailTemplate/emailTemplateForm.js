import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import isEmpty from 'lodash/isEmpty';
import { useSelector } from 'react-redux';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL } from 'src/api/constants';
import Events from 'src/lib/events';
import {
  inputLength,
  regEmail,
  regexCommonText,
  requiredField,
  roleTypes,
} from 'src/lib/constants';
import { errorMessage } from 'src/lib/errorConstants';
import { getDirtyFieldsValue, getUserRole, showSnackbar } from 'src/lib/utils';
import CardContent from '@mui/material/CardContent';

import ModalComponent from 'src/components/modal';
import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';
import {
  EMAIL_TEMPLATE_DATA,
  SUPER_ADMIN_EMAIL_TEMPLATE_DATA,
} from 'src/store/types';
import palette from 'src/theme/palette';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import { successMessage } from 'src/lib/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useAuthenticatedUser from 'src/hooks/useAuthenticatedUser';
import FormsTable from 'src/pages/BookingSetting/EmailTemplate/FormsTable';
import { initialSuperadminTemplateTokens } from 'src/pages/BookingSetting/EmailTemplate/defaultValues';

export default function EmailTemplateForm(props) {
  const { formState, closeForm = () => {} } = props || {};

  const { open, defaultValue = {}, id: templateId, type } = formState;
  const planEditorRef = useRef(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedformType, setSelectedFormType] = useState(null);

  const templateTypeMasterData = useSelector((state) =>
    state?.crud
      ?.get('wired-select-emailTypeCode-email_type_code')
      ?.get('read')
      ?.get('data')
  );
  const authenticatedUser = useAuthenticatedUser();

  const [apiResponse, , loading, apiHandler, clear] = useCRUD({
    id: 'SuperAdminEmailTemplateForm',
    type,
    url: API_URL.adminEmailTemplate,
  });

  const getPlanEditor = (editor) => {
    planEditorRef.current = editor;
  };
  const handleForms = useCallback((formType) => {
    setSelectedFormType(formType);
    setShowFormModal(true);
  }, []);
  const closeFormModal = useCallback(() => {
    setShowFormModal(false);
    setSelectedFormType(null);
  }, []);
  const showAppointTypeField = (data) => {
    if (
      data.emailTypeCode &&
      (data.emailTypeCode === 'appointment_create' ||
        data.emailTypeCode === 'appointment_approved' ||
        data.emailTypeCode === 'appointment_reminder' ||
        data.emailTypeCode === 'appointment_recurring')
    ) {
      return { hide: false };
    }
    return { hide: true };
  };
  const showForms = (data) => {
    if (
      data.emailTypeCode &&
      (data.emailTypeCode === 'appointment_create' ||
        data.emailTypeCode === 'appointment_recurring' ||
        data.emailTypeCode === 'patient_create')
    ) {
      return { hide: false };
    }
    return { hide: true };
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
      // {
      //   ...WiredMasterField({
      //     label: 'Email Type',
      //     name: 'emailTypeCode',
      //     code: 'email_type_code',
      //     required: requiredField,
      //     filter: { limit: 20 },
      //     cache: false,
      //   }),
      // },
      {
        ...WiredMasterField({
          code: 'appointment_type',
          filter: { limit: 20 },
          name: 'typeCode',
          label: 'Appointment Type',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 1,
          placeholder: 'Select',
          cache: false,
          dependencies: {
            keys: ['emailTypeCode'],
            calc: showAppointTypeField,
          },
        }),
      },
      {
        inputType: 'text',
        type: 'email',
        name: 'replyTo',
        textLabel: 'Reply To',
        required: requiredField,
        pattern: regEmail,
        maxLength: { ...inputLength.email },
        colSpan: 1,
      },
      {
        inputType: 'text',
        name: 'subject',
        textLabel: 'Email Subject',
        required: requiredField,
        colSpan: 2,
        maxLength: { ...inputLength.commonTextLength },
        pattern: {},
      },
      {
        component: () => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1rem',
              gap: '2px',
            }}
          >
            <LoadingButton
              variant="outlinedSecondary"
              label="Questionnier"
              sx={{ height: 30, borderRadius: 20 }}
              onClick={() => handleForms('FT_QUESTIONNAIRES')}
            />
            <LoadingButton
              variant="outlinedSecondary"
              label="Consent"
              sx={{ height: 30, borderRadius: 20 }}
              onClick={() => handleForms('FT_CONSENT_FORMS')}
            />
          </div>
        ),
        colSpan: 0.3,
        cstSx: {
          paddingLeft: '10px !important',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        },
        dependencies: {
          keys: ['emailTypeCode'],
          calc: showForms,
        },
      },
      {
        inputType: 'editor',
        name: 'template',
        gridProps: { md: 12, width: '100%' },
        required: requiredField,
        dropDownOptions: initialSuperadminTemplateTokens, // passing default dropDownOptions
        colSpan: 2,
        getEditorOnReady: getPlanEditor,
      },
    ],
    [handleForms]
  );

  const form = useForm({ mode: 'onChange' });

  const {
    handleSubmit,
    setError,
    formState: { dirtyFields },
  } = form;

  useEffect(() => {
    if (apiResponse) {
      showSnackbar({
        severity: 'success',
        message: !type ? successMessage.create : successMessage.update,
      });
      Events.trigger(`REFRESH-TABLE-${SUPER_ADMIN_EMAIL_TEMPLATE_DATA}`);
      clear();
      closeForm();
    }
  }, [apiResponse, clear, closeForm, type]);

  const handleSaveAccountDetails = useCallback(
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
        console.log('payload, templateId', { payload, templateId });
        apiHandler(payload, `/${templateId}`);
      } else {
        console.log('payload', { payload });
        apiHandler({ data: payload });
      }
    },
    [apiHandler, dirtyFields, setError, templateId]
  );

  const header = useMemo(
    () => ({
      title: templateId ? 'Edit Email Template' : 'Add Email Template',
    }),
    [templateId]
  );

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Save',
          disabled: loading,
          loading,
          action: handleSubmit(handleSaveAccountDetails),
        },
        {
          name: 'Close',
          action: closeForm,
          variant: 'text',
          style: {
            boxShadow: 'none',
            color: palette.common.black,
            backgroundColor: palette.common.white,
          },
        },
        // { name: "Send me Test Email", disabled: true },  @Todo need to be add later as per requirement
      ],
    }),
    [closeForm, handleSaveAccountDetails, handleSubmit, loading]
  );

  return (
    <ModalComponent
      header={header}
      footer={footer}
      open={open}
      onClose={closeForm}
    >
      <CardContent>
        <CustomForm
          formGroups={emailTemplateFormGroups}
          columnsPerRow={2}
          defaultValue={defaultValue}
          form={form}
        />
      </CardContent>
      {showFormModal && (
        <ModalComponent
          open={showFormModal}
          header={{
            title: `Show ${
              selectedformType.includes('CONSENT')
                ? 'Consent'
                : 'Questionnaires'
            } Form`,
            closeIconAction: closeFormModal,
          }}
          modalStyle={{ width: '100%' }}
        >
          <FormsTable
            type={selectedformType}
            planEditorRef={planEditorRef}
            closeFormModal={closeFormModal}
          />
        </ModalComponent>
      )}
    </ModalComponent>
  );
}
