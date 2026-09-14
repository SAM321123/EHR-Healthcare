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
import {
  WiredMasterAutoComplete,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';
import { EMAIL_TEMPLATE_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import { initialTemplateTokens } from './defaultValues';
import { successMessage } from 'src/lib/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import FormsTable from './FormsTable';
export default function EmailTemplateForm(props) {
  const { formState, closeForm = () => { } } = props || {};

  const { open, defaultValue = {}, id: templateId, type } = formState;
  const planEditorRef = useRef(null);

  const [templateTokens, setTemplateTokens] = useState(initialTemplateTokens);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedformType, setSelectedFormType] = useState(null);

  const templateTypeMasterData = useSelector((state) =>
    state?.crud?.get('wired-select-emailTypeId')?.get('read')?.get('data')
  );

  const [apiResponse, , loading, apiHandler, clear] = useCRUD({
    id: 'EmailTemplateForm',
    type,
    url: API_URL.emailComposed,
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
  const calcTemplateToken = useCallback(
    (data) => {
      const selected = Array.isArray(templateTypeMasterData)
        ? templateTypeMasterData.find((item) => item.id === data.emailTypeId)
        : undefined;
      const templateBody = selected?.template || '';

      if (!data?.emailTypeId) return { hide: false };

      // 🔹 Template body

      // 🔥 Inject into editor
      if (planEditorRef.current && templateBody) {
        planEditorRef.current.setData(templateBody);
      }

      return { hide: false };
    },
    [templateTypeMasterData]
  );

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
  // ✅ ROLE OPTIONS (THIS IS THE FIX)
  const roleOptions = [
    { label: 'RN', value: 'RN' },
    { label: 'Practitioner', value: 'Practitioner' },
    { label: 'Clinic Admin', value: 'Clinic Admin' },
  ];

  const clinicOptions = [
    { label: 'Appolo Hospital', value: 'appolohospital' },
    { label: 'Indresh Hospital', value: 'indreshhospital' },
    { label: 'Fortise Hospital', value: 'fortisehospital' },
  ];
  const showClinicAndRoleFields = (data) => {
    console.log(data, 'data');
    if (data.selectionMode && data.selectionMode === 'manual') {
      return { hide: false };
    }
    return { hide: true };
  };

  const emailTemplateFormGroups = useMemo(
    () => [
      {
        inputType: 'radio',
        name: 'selectionMode',
        textLabel: 'Select Type',
        required: requiredField,
        options: [
          { label: 'Select All', value: 'all' },
          { label: 'Select Manually', value: 'manual' },
        ],
        colSpan: 2,
      },

      // 🔹 ROW 1 — Clinic + Role
      {
        ...WiredMasterAutoComplete({
          url: API_URL.adminPractices,
          label: 'Clinic Name *',
          name: 'clinicNames',
          colSpan: 1,
          placeholder: 'Search by practice',
          cache: false,
          labelAccessor: 'name',
          valueAccessor: 'id',
          // required: requiredField,
          showDescription: true,
          params: { limit: 50 },
          multiple: true,
          fetchInitial: true,
          dependencies: {
            keys: ['selectionMode'],
            calc: showClinicAndRoleFields,
          },
        }),
      },
      {
        inputType: 'wiredSelect',
        name: 'role',
        textLabel: 'Role *',
        // required: requiredField,
        options: roleOptions,
        multiple: true,
        placeholder: 'Select role',
        colSpan: 1,
        dependencies: {
          keys: ['selectionMode'],
          calc: showClinicAndRoleFields,
        },
      },
      {
        ...WiredMasterField({
          label: 'Email Type',
          name: 'emailTypeId',
          url: `${API_URL.adminEmailTemplates}/all`,
          required: requiredField,
          filter: { limit: 50 },
          cache: false,
          valueAccessor: ['id'],
          // render: ({ data }) => {
          //   return (
          //     <LoadingButton
          //       variant="outlinedSecondary"
          //       onClick={() => onRowClick(data)}
          //       label={'Add Keyword'}
          //     />
          //   );
          // },
        }),
      },
      // {
      //   component: ({ form }) => {
      //     const selected = form.watch('emailTypeCode');

      //     if (!selected) return null;

      //     return (
      //       <div style={{ marginTop: 6 }}>
      //         <TableTextRendrer>
      //           {selected?.name || selected?.label || 'N/A'}
      //         </TableTextRendrer>
      //       </div>
      //     );
      //   },
      //   colSpan: 2,
      // },
      // {
      //   component: () => (
      //     <div
      //       style={{
      //         display: 'flex',
      //         alignItems: 'center',
      //         marginTop: '1rem',
      //         gap: '2px',
      //       }}
      //     >
      //       <LoadingButton
      //         variant="outlinedSecondary"
      //         label="Questionnier"
      //         sx={{ height: 30, borderRadius: 20 }}
      //         onClick={() => handleForms('FT_QUESTIONNAIRES')}
      //       />
      //       <LoadingButton
      //         variant="outlinedSecondary"
      //         label="Consent"
      //         sx={{ height: 30, borderRadius: 20 }}
      //         onClick={() => handleForms('FT_CONSENT_FORMS')}
      //       />
      //     </div>
      //   ),
      //   colSpan: 0.3,
      //   cstSx: {
      //     paddingLeft: '10px !important',
      //     height: '100%',
      //     display: 'flex',
      //     alignItems: 'center',
      //   },
      //   dependencies: {
      //     keys: ['emailTypeCode'],
      //     calc: showForms,
      //   },
      // },
      // {
      //   inputType: 'editor',
      //   name: 'template',
      //   gridProps: { md: 12, width: '100%' },
      //   required: requiredField,
      //   dependencies: {
      //     keys: ['emailTypeId'],
      //     calc: calcTemplateToken,
      //   },
      //   colSpan: 2,
      //   getEditorOnReady: getPlanEditor,
      // },
    ],
    [calcTemplateToken, templateTokens, handleForms]
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
      Events.trigger(`REFRESH-TABLE-${EMAIL_TEMPLATE_DATA}`);
      clear();
      closeForm();
    }
  }, [apiResponse, clear, closeForm, type]);

  const handleSaveAccountDetails = useCallback(
    (data) => {
      // console.log('hhaaaaaaa11111111111')
      let payload = { ...data };
      // console.log('hhaaaaaaa22222222')
      // if (!payload.template) {
      //   setError('template', true);
      //   return;
      // }
      //  console.log('hhaaaaaaa')
      if (payload.selectionMode === 'manual') {
        let hasError = false;
        if (isEmpty(payload.role)) {
          setError('role', true);
          hasError = true;
        }

        if (isEmpty(payload.clinicNames)) {
          setError('clinicNames', true);
          hasError = true;
        }


        if (hasError) return;
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
    [apiHandler, dirtyFields, setError, templateId]
  );

  const header = useMemo(
    () => ({
      title: templateId ? 'Edit Email Compose' : 'Add Email Compose',
    }),
    [templateId]
  );

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Send',
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
      modalStyle={{ width: '100%' }}

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
          modalStyle={{ width: '100vw', height: '100vh' }}
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
